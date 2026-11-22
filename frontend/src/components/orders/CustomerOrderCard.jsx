import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Copy,
  Check,
  Star,
  MapPin,
  Clock,
  Sparkles,
  ShoppingBag,
  Package,
} from 'lucide-react';
import VerticalOrderTimeline, { getStageIndex } from './VerticalOrderTimeline';
import { getProductImageUrl, handleImageError, FALLBACK_PRODUCT_IMAGE } from '../../utils/imageUtils';

export const CustomerOrderCard = ({ order, defaultExpanded = false }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [copiedId, setCopiedId] = useState(false);

  const orderId = order?._id || '';
  const shortOrderNum = orderId ? `#SH-${orderId.slice(-6).toUpperCase()}` : '#SH-LUXE';
  const orderStatus = order?.orderStatus || 'Order Placed';
  const stageIdx = getStageIndex(orderStatus);

  const createdAt = order?.createdAt ? new Date(order.createdAt) : new Date();
  const formattedDate = createdAt.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const copyOrderId = () => {
    if (!orderId) return;
    navigator.clipboard.writeText(orderId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Status badge styling
  const getStatusBadge = () => {
    const s = String(orderStatus).toLowerCase();
    if (s.includes('deliver')) {
      return {
        bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        dot: 'bg-emerald-500',
        label: 'Delivered',
      };
    }
    if (s.includes('ship') || s.includes('transit')) {
      return {
        bg: 'bg-blue-50 text-blue-800 border-blue-200',
        dot: 'bg-blue-500',
        label: 'In Transit / Shipped',
      };
    }
    if (s.includes('tailor') || s.includes('process')) {
      return {
        bg: 'bg-amber-50 text-amber-900 border-amber-200',
        dot: 'bg-amber-500',
        label: 'Processing & Tailoring',
      };
    }
    if (s.includes('admin') || s.includes('received') || s.includes('confirm')) {
      return {
        bg: 'bg-purple-50 text-purple-900 border-purple-200',
        dot: 'bg-purple-500',
        label: 'Admin Received',
      };
    }
    if (s.includes('cancel')) {
      return {
        bg: 'bg-red-50 text-red-800 border-red-200',
        dot: 'bg-red-500',
        label: 'Cancelled',
      };
    }
    return {
      bg: 'bg-[#FAF9F6] text-[#A68B66] border-[#E9E1D6]',
      dot: 'bg-[#C5A059]',
      label: 'Order Placed',
    };
  };

  const badge = getStatusBadge();
  const totalItems = order.orderItems?.reduce((acc, it) => acc + (Number(it.quantity) || 1), 0) || 1;

  return (
    <div className="bg-white border border-[#E9E1D6] rounded-2xl shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden">
      {/* =========================================================================
          ORDER HEADER META BAR
          ========================================================================= */}
      <div className="bg-gradient-to-r from-[#FAF9F6] via-[#FDFCFA] to-[#FAF9F6] border-b border-[#E9E1D6] p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Left: Reference & Placed Date */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block">
                Order Reference
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="font-mono text-sm sm:text-base font-bold text-[#14110C] tracking-tight">
                  {shortOrderNum}
                </span>
                <button
                  type="button"
                  onClick={copyOrderId}
                  className="p-1 text-gray-400 hover:text-[#C5A059] hover:bg-white rounded transition"
                  title="Copy full Order ID"
                >
                  {copiedId ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                </button>
              </div>
            </div>

            <div className="hidden sm:block h-7 w-[1px] bg-[#E9E1D6]" />

            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block">
                Order Placed On
              </span>
              <p className="text-xs sm:text-sm font-medium text-[#29251F] mt-0.5 flex items-center gap-1">
                <Clock size={12} className="text-[#A68B66]" />
                <span>{formattedDate}</span>
              </p>
            </div>
          </div>

          {/* Right: Total Investment, Status Badge, Track Button */}
          <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3 sm:gap-4 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#E9E1D6]/60">
            {/* Total Investment */}
            <div className="lg:text-right">
              <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block">
                Total Investment ({totalItems} {totalItems === 1 ? 'Piece' : 'Pieces'})
              </span>
              <p className="font-serif-luxury text-base sm:text-lg font-bold text-[#14110C] mt-0.5">
                ₹{Number(order.totalPrice || 0).toLocaleString('en-IN')}
              </p>
            </div>

            {/* Status Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border shadow-2xs">
              <span className={`w-2 h-2 rounded-full ${badge.dot} animate-pulse`} />
              <span className={badge.bg.replace(/border-[^\s]+/, '')}>{badge.label}</span>
            </div>

            {/* Track Order Toggle Button */}
            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#14110C] hover:bg-[#C5A059] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-300 shadow-sm active:scale-98"
            >
              <span>{isExpanded ? 'Hide Tracking' : 'Track Order'}</span>
              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          ORDER PRODUCTS LIST
          ========================================================================= */}
      <div className="p-4 sm:p-6 divide-y divide-[#E9E1D6]/70">
        {order.orderItems?.map((item, idx) => {
          const rawImg = item.image || item.product?.images?.[0] || '';
          const imgUrl = getProductImageUrl(rawImg) || FALLBACK_PRODUCT_IMAGE;
          const productId = item.product?._id || item.product;
          const itemTotal = (Number(item.price) || 0) * (Number(item.quantity) || 1);

          return (
            <div
              key={item._id || idx}
              className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              {/* Product Info with Thumbnail */}
              <div className="flex items-start sm:items-center gap-3.5 sm:gap-4 min-w-0 flex-1">
                {/* Thumbnail Container: object-contain with luxury ivory background */}
                <Link
                  to={productId ? `/product/${productId}` : '#'}
                  className="w-16 h-20 sm:w-20 sm:h-24 bg-[#FAF9F6] border border-[#E9E1D6] rounded-xl flex items-center justify-center p-1.5 overflow-hidden shrink-0 shadow-2xs hover:border-[#C5A059] transition"
                >
                  <img
                    src={imgUrl}
                    alt={item.title || 'Product'}
                    referrerPolicy="no-referrer"
                    onError={handleImageError}
                    className="w-full h-full object-contain"
                  />
                </Link>

                {/* Details */}
                <div className="space-y-1 min-w-0 flex-1">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#C5A059]">
                    {item.product?.category || 'Haute Couture'}
                  </span>

                  <Link to={productId ? `/product/${productId}` : '#'}>
                    <h4 className="font-serif-luxury text-sm sm:text-base font-bold text-[#14110C] hover:text-[#C5A059] transition leading-snug line-clamp-2">
                      {item.title || item.product?.title || 'Bespoke Atelier Creation'}
                    </h4>
                  </Link>

                  {/* Badges: Size, Color, Qty */}
                  <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs text-gray-500">
                    <span className="bg-[#FAF9F6] border border-[#E9E1D6] px-2 py-0.5 rounded text-[11px] font-medium text-[#29251F]">
                      Size: <strong>{item.size || 'M'}</strong>
                    </span>
                    <span className="bg-[#FAF9F6] border border-[#E9E1D6] px-2 py-0.5 rounded text-[11px] font-medium text-[#29251F]">
                      Color: <strong>{item.color || 'Default'}</strong>
                    </span>
                    <span className="bg-[#FAF9F6] border border-[#E9E1D6] px-2 py-0.5 rounded text-[11px] font-medium text-[#29251F]">
                      Qty: <strong>{item.quantity || 1}</strong>
                    </span>
                    {item.product?.sku && (
                      <span className="font-mono text-[10px] text-[#A68B66] font-semibold">
                        SKU: {item.product.sku}
                      </span>
                    )}
                  </div>

                  {/* Rate & Review link if delivered */}
                  {orderStatus === 'Delivered' && productId && (
                    <div className="pt-1">
                      <Link
                        to={`/product/${productId}?tab=reviews`}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#A68B66] hover:text-[#14110C] transition"
                      >
                        <Star size={11} className="fill-[#C5A059] text-[#C5A059]" />
                        <span>Share Patron Review & Photos &rarr;</span>
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Price & Subtotal */}
              <div className="text-right self-end sm:self-center shrink-0">
                <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block sm:hidden">
                  Line Total
                </span>
                <p className="font-serif-luxury text-base sm:text-lg font-bold text-[#14110C]">
                  ₹{itemTotal.toLocaleString('en-IN')}
                </p>
                {Number(item.quantity) > 1 && (
                  <p className="text-[11px] text-gray-500 font-mono mt-0.5">
                    ₹{Number(item.price).toLocaleString('en-IN')} each
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* =========================================================================
          EXPANDABLE TRACKING TIMELINE DRAWER (5 STAGES)
          ========================================================================= */}
      {isExpanded && (
        <div className="bg-[#FAF9F6]/80 border-t border-[#E9E1D6] p-4 sm:p-7 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 7 cols: Vertical 5-Stage Timeline */}
            <div className="lg:col-span-8 bg-white border border-[#E9E1D6] rounded-2xl p-4 sm:p-6 shadow-2xs">
              <VerticalOrderTimeline order={order} />
            </div>

            {/* Right 4 cols: Destination Address & Atelier Support */}
            <div className="lg:col-span-4 space-y-4">
              {/* Shipping Destination Card */}
              {order.shippingAddress && (
                <div className="bg-white border border-[#E9E1D6] rounded-2xl p-4 sm:p-5 shadow-2xs">
                  <div className="flex items-center gap-2 text-[#C5A059] font-cinzel text-xs font-bold uppercase tracking-wider mb-2">
                    <MapPin size={14} />
                    <span>Destination Atelier</span>
                  </div>
                  <h5 className="font-bold text-xs sm:text-sm text-[#14110C]">
                    {order.shippingAddress.fullName || 'Patron Residence'}
                  </h5>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    {order.shippingAddress.street}
                    <br />
                    {order.shippingAddress.city}, {order.shippingAddress.state} – {order.shippingAddress.postalCode}
                  </p>
                  {order.shippingAddress.phone && (
                    <p className="text-xs text-gray-500 font-mono mt-2 pt-2 border-t border-[#E9E1D6]/60">
                      Phone: {order.shippingAddress.phone}
                    </p>
                  )}
                </div>
              )}

              {/* Dedicated Tracking Link & Support */}
              <div className="bg-gradient-to-br from-[#1E1912] to-[#14110C] text-[#FAF9F6] border border-[#C5A059]/40 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-[#E8D3A2] text-xs font-bold uppercase tracking-widest font-cinzel">
                  <Sparkles size={13} />
                  <span>Atelier Concierge</span>
                </div>
                <p className="text-[11px] text-gray-300 leading-relaxed">
                  Every order includes insured transit & dedicated garment concierge support.
                </p>
                <div className="pt-1 flex flex-col gap-2">
                  <Link
                    to={`/track-order/${order._id}`}
                    className="w-full text-center py-2 px-3 bg-[#C5A059] hover:bg-[#E8D3A2] text-[#14110C] text-xs font-bold uppercase tracking-wider rounded-lg transition shadow-2xs flex items-center justify-center gap-1.5"
                  >
                    <span>Open Dedicated Tracking</span>
                    <ExternalLink size={12} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          ORDER CARD FOOTER BAR
          ========================================================================= */}
      <div className="bg-[#FAF9F6] border-t border-[#E9E1D6] px-4 py-3 sm:px-6 flex flex-wrap items-center justify-between text-xs text-gray-500 gap-2">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />
          <span>Payment: <strong>{order.paymentMethod || 'Prepaid / Verified'}</strong></span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to={`/track-order/${order._id}`}
            className="text-[#C5A059] hover:text-[#14110C] font-semibold inline-flex items-center gap-1 transition"
          >
            <span>Live Journey View</span>
            <ExternalLink size={11} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CustomerOrderCard;
