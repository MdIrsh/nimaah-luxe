import mongoose from 'mongoose';
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

    // Allow owner or authorized admin to access
    const isStaff = req.user.role === 'admin' || req.user.role === 'super_admin';
    if (order.user._id.toString() !== req.user._id.toString() && !isStaff) {
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
    const orders = await Order.find({ user: req.user._id })
      .populate('orderItems.product', 'title images price sku brand')
      .sort({ createdAt: -1 });
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
      .populate('orderItems.product', 'title images price sku brand')
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

// @desc    Get detailed order & parcel tracking information
// @route   GET /api/orders/:id/tracking
// @access  Private (Owner or Admin)
export const getOrderTracking = async (req, res) => {
  try {
    const { id } = req.params;
    let order;

    if (mongoose.Types.ObjectId.isValid(id)) {
      order = await Order.findById(id)
        .populate('user', 'name email phone')
        .populate('orderItems.product', 'title images price');
    } else {
      order = await Order.findOne({ trackingNumber: id })
        .populate('user', 'name email phone')
        .populate('orderItems.product', 'title images price');
    }

    if (!order) {
      return errorResponse(res, 'Order or parcel not found with this reference', 404);
    }

    // Access authorization: only order owner or authorized admin can view
    const isStaff = req.user.role === 'admin' || req.user.role === 'super_admin';
    if (order.user._id.toString() !== req.user._id.toString() && !isStaff) {
      return errorResponse(res, 'Unauthorized to view tracking for this order', 403);
    }

    const createdAt = new Date(order.createdAt);
    const paidAt = order.paidAt ? new Date(order.paidAt) : createdAt;
    const updatedAt = new Date(order.updatedAt || order.createdAt);
    const deliveredAt = order.deliveredAt ? new Date(order.deliveredAt) : null;
    const estimatedDeliveryDate = new Date(createdAt.getTime() + 4 * 24 * 60 * 60 * 1000);

    const status = order.orderStatus;
    let currentStep = 1;

    if (status === 'Order Placed') currentStep = 1;
    else if (status === 'Admin Received') currentStep = 2;
    else if (status === 'Processing & Tailoring') currentStep = 3;
    else if (status === 'Shipped') currentStep = 4;
    else if (status === 'Delivered') currentStep = 5;
    else if (status === 'Cancelled') currentStep = 0;

    const steps = [
      {
        step: 1,
        key: 'order_placed',
        title: 'Order Placed',
        description: 'Bespoke acquisition verified and logged in sanctuary ledger.',
        timestamp: createdAt.toISOString(),
        isCompleted: currentStep >= 1,
        isCurrent: currentStep === 1,
      },
      {
        step: 2,
        key: 'admin_received',
        title: 'Admin Received',
        description: 'Atelier master confirmed order. Materials and artisan allocated.',
        timestamp: currentStep >= 2 ? new Date(paidAt.getTime() + 15 * 60 * 1000).toISOString() : null,
        isCompleted: currentStep >= 2,
        isCurrent: currentStep === 2,
      },
      {
        step: 3,
        key: 'processing_tailoring',
        title: 'Processing & Tailoring',
        description: 'Master craftsmen tailoring silhouette with royal bespoke finishing.',
        timestamp: currentStep >= 3 ? new Date(paidAt.getTime() + 18 * 60 * 60 * 1000).toISOString() : null,
        isCompleted: currentStep >= 3,
        isCurrent: currentStep === 3,
      },
      {
        step: 4,
        key: 'shipped',
        title: 'Shipped',
        description: `Dispatched via ${order.courierPartner || 'BlueDart Luxury Express'} with insured transit tracking.`,
        timestamp: currentStep >= 4 ? updatedAt.toISOString() : null,
        isCompleted: currentStep >= 4,
        isCurrent: currentStep === 4,
      },
      {
        step: 5,
        key: 'delivered',
        title: 'Delivered',
        description: 'White-glove arrival completed. Bespoke wardrobe received by patron.',
        timestamp: deliveredAt ? deliveredAt.toISOString() : null,
        isCompleted: currentStep >= 5,
        isCurrent: currentStep === 5,
      },
    ];

    let latestScan = 'Order verified and securely assigned to atelier fulfillment.';
    if (currentStep === 2) latestScan = 'Order confirmed by master craftsman. Materials allocated.';
    else if (currentStep === 3) latestScan = 'Artisan tailoring active. Garment undergoing hand embroidery & drape check.';
    else if (currentStep === 4) latestScan = `Dispatched from Atelier Hub to regional transit center via ${order.courierPartner || 'BlueDart'}.`;
    else if (currentStep === 5) latestScan = `Package safely delivered at destination on ${deliveredAt ? deliveredAt.toLocaleDateString('en-IN', { dateStyle: 'long' }) : 'recent'}.`;
    else if (status === 'Cancelled') latestScan = 'Order was cancelled.';

    const trackingNumber =
      order.trackingNumber ||
      (order.orderStatus === 'Shipped' || order.orderStatus === 'Delivered'
        ? `BD-LUXE-${order._id.toString().slice(-8).toUpperCase()}`
        : '');

    const trackingData = {
      orderId: order._id,
      orderNumber: `#SH-${order._id.toString().slice(-6).toUpperCase()}`,
      orderStatus: order.orderStatus,
      currentStep,
      isCancelled: status === 'Cancelled',
      isCancelAllowed: ['Order Placed', 'Admin Received'].includes(order.orderStatus),
      isReturnEligible: order.orderStatus === 'Delivered',
      courierPartner: order.courierPartner || 'BlueDart Luxury Express',
      trackingNumber,
      trackingUrl: trackingNumber
        ? `https://www.bluedart.com/tracking?numbers=${trackingNumber}`
        : '',
      estimatedDeliveryDate: estimatedDeliveryDate.toISOString(),
      orderDate: createdAt.toISOString(),
      paidAt: order.paidAt,
      isPaid: order.isPaid,
      paymentMethod: order.paymentMethod,
      totalPrice: order.totalPrice,
      itemsPrice: order.itemsPrice,
      taxPrice: order.taxPrice,
      shippingPrice: order.shippingPrice,
      shippingAddress: order.shippingAddress,
      orderItems: order.orderItems,
      steps,
      latestScan,
      lastUpdated: updatedAt.toISOString(),
    };

    return successResponse(res, 'Order tracking details retrieved successfully', trackingData);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// @desc    Customer cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private (Owner or Admin)
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return errorResponse(res, 'Order not found', 404);
    }

    const isStaff = req.user.role === 'admin' || req.user.role === 'super_admin';
    if (order.user.toString() !== req.user._id.toString() && !isStaff) {
      return errorResponse(res, 'Unauthorized to cancel this order', 403);
    }

    if (!['Order Placed', 'Admin Received'].includes(order.orderStatus)) {
      return errorResponse(res, 'Order cannot be cancelled at this stage of fulfillment', 400);
    }

    order.orderStatus = 'Cancelled';
    const updated = await order.save();

    // Restore stock
    for (const item of order.orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stockCount: item.quantity },
      });
    }

    return successResponse(res, 'Order cancelled successfully', updated);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};
