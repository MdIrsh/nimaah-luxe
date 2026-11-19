import React from 'react';
import { ShoppingBag } from 'lucide-react';

export const ProductInfoCard = ({ order }) => {
  if (!order || !order.orderItems) return null;

  return (
    <div className="bg-white border border-[#E8DEC8] rounded-2xl p-6 shadow-sm space-y-5">
      <div className="flex items-center justify-between border-b border-[#F2ECE1] pb-3">
        <div className="flex items-center space-x-2">
          <ShoppingBag size={18} className="text-[#C5A059]" />
          <h3 className="font-serif-luxury text-base font-bold text-[#14110C]">
            Curated Atelier Pieces
          </h3>
        </div>
        <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">
          {order.orderItems.length} {order.orderItems.length === 1 ? 'Item' : 'Items'}
        </span>
      </div>

      {/* Product Items List */}
      <div className="divide-y divide-[#F6EFE5] max-h-96 overflow-y-auto pr-1">
        {order.orderItems.map((item, idx) => {
          const itemImg =
            item.image ||
            item.product?.images?.[0] ||
            'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=400&q=80';
          const lineTotal = (item.price || 0) * (item.quantity || 1);

          return (
            <div key={idx} className="py-4 first:pt-0 last:pb-0 flex items-start justify-between gap-4">
              <div className="flex items-start space-x-3.5 min-w-0">
                <div className="w-16 h-22 rounded-xl overflow-hidden border border-[#E8DEC8] bg-[#FAF7F2] flex-shrink-0 shadow-2xs">
                  <img
                    src={itemImg}
                    alt={item.title}
                    className="w-full h-full object-cover object-top hover:scale-105 transition duration-300"
                  />
                </div>
                <div className="space-y-1 min-w-0">
                  <h4 className="font-serif-luxury text-xs sm:text-sm font-bold text-[#14110C] truncate leading-tight">
                    {item.title}
                  </h4>
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-gray-500">
                    <span className="px-2 py-0.5 bg-[#FAF7F2] border border-[#E8DEC8] rounded-md text-gray-700 font-medium">
                      Size: {item.size}
                    </span>
                    <span className="px-2 py-0.5 bg-[#FAF7F2] border border-[#E8DEC8] rounded-md text-gray-700 font-medium">
                      Color: {item.color}
                    </span>
                    <span className="text-gray-400">Qty: {item.quantity}</span>
                  </div>
                  <p className="text-[11px] text-[#C5A059] font-medium font-serif">
                    ₹{item.price?.toLocaleString('en-IN')} each
                  </p>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <span className="font-serif-luxury font-bold text-xs sm:text-sm text-[#14110C]">
                  ₹{lineTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Financial Summary */}
      <div className="pt-4 border-t border-[#F2ECE1] space-y-2 text-xs">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span className="font-medium text-[#14110C]">
            ₹{(order.itemsPrice || 0).toLocaleString('en-IN')}
          </span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Shipping (BlueDart Express)</span>
          <span className="font-medium text-[#14110C]">
            {order.shippingPrice === 0 ? 'Complimentary' : `₹${order.shippingPrice?.toLocaleString('en-IN')}`}
          </span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Estimated GST (12%)</span>
          <span className="font-medium text-[#14110C]">
            ₹{(order.taxPrice || 0).toLocaleString('en-IN')}
          </span>
        </div>

        <div className="pt-2.5 border-t border-[#F2ECE1] flex justify-between items-baseline text-sm">
          <span className="font-bold text-[#14110C] uppercase tracking-wider text-xs">
            Total Investment
          </span>
          <span className="font-serif-luxury text-base font-bold text-[#14110C]">
            ₹{(order.totalPrice || 0).toLocaleString('en-IN')}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductInfoCard;
