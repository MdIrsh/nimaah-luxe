import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ArrowRight, ShoppingBag, ShieldCheck, Tag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { getProductImageUrl, handleImageError, FALLBACK_PRODUCT_IMAGE } from '../utils/imageUtils';

export const CartPage = () => {
  const {
    cart,
    itemsCount,
    subtotal,
    discountAmount,
    shippingFee,
    estimatedTax,
    grandTotal,
    coupon,
    couponError,
    updateQuantity,
    updateItemSize,
    removeFromCart,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const navigate = useNavigate();

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (couponInput) {
      // Support NIMAAH20, STYLEHUB20, LUXE15
      if (couponInput.toUpperCase() === 'NIMAAH20') {
        applyCoupon('STYLEHUB20'); // 20%
      } else {
        applyCoupon(couponInput);
      }
      setCouponInput('');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-28 text-center space-y-7">
        <div className="w-24 h-24 bg-[#E9E1D6]/50 rounded-full flex items-center justify-center mx-auto text-[#C5A059] border border-[#C5A059]/30">
          <ShoppingBag size={36} />
        </div>
        <h1 className="font-serif-luxury text-4xl sm:text-5xl text-[#29251F]">Your Shopping Bag Is Empty</h1>
        <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto leading-relaxed font-light">
          Explore Ni'maah Luxe's haute couture evening gowns, Banarasi handloom sarees, and tailored pieces to begin your curation.
        </p>
        <div className="pt-2">
          <Link
            to="/shop"
            className="inline-block px-10 py-4 bg-[#29251F] text-white hover:bg-[#C5A059] text-xs uppercase tracking-[0.22em] font-semibold transition shadow-md"
          >
            Explore Collections
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="border-b border-[#E9E1D6] pb-8 mb-10">
        <span className="text-[11px] uppercase tracking-[0.35em] text-[#C5A059] font-cinzel font-semibold">
          Curated Selection
        </span>
        <h1 className="font-serif-luxury text-4xl sm:text-5xl text-[#29251F] mt-1.5">
          Your Shopping Bag ({itemsCount} {itemsCount === 1 ? 'Creation' : 'Creations'})
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
        {/* Cart Items List */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white border border-[#E9E1D6] divide-y divide-[#E9E1D6] shadow-xs">
            {cart.map((item) => {
              const rawImg =
                (Array.isArray(item.product?.images) && item.product.images[0]) ||
                item.product?.image ||
                item.image ||
                '';
              const image = getProductImageUrl(rawImg);

              return (
                <div key={item.cartItemId} className="p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                  {/* Thumbnail & Title */}
                  <div className="flex items-center space-x-6">
                    <Link
                      to={`/product/${item.product?._id || item.product}`}
                      className="w-20 h-28 bg-[#FAF9F6] border border-[#E9E1D6] flex-shrink-0 overflow-hidden block shadow-2xs"
                    >
                      <img
                        src={image}
                        alt={item.product?.title || item.title || 'Product'}
                        onError={handleImageError}
                        className="w-full h-full object-cover object-top"
                      />
                    </Link>

                    <div className="space-y-1.5">
                      <span className="text-[10px] uppercase tracking-[0.2em] text-[#C5A059] font-cinzel font-semibold">
                        {item.product.category}
                      </span>
                      <Link to={`/product/${item.product._id}`} className="hover:text-[#A68B66] transition">
                        <h3 className="font-serif-luxury text-lg text-[#29251F] font-normal leading-snug">
                          {item.product.title}
                        </h3>
                      </Link>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 pt-1 font-light">
                        <label className="flex items-center space-x-1.5">
                          <span>Size:</span>
                          <select
                            value={item.size}
                            onChange={(e) => updateItemSize(item.cartItemId, e.target.value)}
                            className="bg-[#FAF9F6] border border-[#E9E1D6] px-2 py-0.5 text-xs font-semibold text-[#29251F] focus:outline-none focus:border-[#C5A059]"
                          >
                            {(item.product?.sizes && item.product.sizes.length > 0
                              ? item.product.sizes
                              : ['XS', 'S', 'M', 'L', 'XL', 'XXL']
                            ).map((sz) => (
                              <option key={sz} value={sz}>
                                {sz}
                              </option>
                            ))}
                          </select>
                        </label>
                        <span>Color: <strong className="text-[#29251F] font-semibold">{item.color}</strong></span>
                      </div>

                      <div className="text-sm font-semibold text-[#29251F] font-serif-luxury sm:hidden pt-2">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>

                  {/* Quantity & Actions */}
                  <div className="flex items-center justify-between sm:justify-end space-x-7 w-full sm:w-auto">
                    {/* Quantity Selector */}
                    <div className="flex items-center border border-[#E9E1D6] bg-[#FAF9F6]">
                      <button
                        onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                        className="px-3 py-1.5 text-xs hover:bg-gray-200 transition font-bold"
                      >
                        -
                      </button>
                      <span className="px-3.5 py-1.5 text-xs font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                        className="px-3 py-1.5 text-xs hover:bg-gray-200 transition font-bold"
                      >
                        +
                      </button>
                    </div>

                    {/* Total Price */}
                    <div className="text-right hidden sm:block min-w-28">
                      <span className="font-serif-luxury text-lg font-semibold text-[#29251F]">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                      <span className="block text-[10px] text-gray-400 font-light">
                        ₹{item.price.toLocaleString('en-IN')} each
                      </span>
                    </div>

                    {/* Delete item */}
                    <button
                      onClick={() => removeFromCart(item.cartItemId)}
                      className="p-2 text-gray-400 hover:text-red-600 transition"
                      title="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500 pt-2">
            <Link to="/shop" className="hover:text-[#29251F] underline uppercase tracking-[0.2em] font-medium">
              &larr; Continue Exploring Collections
            </Link>
          </div>
        </div>

        {/* Order Summary Card with Generous Padding */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-[#E9E1D6] p-7 sm:p-8 space-y-7 shadow-xs">
            <h3 className="font-serif-luxury text-2xl text-[#29251F] border-b border-[#E9E1D6] pb-4">
              Order Summary
            </h3>

            {/* Price Calculations */}
            <div className="space-y-3.5 text-xs text-gray-600 font-light">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="text-[#29251F] font-semibold">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>

              {coupon && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Promotional Privilege ({coupon.code})</span>
                  <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>White-Glove Delivery</span>
                <span>
                  {shippingFee === 0 ? (
                    <span className="text-emerald-700 font-semibold uppercase text-[10px] tracking-wider">
                      Complimentary
                    </span>
                  ) : (
                    `₹${shippingFee.toLocaleString('en-IN')}`
                  )}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Estimated Luxury Apparel GST (5%)</span>
                <span>₹{estimatedTax.toLocaleString('en-IN')}</span>
              </div>

              <div className="border-t border-[#E9E1D6] pt-5 flex justify-between items-baseline text-base font-semibold text-[#29251F]">
                <span className="uppercase tracking-wider text-xs">Total Amount</span>
                <span className="font-serif-luxury text-3xl text-[#29251F]">
                  ₹{grandTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Coupon Code Input */}
            <div className="border-t border-[#E9E1D6] pt-5">
              {coupon ? (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800">
                  <div className="flex items-center space-x-2">
                    <Tag size={14} />
                    <span>Coupon <strong>{coupon.code}</strong> applied ({coupon.discountPercent}%)</span>
                  </div>
                  <button onClick={removeCoupon} className="text-emerald-900 underline text-[10px] uppercase font-bold">
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="space-y-2.5">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Coupon Code (e.g. NIMAAH20)"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="flex-1 text-xs bg-[#FAF9F6] border border-[#E9E1D6] px-3.5 py-2.5 uppercase tracking-wider focus:outline-none focus:border-[#C5A059]"
                    />
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-[#29251F] text-white text-xs uppercase tracking-widest font-semibold hover:bg-[#C5A059] transition"
                    >
                      Apply
                    </button>
                  </div>
                  {couponError && <p className="text-[11px] text-red-600">{couponError}</p>}
                </form>
              )}
            </div>

            {/* Proceed to Checkout Button */}
            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-4.5 bg-[#29251F] hover:bg-[#C5A059] text-white text-xs uppercase tracking-[0.22em] font-semibold transition flex items-center justify-center space-x-2.5 shadow-lg"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={16} />
            </button>

            <div className="flex items-center justify-center space-x-2 text-[10.5px] text-gray-500 uppercase tracking-wider pt-1 font-light">
              <ShieldCheck size={14} className="text-[#C5A059]" />
              <span>256-Bit Encrypted Bank Grade Checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
