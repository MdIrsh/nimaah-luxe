import React, { useState, useEffect } from 'react';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Tag,
  CreditCard,
  Receipt,
  Phone,
  Calendar,
  Sparkles,
  Hash,
} from 'lucide-react';
import { orderService } from '../services/orderService';
import { getProductImageUrl, handleImageError, FALLBACK_PRODUCT_IMAGE } from '../utils/imageUtils';

export const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');
  const [updatingId, setUpdatingId] = useState(null);

  const statuses = [
    'Order Placed',
    'Admin Received',
    'Processing & Tailoring',
    'Shipped',
    'Delivered',
  ];

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await orderService.getAllOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching orders from MongoDB:', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    let tracking = '';
    if (newStatus === 'Shipped') {
      tracking = `BD-LUXE-${Math.floor(10000000 + Math.random() * 90000000)}`;
    }

    try {
      await orderService.updateOrderStatus(orderId, {
        status: newStatus,
        trackingNumber: tracking,
        courierPartner: 'BlueDart Luxury Express',
      });
    } catch (err) {
      console.error('Failed to update status:', err);
    }

    setOrders((prev) =>
      prev.map((o) =>
        o._id === orderId
          ? {
              ...o,
              orderStatus: newStatus,
              trackingNumber: tracking || o.trackingNumber,
            }
          : o
      )
    );
    setUpdatingId(null);
  };

  const filteredOrders =
    selectedStatusFilter === 'All'
      ? orders
      : orders.filter((o) => o.orderStatus === selectedStatusFilter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-[#E9E1D6] pb-6">
        <span className="text-[10px] uppercase tracking-[0.3em] text-[#A68B66] font-semibold">
          Fulfillment Command
        </span>
        <h1 className="font-serif-luxury text-3xl text-[#29251F] mt-1">
          Order Processing & Shipment Pipeline
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Directly controls Step 11 & 12 of the boutique pipeline: Admin Receives Order &rarr; Process and Ship &rarr; Customer Receives Dress.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedStatusFilter('All')}
          className={`px-3.5 py-1.5 text-xs uppercase tracking-wider font-semibold border transition cursor-pointer ${
            selectedStatusFilter === 'All'
              ? 'bg-[#29251F] text-white border-[#29251F]'
              : 'bg-white border-[#E9E1D6] text-gray-600 hover:border-gray-400'
          }`}
        >
          All Orders ({orders.length})
        </button>
        {statuses.map((st) => (
          <button
            key={st}
            onClick={() => setSelectedStatusFilter(st)}
            className={`px-3.5 py-1.5 text-xs uppercase tracking-wider font-semibold border transition cursor-pointer ${
              selectedStatusFilter === st
                ? 'bg-[#29251F] text-white border-[#29251F]'
                : 'bg-white border-[#E9E1D6] text-gray-600 hover:border-gray-400'
            }`}
          >
            {st} ({orders.filter((o) => o.orderStatus === st).length})
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-5">
        {loading ? (
          <div className="py-20 text-center bg-white border border-[#E9E1D6]">
            <div className="w-10 h-10 border-2 border-[#C5A059] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs uppercase tracking-widest text-[#8C6D37] font-semibold">
              Loading Boutique Orders...
            </p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white border border-[#E9E1D6] p-12 text-center text-gray-500">
            <Package size={36} className="mx-auto text-gray-300 mb-3" />
            <p className="font-serif-luxury text-lg text-[#29251F]">No orders found</p>
            <p className="text-xs text-gray-400 mt-1">There are no orders matching this stage.</p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const items = Array.isArray(order.orderItems) ? order.orderItems : [];
            const totalItemsCount = items.reduce(
              (sum, it) => sum + Number(it.quantity || 1),
              0
            );

            // Calculations for prices from database
            const calculatedSubtotal = items.reduce(
              (sum, it) => sum + Number(it.price || 0) * Number(it.quantity || 1),
              0
            );
            const itemsSubtotal = Number(order.itemsPrice || calculatedSubtotal || 0);
            const shippingCharges = Number(order.shippingPrice || 0);
            const taxCharges = Number(order.taxPrice || 0);
            const finalOrderTotal = Number(
              order.totalPrice || itemsSubtotal + shippingCharges + taxCharges
            );

            // Calculate discount if applicable
            const theoreticalTotal = itemsSubtotal + shippingCharges + taxCharges;
            const appliedDiscount =
              order.discountAmount ||
              (theoreticalTotal > finalOrderTotal ? theoreticalTotal - finalOrderTotal : 0);

            // Formatted date
            const orderDateStr = order.createdAt
              ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Recent Order';

            return (
              <div
                key={order._id}
                className="bg-white border border-[#E9E1D6] p-6 shadow-xs space-y-5 transition hover:shadow-md"
              >
                {/* Order Card Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#FAF9F6] pb-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-mono text-sm font-bold text-[#29251F]">
                        #{order._id}
                      </span>
                      <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 bg-[#FAF7F2] text-[#8C6D37] border border-[#E9E1D6]">
                        {order.isPaid ? 'Paid & Bank Verified' : 'Payment Verified'}
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Calendar size={12} className="text-gray-400" />
                        {orderDateStr}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Patron:{' '}
                      <strong className="text-[#29251F]">
                        {order.shippingAddress?.fullName || order.user?.name || 'Valued Patron'}
                      </strong>
                      {order.shippingAddress?.city && (
                        <span>
                          {' '}
                          • {order.shippingAddress?.city}, {order.shippingAddress?.state}
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Status Controller (Advance Stage dropdown) */}
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:inline">
                      Advance Stage:
                    </span>
                    <select
                      value={order.orderStatus || 'Admin Received'}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      disabled={updatingId === order._id}
                      className="text-xs font-semibold bg-[#FAF9F6] border border-[#A68B66] py-1.5 px-3 text-[#29251F] focus:outline-none cursor-pointer rounded-xs"
                    >
                      {statuses.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Main Content Grid: Products (Left) + Financial Summary & Address (Right) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs text-gray-600">
                  {/* Left Column: Product Details List */}
                  <div className="lg:col-span-7 space-y-3">
                    <div className="flex items-center justify-between border-b border-[#FAF9F6] pb-2">
                      <p className="uppercase tracking-wider font-bold text-[#29251F] text-[11px] flex items-center gap-1.5">
                        <Package size={14} className="text-[#C5A059]" />
                        Ordered Silhouettes ({totalItemsCount}{' '}
                        {totalItemsCount === 1 ? 'piece' : 'pieces'})
                      </p>
                      <span className="text-[11px] text-gray-400 font-medium">
                        {items.length} {items.length === 1 ? 'Product Line' : 'Product Lines'}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {items.map((item, idx) => {
                        const prod = item.product || {};
                        const thumbnail = getProductImageUrl(
                          item.image ||
                            (Array.isArray(prod.images) && prod.images[0]) ||
                            prod.image ||
                            ''
                        );
                        const itemUnitPrice = Number(item.price || 0);
                        const itemQty = Number(item.quantity || 1);
                        const itemSubtotal = itemUnitPrice * itemQty;
                        const sku = prod.sku || item.sku || '';
                        const productId =
                          prod._id || (typeof item.product === 'string' ? item.product : null);

                        return (
                          <div
                            key={idx}
                            className="p-3.5 bg-[#FAF9F6]/80 border border-[#E9E1D6] rounded-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition hover:border-[#C5A059]/60"
                          >
                            {/* Product Image & Information */}
                            <div className="flex items-start gap-3.5 min-w-0 flex-1">
                              {/* Thumbnail */}
                              <div className="w-16 h-20 sm:w-20 sm:h-24 bg-white border border-[#E9E1D6] rounded-xs overflow-hidden flex-shrink-0 flex items-center justify-center shadow-2xs">
                                <img
                                  src={thumbnail}
                                  alt={item.title || 'Product Thumbnail'}
                                  onError={handleImageError}
                                  className="w-full h-full object-contain p-1"
                                />
                              </div>

                              {/* Meta Details */}
                              <div className="space-y-1.5 min-w-0 flex-1">
                                {/* Product Full Name (Visually prominent, NOT truncated) */}
                                <h4 className="font-serif-luxury text-sm sm:text-base font-bold text-[#29251F] leading-snug break-words">
                                  {item.title || prod.title || 'Haute Couture Silhouette'}
                                </h4>

                                {/* SKU & Product ID badges */}
                                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                                  {sku && (
                                    <span className="inline-flex items-center gap-1 font-mono text-[10px] bg-white text-[#8C6D37] border border-[#E9E1D6] px-1.5 py-0.5 rounded-xs font-semibold uppercase">
                                      <Tag size={10} />
                                      SKU: {sku}
                                    </span>
                                  )}
                                  {productId && (
                                    <span className="inline-flex items-center font-mono text-[10px] text-gray-500 bg-white border border-gray-200 px-1.5 py-0.5 rounded-xs">
                                      ID: {productId.toString().slice(-8)}
                                    </span>
                                  )}
                                </div>

                                {/* Size & Color Badges */}
                                <div className="flex flex-wrap items-center gap-2 pt-0.5 text-[11px]">
                                  <span className="px-2 py-0.5 bg-white text-[#29251F] border border-[#E9E1D6] rounded-xs font-medium">
                                    Size: <strong className="font-bold text-[#29251F]">{item.size || 'M'}</strong>
                                  </span>
                                  <span className="px-2 py-0.5 bg-white text-[#29251F] border border-[#E9E1D6] rounded-xs font-medium">
                                    Color: <strong className="text-[#29251F]">{item.color || 'Default'}</strong>
                                  </span>
                                </div>

                                {/* Unit Price and Quantity */}
                                <div className="flex items-center gap-3 pt-0.5 text-xs text-gray-500">
                                  <span>
                                    Unit Price:{' '}
                                    <strong className="text-[#29251F] font-semibold">
                                      ₹{itemUnitPrice.toLocaleString('en-IN')}
                                    </strong>
                                  </span>
                                  <span>•</span>
                                  <span>
                                    Qty:{' '}
                                    <strong className="text-[#29251F] font-bold">
                                      {itemQty}
                                    </strong>
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Line-Item Subtotal (price x quantity) */}
                            <div className="w-full sm:w-auto pt-2.5 sm:pt-0 border-t sm:border-t-0 border-[#E9E1D6] flex sm:flex-col justify-between sm:justify-center items-baseline sm:items-end flex-shrink-0">
                              <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">
                                Line Subtotal
                              </span>
                              <span className="font-serif-luxury text-base sm:text-lg font-bold text-[#29251F]">
                                ₹{itemSubtotal.toLocaleString('en-IN')}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Column: Order Summary & Sanctuary Destination */}
                  <div className="lg:col-span-5 space-y-3.5">
                    {/* Order Financial Summary Section */}
                    <div className="bg-white p-4 border border-[#E9E1D6] rounded-xs space-y-3 shadow-2xs">
                      <div className="flex items-center justify-between border-b border-[#FAF9F6] pb-2">
                        <span className="uppercase tracking-wider font-bold text-[#29251F] text-[11px] flex items-center gap-1.5">
                          <Receipt size={14} className="text-[#C5A059]" />
                          Order Summary
                        </span>
                        <span className="text-[10px] uppercase tracking-wider text-[#A68B66] font-semibold font-mono">
                          {order.paymentMethod || 'Online Verified'}
                        </span>
                      </div>

                      <div className="space-y-2 text-xs text-gray-600 font-light">
                        <div className="flex justify-between items-center">
                          <span>Total Items</span>
                          <strong className="text-[#29251F] font-medium">
                            {totalItemsCount} {totalItemsCount === 1 ? 'Piece' : 'Pieces'}
                          </strong>
                        </div>

                        <div className="flex justify-between items-center">
                          <span>Items Subtotal</span>
                          <strong className="text-[#29251F] font-serif-luxury font-semibold">
                            ₹{itemsSubtotal.toLocaleString('en-IN')}
                          </strong>
                        </div>

                        <div className="flex justify-between items-center">
                          <span>Shipping Charges</span>
                          <span className="text-[#15803D] font-medium">
                            {shippingCharges === 0
                              ? 'Complimentary'
                              : `₹${shippingCharges.toLocaleString('en-IN')}`}
                          </span>
                        </div>

                        {appliedDiscount > 0 && (
                          <div className="flex justify-between items-center text-emerald-700 font-medium">
                            <span>Privilege Discount</span>
                            <span>-₹{appliedDiscount.toLocaleString('en-IN')}</span>
                          </div>
                        )}

                        {taxCharges > 0 && (
                          <div className="flex justify-between items-center">
                            <span>Apparel Tax (GST)</span>
                            <span>₹{taxCharges.toLocaleString('en-IN')}</span>
                          </div>
                        )}

                        <div className="border-t border-[#E9E1D6] pt-2.5 flex justify-between items-baseline">
                          <span className="uppercase text-xs font-bold text-[#29251F] tracking-wider">
                            Final Order Total
                          </span>
                          <span className="font-serif-luxury text-xl font-bold text-[#29251F]">
                            ₹{finalOrderTotal.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Sanctuary Destination Address */}
                    <div className="bg-[#FAF9F6] p-4 border border-[#E9E1D6] rounded-xs space-y-1.5 text-xs">
                      <p className="uppercase tracking-wider font-bold text-[#29251F] text-[10px] flex items-center gap-1.5">
                        <MapPin size={12} className="text-[#C5A059]" />
                        Sanctuary Destination
                      </p>
                      <p className="text-[#29251F] font-bold text-sm">
                        {order.shippingAddress?.fullName || 'Valued Patron'}
                        {order.shippingAddress?.phone && (
                          <span className="text-xs font-normal text-gray-500 ml-1.5">
                            ({order.shippingAddress.phone})
                          </span>
                        )}
                      </p>
                      <p className="text-gray-600 leading-relaxed">
                        {order.shippingAddress?.street}
                      </p>
                      <p className="text-gray-600 font-medium">
                        {order.shippingAddress?.city}, {order.shippingAddress?.state} -{' '}
                        {order.shippingAddress?.postalCode}
                      </p>

                      {order.trackingNumber && (
                        <div className="pt-2 mt-2 border-t border-[#E9E1D6] flex items-center gap-1.5 text-[#8C6D37] text-xs font-mono">
                          <Truck size={14} className="text-[#C5A059]" />
                          <span>
                            Tracking: <strong>{order.trackingNumber}</strong>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
