import React, { useState } from 'react';
import { Copy, Check, Calendar, CreditCard, Truck, ShieldCheck, Clock } from 'lucide-react';

export const OrderSummaryCard = ({ order }) => {
  const [copied, setCopied] = useState(false);

  if (!order) return null;

  const copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Determine prominent status badge label & colors
  let badgeLabel = 'IN TRANSIT';
  let badgeClasses = 'bg-[#C5A059] text-white';

  if (order.orderStatus === 'Delivered') {
    badgeLabel = 'DELIVERED';
    badgeClasses = 'bg-emerald-600 text-white';
  } else if (order.orderStatus === 'Cancelled') {
    badgeLabel = 'CANCELLED';
    badgeClasses = 'bg-rose-600 text-white';
  } else if (order.orderStatus === 'Order Placed') {
    badgeLabel = 'ORDER PLACED';
    badgeClasses = 'bg-[#14110C] text-white';
  } else if (order.orderStatus === 'Admin Received') {
    badgeLabel = 'CONFIRMED';
    badgeClasses = 'bg-indigo-600 text-white';
  } else if (order.orderStatus === 'Processing & Tailoring') {
    badgeLabel = 'IN TAILORING';
    badgeClasses = 'bg-amber-600 text-white';
  } else if (order.orderStatus === 'Shipped') {
    badgeLabel = 'IN TRANSIT';
    badgeClasses = 'bg-[#C5A059] text-white animate-pulse';
  }

  const formattedOrderDate = order.orderDate
    ? new Date(order.orderDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recent';

  const formattedEstimatedDate = order.estimatedDeliveryDate
    ? new Date(order.estimatedDeliveryDate).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'In 3-5 business days';

  return (
    <div className="bg-white border border-[#E8DEC8] rounded-2xl p-6 shadow-sm relative overflow-hidden space-y-5">
      {/* Top Banner Row: Order ID & Prominent Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F2ECE1] pb-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400">
            Order Reference
          </span>
          <h3 className="font-mono text-lg font-bold text-[#14110C]">
            {order.orderNumber || `#SH-${order.orderId?.slice(-6).toUpperCase()}`}
          </h3>
        </div>

        {/* Prominent Status Badge */}
        <div className="flex items-center space-x-2">
          <span
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-xs ${badgeClasses}`}
          >
            {badgeLabel}
          </span>
        </div>
      </div>

      {/* Grid Meta Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        {/* Order Date */}
        <div className="flex items-start space-x-3 p-3 bg-[#FAF7F2] rounded-xl border border-[#F0E6D8]">
          <Calendar size={16} className="text-[#C5A059] mt-0.5 flex-shrink-0" />
          <div>
            <span className="text-[10.5px] uppercase font-semibold text-gray-500 block">
              Order Date
            </span>
            <span className="font-medium text-[#14110C] text-xs">
              {formattedOrderDate}
            </span>
          </div>
        </div>

        {/* Payment Status */}
        <div className="flex items-start space-x-3 p-3 bg-[#FAF7F2] rounded-xl border border-[#F0E6D8]">
          <CreditCard size={16} className="text-emerald-600 mt-0.5 flex-shrink-0" />
          <div>
            <span className="text-[10.5px] uppercase font-semibold text-gray-500 block">
              Payment Status
            </span>
            <span className="font-semibold text-emerald-700 flex items-center space-x-1">
              <span>{order.isPaid ? 'Paid' : 'Pending Verification'}</span>
              <ShieldCheck size={13} className="text-emerald-600 inline ml-1" />
            </span>
          </div>
        </div>

        {/* Estimated Delivery Date */}
        <div className="flex items-start space-x-3 p-3 bg-[#FAF7F2] rounded-xl border border-[#F0E6D8]">
          <Clock size={16} className="text-[#C5A059] mt-0.5 flex-shrink-0" />
          <div>
            <span className="text-[10.5px] uppercase font-semibold text-gray-500 block">
              Estimated Delivery
            </span>
            <span className="font-semibold text-[#14110C]">
              {order.orderStatus === 'Delivered'
                ? 'Delivered on Schedule'
                : formattedEstimatedDate}
            </span>
          </div>
        </div>

        {/* Courier Partner */}
        <div className="flex items-start space-x-3 p-3 bg-[#FAF7F2] rounded-xl border border-[#F0E6D8]">
          <Truck size={16} className="text-[#14110C] mt-0.5 flex-shrink-0" />
          <div className="min-w-0">
            <span className="text-[10.5px] uppercase font-semibold text-gray-500 block">
              Courier Partner
            </span>
            <span className="font-semibold text-[#14110C] truncate block">
              {order.courierPartner || 'BlueDart Luxury Express'}
            </span>
          </div>
        </div>
      </div>

      {/* Tracking / AWB Number with Copy Button */}
      {order.trackingNumber && (
        <div className="pt-2 border-t border-[#F2ECE1] flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block">
              AWB / Tracking Number
            </span>
            <code className="font-mono text-xs sm:text-sm font-bold text-[#14110C]">
              {order.trackingNumber}
            </code>
          </div>

          <button
            onClick={() => copyToClipboard(order.trackingNumber)}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-[#E8DEC8] bg-[#FAF7F2] hover:bg-[#C5A059] hover:text-white text-gray-700 text-xs font-semibold transition"
            title="Copy Tracking Number"
          >
            {copied ? (
              <>
                <Check size={13} className="text-emerald-600" />
                <span className="text-emerald-700">Copied!</span>
              </>
            ) : (
              <>
                <Copy size={13} />
                <span>Copy AWB</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderSummaryCard;
