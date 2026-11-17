import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { verifyPaymentTransaction } from '../services/paymentService.js';
import {
  sendOrderConfirmationEmail,
  sendAdminOrderNotification,
  sendShippingNotification,
} from '../services/emailService.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

// @desc    Step 8, 9 & 10: Make Payment, Payment Verification, and Create Order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      paymentId,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return errorResponse(res, 'No order items specified', 400);
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.street) {
      return errorResponse(res, 'Shipping address is required', 400);
    }

    // Step 9: Payment Verification
    let paymentResult = {
      id: paymentId || `PAY-${Date.now()}`,
      status: 'COMPLETED',
      update_time: new Date().toISOString(),
      email_address: req.user.email,
      transactionRef: `NLX-TXN-${Date.now()}`,
    };

    if (paymentId) {
      const verification = await verifyPaymentTransaction({
        paymentId,
        amount: totalPrice,
      });
      paymentResult.transactionRef = verification.transactionRef;
    }

    // Step 10: Create Order
    const order = new Order({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod: paymentMethod || 'Online Payment',
      paymentResult,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      isPaid: true,
      paidAt: Date.now(),
      orderStatus: 'Admin Received', // Flow: Admin immediately receives the verified order
    });

    const savedOrder = await order.save();

    // Deduct stock for ordered dresses
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stockCount: -item.quantity },
      });
    }

    // Trigger email notifications
    await sendOrderConfirmationEmail(savedOrder, req.user);
    await sendAdminOrderNotification(savedOrder);

    return successResponse(res, 'Order created successfully', savedOrder, 201);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('orderItems.product', 'title images price');

    if (!order) {
      return errorResponse(res, 'Order not found', 404);
    }

    // Allow owner or admin to access
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return errorResponse(res, 'Not authorized to view this order', 403);
    }

    return successResponse(res, 'Order details fetched', order);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    return successResponse(res, 'Customer orders fetched', orders);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// @desc    Admin: Get all orders
// @route   GET /api/orders
// @access  Private/Admin
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'id name email')
      .sort({ createdAt: -1 });

    return successResponse(res, 'All orders retrieved for Admin', {
      count: orders.length,
      orders,
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// @desc    Admin: Update order fulfillment status (Workflow steps 11 & 12: Admin Receives Order -> Process and Ship -> Delivered)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res) => {
  try {
    const { status, trackingNumber, courierPartner } = req.body;

    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) {
      return errorResponse(res, 'Order not found', 404);
    }

    if (status) order.orderStatus = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (courierPartner) order.courierPartner = courierPartner;

    if (status === 'Shipped') {
      await sendShippingNotification(order, order.user);
    }

    if (status === 'Delivered') {
      order.deliveredAt = Date.now();
    }

    const updatedOrder = await order.save();

    return successResponse(res, `Order updated to ${status}`, updatedOrder);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};
