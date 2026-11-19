import React, { useState } from 'react';
import {
  FileText,
  Headphones,
  XCircle,
  RotateCcw,
  RefreshCw,
  Printer,
  X,
  MessageCircle,
  Mail,
  Phone,
} from 'lucide-react';

export const TrackingActions = ({
  order,
  onRefresh,
  isRefreshing,
  onCancelOrder,
  isCancelling,
}) => {
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);

  if (!order) return null;

  const handlePrintInvoice = () => {
    window.print();
  };

  return (
    <div className="bg-white border border-[#E8DEC8] rounded-2xl p-6 shadow-sm space-y-4">
      <h3 className="font-serif-luxury text-base font-bold text-[#14110C] border-b border-[#F2ECE1] pb-3">
        Order Assistance & Actions
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        {/* Download / Print Invoice */}
        <button
          onClick={() => setIsInvoiceOpen(true)}
          className="flex items-center justify-center space-x-2 p-3 rounded-xl border border-[#E8DEC8] hover:border-[#C5A059] bg-[#FAF7F2] hover:bg-white text-[#14110C] font-semibold transition"
        >
          <FileText size={15} className="text-[#C5A059]" />
          <span>View / Print Invoice</span>
        </button>

        {/* Contact VIP Concierge Support */}
        <button
          onClick={() => setIsSupportOpen(true)}
          className="flex items-center justify-center space-x-2 p-3 rounded-xl border border-[#E8DEC8] hover:border-[#C5A059] bg-[#FAF7F2] hover:bg-white text-[#14110C] font-semibold transition"
        >
          <Headphones size={15} className="text-[#C5A059]" />
          <span>Contact Boutique Support</span>
        </button>

        {/* Refresh Tracking */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center justify-center space-x-2 p-3 rounded-xl border border-[#E8DEC8] hover:border-[#14110C] bg-white text-[#14110C] font-semibold transition disabled:opacity-50"
        >
          <RefreshCw size={15} className={isRefreshing ? 'animate-spin text-[#C5A059]' : 'text-gray-500'} />
          <span>{isRefreshing ? 'Syncing...' : 'Refresh Status'}</span>
        </button>

        {/* Return / Exchange Button (Only when eligible: Delivered) */}
        {order.isReturnEligible && (
          <button
            onClick={() => alert('Return / Exchange request initiated. Our concierge will contact you within 24 hours.')}
            className="flex items-center justify-center space-x-2 p-3 rounded-xl border border-[#C5A059] bg-[#FAF7F2] hover:bg-[#C5A059] text-[#14110C] hover:text-white font-semibold transition"
          >
            <RotateCcw size={15} />
            <span>Return / Exchange</span>
          </button>
        )}

        {/* Cancel Order Button (Only when cancellation is allowed) */}
        {order.isCancelAllowed && (
          <button
            onClick={onCancelOrder}
            disabled={isCancelling}
            className="flex items-center justify-center space-x-2 p-3 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold transition disabled:opacity-50 col-span-1 sm:col-span-2"
          >
            <XCircle size={15} className="text-rose-600" />
            <span>{isCancelling ? 'Processing Cancellation...' : 'Cancel Order'}</span>
          </button>
        )}
      </div>

      {/* =========================================================================
          LUXURY INVOICE MODAL
          ========================================================================= */}
      {isInvoiceOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#E8DEC8] max-w-2xl w-full p-6 sm:p-8 rounded-2xl space-y-6 shadow-2xl relative my-8">
            <div className="flex items-center justify-between border-b border-[#F2ECE1] pb-4">
              <div>
                <h2 className="font-cinzel text-xl font-bold tracking-widest text-[#14110C]">
                  NI'MAAH LUXE
                </h2>
                <p className="text-[10px] text-gray-400 font-serif italic">
                  Tax Invoice & Atelier Certificate
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePrintInvoice}
                  className="px-3 py-1.5 rounded-lg bg-[#FAF7F2] hover:bg-[#C5A059] text-gray-700 hover:text-white text-xs font-semibold flex items-center space-x-1 border border-[#E8DEC8] transition"
                >
                  <Printer size={13} />
                  <span>Print</span>
                </button>
                <button
                  onClick={() => setIsInvoiceOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-[#14110C]"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400 block">
                  Billed To
                </span>
                <p className="font-bold text-[#14110C]">
                  {order.shippingAddress?.fullName || 'Valued Patron'}
                </p>
                <p className="text-gray-600">
                  {order.shippingAddress?.street}, {order.shippingAddress?.city},{' '}
                  {order.shippingAddress?.state} - {order.shippingAddress?.postalCode}
                </p>
                <p className="text-gray-600">Phone: {order.shippingAddress?.phone}</p>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">
                  Invoice Details
                </span>
                <p className="font-mono font-bold text-[#14110C]">
                  INV-{order.orderId?.slice(-8).toUpperCase()}
                </p>
                <p className="text-gray-600">
                  Date: {new Date(order.orderDate).toLocaleDateString()}
                </p>
                <p className="text-emerald-700 font-semibold">
                  Status: {order.isPaid ? 'PAID IN FULL' : 'PENDING'}
                </p>
              </div>
            </div>

            {/* Items Table */}
            <div className="border border-[#F2ECE1] rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF7F2] border-b border-[#F2ECE1] text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">Item</th>
                    <th className="py-2.5 px-3">Size / Color</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-right">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F6EFE5]">
                  {order.orderItems?.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 px-3 font-medium text-[#14110C]">
                        {item.title}
                      </td>
                      <td className="py-2.5 px-3 text-gray-500">
                        {item.size} • {item.color}
                      </td>
                      <td className="py-2.5 px-3 text-center">{item.quantity}</td>
                      <td className="py-2.5 px-3 text-right font-medium">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total */}
            <div className="flex justify-between items-baseline pt-2 border-t border-[#F2ECE1] text-xs">
              <span className="text-gray-500">GST (12%) Included</span>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">
                  Grand Total
                </span>
                <span className="font-serif-luxury text-lg font-bold text-[#14110C]">
                  ₹{(order.totalPrice || 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIP CONCIERGE SUPPORT MODAL
          ========================================================================= */}
      {isSupportOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E8DEC8] max-w-md w-full p-6 rounded-2xl space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#F2ECE1] pb-3">
              <div className="flex items-center space-x-2">
                <Headphones size={18} className="text-[#C5A059]" />
                <h3 className="font-serif-luxury text-base font-bold text-[#14110C]">
                  Boutique Concierge Support
                </h3>
              </div>
              <button
                onClick={() => setIsSupportOpen(false)}
                className="text-gray-400 hover:text-black"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-gray-600">
              Our bespoke concierge team is available 24/7 to assist with delivery rescheduling, address updates, or styling consultations.
            </p>

            <div className="space-y-2.5 text-xs">
              <a
                href="https://wa.me/918618625902?text=Hello%20Ni'maah%20Luxe%20Support,%20regarding%20Order"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 p-3 rounded-xl border border-[#E8DEC8] hover:bg-[#FAF7F2] transition text-[#14110C]"
              >
                <MessageCircle size={16} className="text-emerald-600" />
                <div>
                  <span className="font-bold block">WhatsApp Concierge</span>
                  <span className="text-[10.5px] text-gray-500">Direct response within 5 mins</span>
                </div>
              </a>

              <a
                href="mailto:support@nimaahluxe.com?subject=Inquiry for Order"
                className="flex items-center space-x-3 p-3 rounded-xl border border-[#E8DEC8] hover:bg-[#FAF7F2] transition text-[#14110C]"
              >
                <Mail size={16} className="text-[#C5A059]" />
                <div>
                  <span className="font-bold block">Email Boutique Support</span>
                  <span className="text-[10.5px] text-gray-500">support@nimaahluxe.com</span>
                </div>
              </a>

              <a
                href="tel:+918618625902"
                className="flex items-center space-x-3 p-3 rounded-xl border border-[#E8DEC8] hover:bg-[#FAF7F2] transition text-[#14110C]"
              >
                <Phone size={16} className="text-indigo-600" />
                <div>
                  <span className="font-bold block">Call Luxury Hotline</span>
                  <span className="text-[10.5px] text-gray-500">+91 86186 25902</span>
                </div>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackingActions;
