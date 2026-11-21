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

// @desc    Get all customers with detailed order metrics & KPI analytics
// @route   GET /api/admin/customers
// @access  Private/Admin
export const getAdminCustomers = async (req, res) => {
  try {
    const customers = await User.find({ role: 'customer' })
      .select('-password')
      .sort({ createdAt: 1 });

    // Fetch order aggregation per user with status breakdowns
    const customerOrdersAgg = await Order.aggregate([
      {
        $group: {
          _id: '$user',
          orderCount: { $sum: 1 },
          totalSpent: { $sum: '$totalPrice' },
          highestOrderValue: { $max: '$totalPrice' },
          lastOrderDate: { $max: '$createdAt' },
          completedOrders: {
            $sum: { $cond: [{ $eq: ['$orderStatus', 'Delivered'] }, 1, 0] },
          },
          pendingOrders: {
            $sum: {
              $cond: [
                {
                  $in: ['$orderStatus', ['Processing', 'Shipped', 'Pending', 'Confirmed']],
                },
                1,
                0,
              ],
            },
          },
          cancelledOrders: {
            $sum: { $cond: [{ $eq: ['$orderStatus', 'Cancelled'] }, 1, 0] },
          },
          returnedOrders: {
            $sum: { $cond: [{ $eq: ['$orderStatus', 'Returned'] }, 1, 0] },
          },
        },
      },
    ]);

    const ordersMap = new Map();
    customerOrdersAgg.forEach((agg) => {
      ordersMap.set(agg._id.toString(), agg);
    });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const enrichedCustomers = customers.map((c, idx) => {
      const agg = ordersMap.get(c._id.toString());
      const defaultCustomerId = `CUST${String(idx + 1).padStart(3, '0')}`;
      const totalSpent = agg?.totalSpent || 0;
      const orderCount = agg?.orderCount || 0;
      const avgOrderValue = orderCount > 0 ? Math.round(totalSpent / orderCount) : 0;
      const highestOrder = agg?.highestOrderValue || 0;

      // Determine customer type if not explicitly set
      let derivedType = c.customerType || 'New';
      if (!c.customerType || c.customerType === 'New') {
        if (totalSpent >= 40000 || orderCount >= 5) derivedType = 'VIP';
        else if (totalSpent >= 15000 || orderCount >= 3) derivedType = 'Premium';
        else if (orderCount >= 1) derivedType = 'Regular';
        else derivedType = 'New';
      }

      const primaryAddress = c.addresses?.[0] || {};
      const phone = c.phone || primaryAddress.phone || '';
      const city = c.city || primaryAddress.city || '';

      const fullStreet = primaryAddress.street
        ? `${primaryAddress.street}${primaryAddress.city ? ', ' + primaryAddress.city : ''}${primaryAddress.state ? ', ' + primaryAddress.state : ''}${primaryAddress.postalCode ? ' - ' + primaryAddress.postalCode : ''}`
        : '';

      return {
        ...c.toObject(),
        customerId: c.customerId || defaultCustomerId,
        phone,
        city,
        status: c.status || 'Active',
        customerType: c.customerType || derivedType,
        gender: c.gender || '',
        dateOfBirth: c.dateOfBirth || '',
        isEmailVerified: c.isEmailVerified !== undefined ? c.isEmailVerified : false,
        isPhoneVerified: c.isPhoneVerified !== undefined ? c.isPhoneVerified : Boolean(phone),
        kycStatus: c.kycStatus || 'Verified',
        rewardPoints: c.rewardPoints || 0,
        storeCredit: c.storeCredit || 0,
        internalNotes: Array.isArray(c.internalNotes) ? c.internalNotes : [],
        orderCount,
        totalSpent,
        avgOrderValue,
        highestOrderValue: highestOrder,
        completedOrders: agg?.completedOrders || 0,
        pendingOrders: agg?.pendingOrders || 0,
        cancelledOrders: agg?.cancelledOrders || 0,
        returnedOrders: agg?.returnedOrders || 0,
        lastOrderDate: agg?.lastOrderDate || null,
        country: primaryAddress.country || '',
        state: primaryAddress.state || '',
        pincode: primaryAddress.postalCode || '',
        fullAddress: fullStreet,
      };
    });

    // Calculate Top Analytics KPI Metrics
    const totalCustomers = enrichedCustomers.length;
    const activeCustomers = enrichedCustomers.filter((c) => c.status === 'Active').length;
    const vipCustomers = enrichedCustomers.filter((c) => c.customerType === 'VIP').length;
    const blockedCustomers = enrichedCustomers.filter((c) => c.status === 'Blocked').length;
    const totalRevenue = enrichedCustomers.reduce((acc, c) => acc + (c.totalSpent || 0), 0);
    const totalOrdersCount = enrichedCustomers.reduce((acc, c) => acc + (c.orderCount || 0), 0);
    const avgOrderValue = totalOrdersCount > 0 ? Math.round(totalRevenue / totalOrdersCount) : 0;
    const repeatCustomers = enrichedCustomers.filter((c) => (c.orderCount || 0) >= 2).length;
    const newCustomersThisMonth = enrichedCustomers.filter(
      (c) => new Date(c.createdAt) >= startOfMonth
    ).length;

    return successResponse(res, 'Customers fetched successfully', {
      count: enrichedCustomers.length,
      customers: enrichedCustomers,
      analytics: {
        totalCustomers,
        activeCustomers,
        vipCustomers,
        blockedCustomers,
        totalRevenue,
        avgOrderValue,
        repeatCustomers,
        newCustomersThisMonth,
      },
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// @desc    Create new customer manually by Admin
// @route   POST /api/admin/customers
// @access  Private/Admin
export const createAdminCustomer = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      city,
      state,
      country,
      pincode,
      fullAddress,
      status,
      customerType,
      gender,
      dateOfBirth,
      customerId,
      initialNote,
    } = req.body;

    if (!name || !email) {
      return errorResponse(res, 'Name and email are required', 400);
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return errorResponse(res, 'Customer with this email already exists', 400);
    }

    // Auto-generate customerId if empty
    const count = await User.countDocuments({ role: 'customer' });
    const finalCustomerId = customerId?.trim() || `CUST${String(count + 1).padStart(3, '0')}`;

    const newCustomer = new User({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: 'TemporaryPassword123!', // Admin created patron default
      role: 'customer',
      customerId: finalCustomerId,
      phone: phone?.trim() || '',
      city: city?.trim() || '',
      status: status || 'Active',
      customerType: customerType || 'New',
      gender: gender || '',
      dateOfBirth: dateOfBirth || '',
      isEmailVerified: true,
      isPhoneVerified: Boolean(phone),
      kycStatus: 'Verified',
      addresses:
        fullAddress || city || phone
          ? [
              {
                fullName: name.trim(),
                phone: phone?.trim() || '',
                street: fullAddress?.trim() || '',
                city: city?.trim() || '',
                state: state?.trim() || '',
                postalCode: pincode?.trim() || '',
                country: country?.trim() || 'India',
                isDefault: true,
              },
            ]
          : [],
      internalNotes: initialNote ? [{ note: initialNote, author: 'Admin' }] : [],
    });

    await newCustomer.save();
    return successResponse(res, 'Customer created successfully', newCustomer, 201);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// @desc    Update customer details (phone, city, status, etc.)
// @route   PUT /api/admin/customers/:id
// @access  Private/Admin
export const updateAdminCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      phone,
      city,
      state,
      country,
      pincode,
      fullAddress,
      status,
      customerType,
      gender,
      dateOfBirth,
      customerId,
      rewardPoints,
      storeCredit,
      kycStatus,
    } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return errorResponse(res, 'Customer not found', 404);
    }

    if (name) user.name = name.trim();
    if (email) user.email = email.trim().toLowerCase();
    if (phone !== undefined) user.phone = phone.trim();
    if (city !== undefined) user.city = city.trim();
    if (status !== undefined) user.status = status;
    if (customerType !== undefined) user.customerType = customerType;
    if (gender !== undefined) user.gender = gender;
    if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth;
    if (customerId !== undefined) user.customerId = customerId.trim();
    if (rewardPoints !== undefined) user.rewardPoints = Number(rewardPoints);
    if (storeCredit !== undefined) user.storeCredit = Number(storeCredit);
    if (kycStatus !== undefined) user.kycStatus = kycStatus;

    // Sync primary address
    if (user.addresses && user.addresses.length > 0) {
      if (phone) user.addresses[0].phone = phone.trim();
      if (city) user.addresses[0].city = city.trim();
      if (state) user.addresses[0].state = state.trim();
      if (country) user.addresses[0].country = country.trim();
      if (pincode) user.addresses[0].postalCode = pincode.trim();
      if (fullAddress) user.addresses[0].street = fullAddress.trim();
    } else if (phone || city || fullAddress) {
      user.addresses.push({
        fullName: user.name,
        phone: phone || '',
        street: fullAddress || 'Main Boutique Street',
        city: city || 'Delhi',
        state: state || 'Delhi',
        postalCode: pincode || '110001',
        country: country || 'India',
        isDefault: true,
      });
    }

    await user.save();
    return successResponse(res, 'Customer updated successfully', user);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// @desc    Add internal note to customer
// @route   POST /api/admin/customers/:id/notes
// @access  Private/Admin
export const addCustomerNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { note, author } = req.body;

    if (!note || !note.trim()) {
      return errorResponse(res, 'Note text is required', 400);
    }

    const user = await User.findById(id);
    if (!user) {
      return errorResponse(res, 'Customer not found', 404);
    }

    user.internalNotes.unshift({
      note: note.trim(),
      author: author || 'Admin',
      createdAt: new Date(),
    });

    await user.save();
    return successResponse(res, 'Note added successfully', user.internalNotes);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// @desc    Toggle Customer Status (Block / Unblock)
// @route   PATCH /api/admin/customers/:id/status
// @access  Private/Admin
export const toggleCustomerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return errorResponse(res, 'Customer not found', 404);
    }

    user.status = status || (user.status === 'Blocked' ? 'Active' : 'Blocked');
    await user.save();

    return successResponse(res, `Customer status updated to ${user.status}`, {
      status: user.status,
    });
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// @desc    Delete Customer
// @route   DELETE /api/admin/customers/:id
// @access  Private/Admin
export const deleteAdminCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return errorResponse(res, 'Customer not found', 404);
    }
    return successResponse(res, 'Customer deleted successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};
