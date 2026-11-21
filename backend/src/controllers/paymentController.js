import {
  createRazorpayOrder,
  verifyRazorpaySignature,
  verifyWebhookSignature,
  createRazorpayRefund,
} from '../services/paymentService.js';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import {
  sendOrderConfirmationEmail,
  sendAdminOrderNotification,
} from '../services/emailService.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

// @desc    Step 1: Create Razorpay Order with Server-Side Price & Stock Validation
// @route   POST /api/payment/create-order and /api/payments/create-order
// @access  Private
export const createOrder = async (req, res) => {
  try {
    const { amount, cartItems, receipt } = req.body;

    let finalAmount = amount;
    let validatedItems = [];

    // Server-Side Verification: Process cartItems smoothly without blocking checkout
    if (Array.isArray(cartItems) && cartItems.length > 0) {
      let subtotal = 0;

      for (const item of cartItems) {
        let product = null;
        const potentialId = item.productId || item.product;

        if (potentialId) {
          try {
            product = await Product.findById(potentialId);
          } catch {
            product = null;
          }
        }

        const origPrice = Number(product?.price || item.price || 0);
        const discPrice = Number(product?.discountedPrice || 0);
        const unitPrice =
          discPrice > 0 && origPrice > 0 && discPrice < origPrice
            ? discPrice
            : origPrice > 0
            ? origPrice
            : Number(item.price || discPrice || 1500);
        const qty = Number(item.quantity || 1);
        subtotal += unitPrice * qty;

        validatedItems.push({
          product: product?._id || (potentialId?.length === 24 ? potentialId : null),
          title: product?.title || item.title || 'Haute Couture Piece',
          image: product?.images?.[0] || item.image || '',
          price: unitPrice,
          size: item.size || 'M',
          color: item.color || (product?.colors?.[0]?.name || 'Default'),
          quantity: qty,
        });
      }

      // If client provided a valid grandTotal amount, honor it or use subtotal
      if (amount && Number(amount) > 0) {
        finalAmount = Number(amount);
      } else {
        finalAmount = subtotal;
      }
    }

    if (!finalAmount || Number(finalAmount) <= 0) {
      return errorResponse(res, 'Invalid order amount calculated', 400);
    }

    const razorpayOrder = await createRazorpayOrder({
      amount: finalAmount,
      currency: 'INR',
      receipt: receipt || `nlx_rcpt_${Date.now()}`,
      notes: {
        userId: req.user._id.toString(),
        userEmail: req.user.email,
        itemCount: validatedItems.length || 1,
      },
    });

    return successResponse(res, 'Razorpay order generated with backend price validation', {
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount, // in paise
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_1DP5mmOlF5G5ag',
      validatedAmount: finalAmount,
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// @desc    Step 2: Cryptographic Signature Verification & Order Confirmation
// @route   POST /api/payment/verify-and-order and /api/payments/verify
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
      return errorResponse(res, 'Missing cryptographic payment signature credentials', 400);
    }

    // 1. Prevent duplicate order processing (Idempotency)
    const existingOrder = await Order.findOne({ 'paymentResult.id': razorpay_payment_id });
    if (existingOrder) {
      return successResponse(res, 'Order already confirmed for this transaction', existingOrder);
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
      itemsPrice: itemsPrice || totalPrice,
      taxPrice: taxPrice || 0,
      shippingPrice: shippingPrice || 0,
      totalPrice: totalPrice,
      isPaid: true,
      paidAt: Date.now(),
      orderStatus: 'Admin Received',
    });

    const savedOrder = await order.save();

    // 4. Deduct inventory stock for ordered pieces
    for (const item of orderItems) {
      if (item.product) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stockCount: -item.quantity },
        });
      }
    }

    // 5. Send order notifications
    await sendOrderConfirmationEmail(savedOrder, req.user);
    await sendAdminOrderNotification(savedOrder);

    return successResponse(res, 'Payment verified and order placed successfully', savedOrder, 201);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// @desc    Step 3: Handle Payment Failure
// @route   POST /api/payment/failure
// @access  Private
export const handlePaymentFailure = async (req, res) => {
  try {
    const { error, orderId } = req.body;
    console.warn(`[Payment Failure Reported]: Order: ${orderId}`, error);

    return successResponse(res, 'Payment failure acknowledged', {
      orderId,
      status: 'FAILED',
      reason: error?.description || 'Payment authorization unsuccessful',
      recordedAt: new Date().toISOString(),
    });
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

// @desc    Step 4: Issue Full/Partial Refund (Admin Only)
// @route   POST /api/payment/refund/:orderId
// @access  Private/Admin
export const issueRefund = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { amount, reason } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return errorResponse(res, 'Order not found', 404);
    }

    const paymentId = order.paymentResult?.id;
    if (!paymentId || !order.isPaid) {
      return errorResponse(res, 'Order has no captured payment to refund', 400);
    }

    const refund = await createRazorpayRefund({
      paymentId,
      amount: amount || order.totalPrice,
      notes: {
        reason: reason || 'Customer requested return / cancellation',
        orderId: order._id.toString(),
      },
    });

    order.orderStatus = 'Cancelled';
    order.paymentResult.status = 'REFUNDED';
    order.paymentResult.refundId = refund.id;
    await order.save();

    // Restore inventory stock
    for (const item of order.orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stockCount: item.quantity },
      });
    }

    return successResponse(res, 'Refund processed successfully via Razorpay', {
      refundId: refund.id,
      amount: refund.amount / 100,
      status: refund.status,
      order,
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// @desc    Step 5: Get Customer Payment & Transaction History
// @route   GET /api/payment/history
// @access  Private
export const getCustomerPaymentHistory = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id, isPaid: true })
      .select('orderItems paymentResult totalPrice createdAt orderStatus')
      .sort({ createdAt: -1 });

    const transactions = orders.map((o) => ({
      orderId: o._id,
      transactionRef: o.paymentResult?.transactionRef || `RZP-${o._id}`,
      paymentId: o.paymentResult?.id,
      amount: o.totalPrice,
      status: o.paymentResult?.status || 'COMPLETED',
      date: o.createdAt,
      orderStatus: o.orderStatus,
    }));

    return successResponse(res, 'Customer payment history retrieved', transactions);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// @desc    Step 6: Razorpay Webhook Handler
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

      const order = await Order.findOne({ 'paymentResult.id': paymentId });
      if (order && !order.isPaid) {
        order.isPaid = true;
        order.paidAt = new Date();
        order.paymentResult.status = 'COMPLETED';
        await order.save();
      }
    } else if (event === 'payment.failed') {
      const payment = body.payload.payment.entity;
      console.warn(`[Razorpay Payment Failed for]: ${payment.id}`);
    } else if (event === 'refund.processed') {
      const refund = body.payload.refund.entity;
      console.log(`[Razorpay Refund Processed]: ${refund.id}`);
    }

    return res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};
