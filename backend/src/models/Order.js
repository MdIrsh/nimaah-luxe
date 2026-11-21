import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: false,
  },
  title: { type: String, required: true },
  image: { type: String, default: '' },
  price: { type: Number, required: true },
  size: { type: String, default: 'M' },
  color: { type: String, default: 'Default' },
  quantity: { type: Number, required: true, default: 1 },
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    orderItems: [orderItemSchema],
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, default: 'India' },
    },
    paymentMethod: {
      type: String,
      required: true,
      default: 'Card / UPI / NetBanking',
    },
    paymentResult: {
      id: { type: String },
      status: { type: String, default: 'COMPLETED' },
      update_time: { type: String },
      email_address: { type: String },
      transactionRef: { type: String },
    },
    itemsPrice: { type: Number, required: true, default: 0.0 },
    taxPrice: { type: Number, required: true, default: 0.0 },
    shippingPrice: { type: Number, required: true, default: 0.0 },
    totalPrice: { type: Number, required: true, default: 0.0 },
    isPaid: { type: Boolean, required: true, default: false },
    paidAt: { type: Date },
    // Order stages matching workflow:
    // Placed -> Confirmed / Admin Received -> Processing -> Shipped -> Delivered
    orderStatus: {
      type: String,
      required: true,
      enum: ['Order Placed', 'Admin Received', 'Processing & Tailoring', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Order Placed',
    },
    trackingNumber: { type: String, default: '' },
    courierPartner: { type: String, default: 'BlueDart Luxury Express' },
    deliveredAt: { type: Date },
  },
  { timestamps: true }
);

export const Order = mongoose.model('Order', orderSchema);
