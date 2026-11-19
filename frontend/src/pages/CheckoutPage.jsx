import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  CreditCard,
  QrCode,
  Building,
  CheckCircle2,
  Lock,
  ArrowRight,
  Package,
  Crown,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/orderService';
import { paymentService } from '../services/paymentService';
import logoImg from '../assets/nimaah-luxe-logo.png';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const CheckoutPage = () => {
  const { cart, subtotal, discountAmount, shippingFee, estimatedTax, grandTotal, clearCart } =
    useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: user?.addresses?.[0]?.fullName || user?.name || '',
    phone: user?.addresses?.[0]?.phone || '',
    street: user?.addresses?.[0]?.street || '',
    city: user?.addresses?.[0]?.city || '',
    state: user?.addresses?.[0]?.state || '',
    postalCode: user?.addresses?.[0]?.postalCode || '',
    country: 'India',
  });

  const [paymentMethod, setPaymentMethod] = useState('Razorpay (UPI / Card / NetBanking)');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState('');
  const [createdOrder, setCreatedOrder] = useState(null);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePaymentAndOrder = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    if (!formData.fullName || !formData.phone || !formData.street || !formData.city || !formData.postalCode) {
      alert('Please fill out all mandatory shipping address fields.');
      return;
    }

    setIsProcessing(true);
    setProcessingStage('Connecting to Razorpay Secure Gateway...');

    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error('Razorpay SDK failed to load. Please verify your internet connection.');
      }

      // Step 1: Call backend to create Razorpay Order
      setProcessingStage('Generating encrypted Razorpay Order ID on backend...');
      const razorpayOrderData = await paymentService.createRazorpayOrder(grandTotal);

      // Step 2: Open Razorpay Checkout modal
      setProcessingStage('Awaiting Razorpay payment authorization...');

      const options = {
        key: razorpayOrderData.keyId,
        amount: razorpayOrderData.amount,
        currency: razorpayOrderData.currency,
        name: "Ni'maah Luxe",
        description: 'Luxury Boutique Haute Couture Acquisition',
        image: logoImg,
        order_id: razorpayOrderData.orderId,
        prefill: {
          name: formData.fullName,
          email: user?.email || '',
          contact: formData.phone || '',
        },
        theme: {
          color: '#29251F',
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
            setProcessingStage('');
          },
        },
        handler: async function (response) {
          // Step 3: Payment captured on frontend, verify signature on backend
          setIsProcessing(true);
          setProcessingStage('Verifying HMAC SHA256 payment signature with bank...');

          try {
            const verifyPayload = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderItems: cart.map((item) => ({
                product: item.product._id,
                title: item.product.title,
                image: item.product.images?.[0] || '',
                price: item.price,
                size: item.size,
                color: item.color,
                quantity: item.quantity,
              })),
              shippingAddress: formData,
              itemsPrice: subtotal,
              taxPrice: estimatedTax,
              shippingPrice: shippingFee,
              totalPrice: grandTotal,
            };

            const verifiedOrder = await paymentService.verifyPayment(verifyPayload);
            setCreatedOrder(verifiedOrder);
            clearCart();
          } catch (verifyError) {
            console.error('Payment verification failed:', verifyError);
            alert(
              verifyError.response?.data?.message ||
                'Payment verification failed. Please contact boutique support.'
            );
          } finally {
            setIsProcessing(false);
            setProcessingStage('');
          }
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.on('payment.failed', function (response) {
        setIsProcessing(false);
        setProcessingStage('');
        alert(`Payment Failed: ${response.error.description}`);
      });
      paymentObject.open();
    } catch (error) {
      console.error('Razorpay initialization error:', error);
      alert(error.message || 'Payment initiation failed. Please try again.');
      setIsProcessing(false);
      setProcessingStage('');
    }
  };

  if (createdOrder) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-7">
        <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#C5A059] mx-auto p-1 shadow-lg bg-white">
          <img src={logoImg} alt="Ni'maah Luxe" className="w-full h-full object-cover rounded-full" />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] uppercase tracking-[0.35em] text-[#C5A059] font-cinzel font-semibold block">
            Acquisition Confirmed
          </span>
          <h1 className="font-serif-luxury text-4xl sm:text-6xl text-[#29251F]">
            Thank You, {formData.fullName}
          </h1>
          <p className="text-sm text-gray-600 max-w-lg mx-auto font-light leading-relaxed">
            Your couture order has been verified and safely received by the Ni'maah Luxe Atelier. Master artisans are now preparing your pieces.
          </p>
        </div>

        {/* Order Details Receipt Card with Balanced Padding */}
        <div className="bg-white border border-[#E9E1D6] p-7 sm:p-9 text-left space-y-4 max-w-xl mx-auto shadow-sm">
          <div className="flex justify-between border-b border-[#FAF9F6] pb-3 text-xs">
            <span className="text-gray-400 uppercase tracking-wider font-light">Order Reference</span>
            <strong className="text-[#29251F] font-mono">{createdOrder._id}</strong>
          </div>

          <div className="flex justify-between border-b border-[#FAF9F6] pb-3 text-xs">
            <span className="text-gray-400 uppercase tracking-wider font-light">Transaction Ref</span>
            <span className="text-[#C5A059] font-mono font-medium">
              {createdOrder.paymentResult?.transactionRef || 'NLX-VERIFIED-TXN'}
            </span>
          </div>

          <div className="flex justify-between border-b border-[#FAF9F6] pb-3 text-xs">
            <span className="text-gray-400 uppercase tracking-wider font-light">Fulfillment Status</span>
            <span className="px-3 py-1 bg-[#FAF9F6] text-[#29251F] font-bold border border-[#E9E1D6]">
              {createdOrder.orderStatus || 'Admin Received'}
            </span>
          </div>

          <div className="flex justify-between text-xs pt-1">
            <span className="text-gray-400 uppercase tracking-wider font-light">Amount Verified</span>
            <strong className="text-xl font-serif-luxury text-[#29251F]">
              ₹{createdOrder.totalPrice?.toLocaleString('en-IN') || grandTotal.toLocaleString('en-IN')}
            </strong>
          </div>
        </div>

        {/* Actions with Symmetrical Padding */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            to="/account/orders"
            className="w-full sm:w-auto px-9 py-4 bg-[#29251F] text-white hover:bg-[#C5A059] text-xs uppercase tracking-[0.2em] font-semibold transition flex items-center justify-center space-x-2.5 shadow-md"
          >
            <Package size={16} />
            <span>Track Order & Delivery Status</span>
          </Link>

          <Link
            to="/shop"
            className="w-full sm:w-auto px-9 py-4 bg-white border border-[#E9E1D6] hover:border-[#A68B66] text-[#29251F] text-xs uppercase tracking-[0.2em] font-semibold transition"
          >
            Continue Browsing
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="border-b border-[#E9E1D6] pb-8 mb-10">
        <span className="text-[11px] uppercase tracking-[0.35em] text-[#C5A059] font-cinzel font-semibold">
          Final Curation
        </span>
        <h1 className="font-serif-luxury text-4xl sm:text-5xl text-[#29251F] mt-1.5">
          White-Glove Checkout
        </h1>
      </div>

      <form onSubmit={handlePaymentAndOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
        {/* Left Form: Address and Payment */}
        <div className="lg:col-span-7 space-y-10">
          {/* Step 7: Enter Address */}
          <div className="bg-white border border-[#E9E1D6] p-7 sm:p-8 space-y-5 shadow-xs">
            <div className="flex items-center space-x-3 border-b border-[#E9E1D6] pb-4">
              <span className="w-6 h-6 rounded-full bg-[#29251F] text-white text-xs font-bold flex items-center justify-center">
                1
              </span>
              <h3 className="font-serif-luxury text-xl sm:text-2xl text-[#29251F]">
                Delivery Sanctuary Address
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="block uppercase tracking-wider text-gray-500 mb-1.5 font-medium">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-[#FAF9F6] border border-[#E9E1D6] focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block uppercase tracking-wider text-gray-500 mb-1.5 font-medium">Contact Phone</label>
                <input
                  type="text"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-[#FAF9F6] border border-[#E9E1D6] focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block uppercase tracking-wider text-gray-500 mb-1.5 font-medium">City</label>
                <input
                  type="text"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-[#FAF9F6] border border-[#E9E1D6] focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block uppercase tracking-wider text-gray-500 mb-1.5 font-medium">Street Address & Apartment</label>
                <input
                  type="text"
                  name="street"
                  required
                  value={formData.street}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-[#FAF9F6] border border-[#E9E1D6] focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block uppercase tracking-wider text-gray-500 mb-1.5 font-medium">State / Province</label>
                <input
                  type="text"
                  name="state"
                  required
                  value={formData.state}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-[#FAF9F6] border border-[#E9E1D6] focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block uppercase tracking-wider text-gray-500 mb-1.5 font-medium">Postal Code (PIN)</label>
                <input
                  type="text"
                  name="postalCode"
                  required
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-[#FAF9F6] border border-[#E9E1D6] focus:outline-none focus:border-[#C5A059]"
                />
              </div>
            </div>
          </div>

          {/* Step 8: Make Payment */}
          <div className="bg-white border border-[#E9E1D6] p-7 sm:p-8 space-y-5 shadow-xs">
            <div className="flex items-center space-x-3 border-b border-[#E9E1D6] pb-4">
              <span className="w-6 h-6 rounded-full bg-[#29251F] text-white text-xs font-bold flex items-center justify-center">
                2
              </span>
              <h3 className="font-serif-luxury text-xl sm:text-2xl text-[#29251F]">
                Payment Method Selection
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {[
                { id: 'Card', label: 'Credit / Debit Card', icon: CreditCard },
                { id: 'UPI', label: 'Instant UPI / QR', icon: QrCode },
                { id: 'NetBanking', label: 'Private Banking', icon: Building },
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id)}
                    className={`p-4 border text-left transition flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#29251F] bg-[#FAF9F6] shadow-sm'
                        : 'border-[#E9E1D6] bg-white hover:border-gray-400'
                    }`}
                  >
                    <Icon size={20} className={isSelected ? 'text-[#C5A059]' : 'text-gray-400'} />
                    <span className="text-xs font-semibold text-[#29251F] mt-3 font-cinzel">{m.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="p-4 bg-[#FAF9F6] border border-[#E9E1D6] text-xs text-gray-600 font-light leading-relaxed">
              Selected: <strong className="text-[#29251F] font-semibold">{paymentMethod}</strong>. Your transaction is verified in real-time according to the Ni'maah Luxe PCI-DSS luxury protocol.
            </div>
          </div>
        </div>

        {/* Right Summary Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-[#E9E1D6] p-7 sm:p-8 space-y-7 shadow-xs">
            <h3 className="font-serif-luxury text-2xl text-[#29251F] border-b border-[#E9E1D6] pb-4">
              Order Review
            </h3>

            <div className="space-y-4 max-h-64 overflow-y-auto pr-2 divide-y divide-[#FAF9F6]">
              {cart.map((item) => (
                <div key={item.cartItemId} className="pt-3.5 first:pt-0 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-3.5">
                    <img
                      src={item.product?.images?.[0]}
                      alt=""
                      className="w-11 h-15 object-cover border border-[#E9E1D6]"
                    />
                    <div>
                      <p className="font-semibold text-[#29251F] line-clamp-1">{item.product.title}</p>
                      <p className="text-[10px] text-gray-500 font-light">
                        Size: {item.size} • Color: {item.color} • Qty: {item.quantity}
                      </p>
                    </div>
                  </div>
                  <span className="font-serif-luxury font-semibold text-sm">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            {/* Price breakdown */}
            <div className="border-t border-[#E9E1D6] pt-5 space-y-2.5 text-xs text-gray-600 font-light">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Privilege Coupon Discount</span>
                  <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>White-Glove Courier</span>
                <span>{shippingFee === 0 ? 'Complimentary' : `₹${shippingFee}`}</span>
              </div>
              <div className="flex justify-between">
                <span>Apparel Tax (GST 5%)</span>
                <span>₹{estimatedTax.toLocaleString('en-IN')}</span>
              </div>
              <div className="border-t border-[#E9E1D6] pt-4 flex justify-between items-baseline font-semibold text-[#29251F] text-base">
                <span className="uppercase text-xs tracking-wider">Total Payable</span>
                <span className="font-serif-luxury text-3xl text-[#29251F]">
                  ₹{grandTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-4.5 bg-[#29251F] hover:bg-[#C5A059] text-white text-xs uppercase tracking-[0.22em] font-semibold transition flex flex-col items-center justify-center space-y-1 shadow-lg disabled:opacity-75"
            >
              {isProcessing ? (
                <div className="py-1 text-center space-y-1">
                  <span className="animate-pulse">{processingStage}</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Lock size={14} />
                  <span>Make Payment & Place Order</span>
                </div>
              )}
            </button>

            <div className="text-[10px] text-center text-gray-400 font-light">
              Clicking authorizes simulated instant bank payment verification and notifies the Atelier.
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;
