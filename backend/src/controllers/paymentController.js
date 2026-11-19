import {
  createRazorpayOrder,
  verifyRazorpaySignature,
  verifyWebhookSignature,
} from '../services/paymentService.js';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import {
  sendOrderConfirmationEmail,
  sendAdminOrderNotification,
} from '../services/emailService.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

// @desc    Step 1: Create Razorpay Order on Gateway
// @route   POST /api/payment/create-order
// @access  Private
export const createOrder = async (req, res) => {
  try {
    const { amount, receipt } = req.body;

    if (!amount || Number(amount) <= 0) {
      return errorResponse(res, 'A valid order amount is required', 400);
    }

    const razorpayOrder = await createRazorpayOrder({
      amount,
      currency: 'INR',
      receipt: receipt || `nlx_rcpt_${Date.now()}`,
      notes: {
        userId: req.user._id.toString(),
        userEmail: req.user.email,
      },
    });

    return successResponse(res, 'Razorpay order generated', {
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount, // in paise
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_1DP5mmOlF5G5ag',
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// @desc    Step 2: Verify Razorpay Signature and Commit Order to Database
// @route   POST /api/payment/verify-and-order
// @access  Private
export const verifyAndCreateOrder = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderItems,
      shippingAddress,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return errorResponse(res, 'Incomplete Razorpay payment verification payload', 400);
    }

    // 1. Prevent duplicate order processing (Idempotency)
    const existingOrder = await Order.findOne({ 'paymentResult.id': razorpay_payment_id });
    if (existingOrder) {
      return successResponse(res, 'Order already recorded for this transaction', existingOrder);
    }

    // 2. Cryptographic HMAC SHA256 Signature Verification
    const isValidSignature = verifyRazorpaySignature({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    if (!isValidSignature) {
      return errorResponse(
        res,
        'Payment signature verification failed: Possible fraud or tampered transaction',
        400
      );
    }

    // 3. Create Verified Order Document in MongoDB Atlas
    const order = new Order({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod: 'Razorpay (Card / UPI / NetBanking)',
      paymentResult: {
        id: razorpay_payment_id,
        status: 'COMPLETED',
        update_time: new Date().toISOString(),
        email_address: req.user.email,
        transactionRef: `RZP-${razorpay_order_id}`,
      },
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      isPaid: true,
      paidAt: Date.now(),
      orderStatus: 'Admin Received',
    });

    const savedOrder = await order.save();

    // 4. Deduct inventory stock
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stockCount: -item.quantity },
      });
    }

    // 5. Send order notifications
    await sendOrderConfirmationEmail(savedOrder, req.user);
    await sendAdminOrderNotification(savedOrder);

    return successResponse(res, 'Payment verified and order placed successfully', savedOrder, 201);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// @desc    Step 3: Razorpay Asynchronous Webhook Handler
// @route   POST /api/payment/webhook
// @access  Public (Gateway Call)
export const handleWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const body = req.body;

    const isValid = verifyWebhookSignature({ body, signature });
    if (!isValid) {
      return res.status(400).json({ status: 'error', message: 'Invalid webhook signature' });
    }

    const event = body.event;
    console.log(`[Razorpay Webhook Received]: ${event}`);

    if (event === 'payment.captured') {
      const payment = body.payload.payment.entity;
      const paymentId = payment.id;

      // Update order if found
      const order = await Order.findOne({ 'paymentResult.id': paymentId });
      if (order && !order.isPaid) {
        order.isPaid = true;
        order.paidAt = new Date();
        await order.save();
      }
    } else if (event === 'payment.failed') {
      const payment = body.payload.payment.entity;
      console.warn(`[Razorpay Payment Failed for]: ${payment.id}`);
    }

    return res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};
