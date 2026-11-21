import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';
import { User } from '../models/User.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

// @desc    Get comprehensive Admin Dashboard statistics using MongoDB Aggregation
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getAdminStats = async (req, res) => {
  try {
    const [totalProducts, totalCustomers, totalOrders, revenueAgg, statusAgg, lowStockProducts, recentOrders] =
      await Promise.all([
        Product.countDocuments(),
        User.countDocuments({ role: 'customer' }),
        Order.countDocuments(),
        Order.aggregate([
          { $match: { isPaid: true } },
          { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } },
        ]),
        Order.aggregate([
          { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
        ]),
        Product.find({ stockCount: { $lt: 5 } }).select('title price stockCount images category'),
        Order.find()
          .populate('user', 'name email avatar')
          .sort({ createdAt: -1 })
          .limit(6),
      ]);

    const totalRevenue = revenueAgg[0]?.totalRevenue || 0;

    const orderStatusMap = {
      'Order Placed': 0,
      'Admin Received': 0,
      'Processing & Tailoring': 0,
      'Shipped': 0,
      'Delivered': 0,
      'Cancelled': 0,
    };

    statusAgg.forEach((item) => {
      if (item._id) {
        orderStatusMap[item._id] = item.count;
      }
    });

    return successResponse(res, 'Admin analytics retrieved successfully', {
      totalRevenue,
      totalOrders,
      totalProducts,
      totalCustomers,
      orderStatusMap,
      lowStockCount: lowStockProducts.length,
      lowStockProducts,
      recentOrders,
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// @desc    Get all customers with detailed order metrics
// @route   GET /api/admin/customers
// @access  Private/Admin
export const getAdminCustomers = async (req, res) => {
  try {
    const customers = await User.find({ role: 'customer' })
      .select('-password')
      .sort({ createdAt: 1 });

    // Fetch order aggregation per user
    const customerOrdersAgg = await Order.aggregate([
      {
        $group: {
          _id: '$user',
          orderCount: { $sum: 1 },
          totalSpent: { $sum: '$totalPrice' },
          lastOrderDate: { $max: '$createdAt' },
        },
      },
    ]);

    const ordersMap = new Map();
    customerOrdersAgg.forEach((agg) => {
      ordersMap.set(agg._id.toString(), agg);
    });

    const enrichedCustomers = customers.map((c, idx) => {
      const agg = ordersMap.get(c._id.toString());
      const defaultCustomerId = `CUST${String(idx + 1).padStart(3, '0')}`;
      return {
        ...c.toObject(),
        customerId: c.customerId || defaultCustomerId,
        phone: c.phone || c.addresses?.[0]?.phone || '',
        city: c.city || c.addresses?.[0]?.city || '',
        status: c.status || 'Active',
        orderCount: agg?.orderCount || 0,
        totalSpent: agg?.totalSpent || 0,
        lastOrderDate: agg?.lastOrderDate || null,
      };
    });

    return successResponse(res, 'Customers fetched successfully', {
      count: enrichedCustomers.length,
      customers: enrichedCustomers,
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// @desc    Update customer details (phone, city, status, etc.)
// @route   PUT /api/admin/customers/:id
// @access  Private/Admin
export const updateAdminCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, city, status, customerId } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return errorResponse(res, 'Customer not found', 404);
    }

    if (name) user.name = name.trim();
    if (email) user.email = email.trim().toLowerCase();
    if (phone !== undefined) user.phone = phone.trim();
    if (city !== undefined) user.city = city.trim();
    if (status !== undefined) user.status = status;
    if (customerId !== undefined) user.customerId = customerId.trim();

    // Sync primary address if present or create one
    if (user.addresses && user.addresses.length > 0) {
      if (phone) user.addresses[0].phone = phone.trim();
      if (city) user.addresses[0].city = city.trim();
    } else if (phone || city) {
      user.addresses.push({
        fullName: user.name,
        phone: phone || '',
        street: 'Main Boutique Street',
        city: city || 'Delhi',
        state: 'Delhi',
        postalCode: '110001',
        country: 'India',
        isDefault: true,
      });
    }

    await user.save();

    return successResponse(res, 'Customer updated successfully', user);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};
