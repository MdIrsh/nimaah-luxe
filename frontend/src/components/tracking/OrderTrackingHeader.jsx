import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, ArrowLeft } from 'lucide-react';

export const OrderTrackingHeader = ({ orderNumber, onBack }) => {
  const navigate = useNavigate();

  return (
    <div className="border-b border-[#E8DEC8] pb-6 mb-8">
      {/* Breadcrumb: Home / My Account / My Orders / Track Order */}
      <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-[11px] text-gray-500 mb-4 font-medium uppercase tracking-wider">
        <Link to="/" className="hover:text-[#14110C] transition">Home</Link>
        <ChevronRight size={12} className="text-gray-400" />
        <Link to="/account/profile" className="hover:text-[#14110C] transition">My Account</Link>
        <ChevronRight size={12} className="text-gray-400" />
        <Link to="/account/orders" className="hover:text-[#14110C] transition">My Orders</Link>
        <ChevronRight size={12} className="text-gray-400" />
        <span className="text-[#C5A059] font-bold">Track Order</span>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => (onBack ? onBack() : navigate('/account/orders'))}
              className="p-1.5 rounded-lg border border-[#E8DEC8] text-gray-600 hover:text-[#14110C] hover:bg-[#FAF7F2] transition"
              title="Back to Orders"
            >
              <ArrowLeft size={16} />
            </button>
            <h1 className="font-serif-luxury text-2xl sm:text-3xl text-[#14110C] font-semibold tracking-tight">
              Track Your Order
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 mt-1 pl-9">
            Follow your luxury package every step of the way from atelier to your destination.
          </p>
        </div>

        {orderNumber && (
          <div className="self-start sm:self-auto px-4 py-2 bg-[#FAF7F2] border border-[#E8DEC8] rounded-xl text-right">
            <span className="block text-[10px] uppercase font-bold tracking-widest text-[#C5A059]">
              Active Reference
            </span>
            <span className="font-mono text-xs sm:text-sm font-bold text-[#14110C]">
              {orderNumber}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTrackingHeader;
