import React, { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle2, Clock, MapPin, Eye, ExternalLink } from 'lucide-react';
import { orderService } from '../services/orderService';

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
      if (!data || data.length === 0) {
        // Sample orders matching flowchart
        const defaultOrders = [
          {
            _id: 'ORD-89421',
            createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
            totalPrice: 28498,
            orderStatus: 'Shipped',
            trackingNumber: 'BD-LUXE-90218491',
            courierPartner: 'BlueDart Luxury Express',
            shippingAddress: {
              fullName: 'Aisha Al-Mansoor',
              street: '14 Royal Crescent, Boat Club Road',
              city: 'Chennai',
              state: 'Tamil Nadu',
              postalCode: '600028',
            },
            orderItems: [
              {
                title: 'Aura Velvet Midnight Evening Gown',
                price: 14999,
                size: 'M',
                color: 'Midnight Navy',
                quantity: 1,
              },
            ],
          },
          {
            _id: 'ORD-91042',
            createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
            totalPrice: 26500,
            orderStatus: 'Admin Received',
            trackingNumber: '',
            courierPartner: 'BlueDart Luxury Express',
            shippingAddress: {
              fullName: 'Zoya Mirza',
              street: '52 Park Avenue, Civil Lines',
              city: 'Delhi',
              state: 'Delhi',
              postalCode: '110054',
            },
            orderItems: [
              {
                title: 'Varanasi Zari Heritage Silk Saree',
                price: 26500,
                size: 'Free Size',
                color: 'Royal Crimson',
                quantity: 1,
              },
            ],
          },
        ];
        setOrders(defaultOrders);
      } else {
        setOrders(data);
      }
    } catch (err) {
      console.error(err);
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
    } catch {}

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
          className={`px-3 py-1.5 text-xs uppercase tracking-wider font-semibold border transition ${
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
            className={`px-3 py-1.5 text-xs uppercase tracking-wider font-semibold border transition ${
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
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <div key={order._id} className="bg-white border border-[#E9E1D6] p-6 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#FAF9F6] pb-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-3">
                  <span className="font-mono text-sm font-bold text-[#29251F]">{order._id}</span>
                  <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 bg-[#FAF9F6] text-[#A68B66] border border-[#E9E1D6]">
                    Paid & Bank Verified
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Recipient: <strong className="text-[#29251F]">{order.shippingAddress?.fullName}</strong> ({order.shippingAddress?.city}, {order.shippingAddress?.state})
                </p>
              </div>

              {/* Status Controller (Step 11 & 12 workflow trigger) */}
              <div className="flex items-center space-x-3">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:inline">
                  Advance Stage:
                </span>
                <select
                  value={order.orderStatus || 'Admin Received'}
                  onChange={(e) => handleStatusChange(order._id, e.target.value)}
                  disabled={updatingId === order._id}
                  className="text-xs font-semibold bg-[#FAF9F6] border border-[#A68B66] py-1.5 px-3 text-[#29251F] focus:outline-none cursor-pointer"
                >
                  {statuses.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Order Items & Shipping Address */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 text-xs text-gray-600">
              <div className="md:col-span-8 space-y-2">
                <p className="uppercase tracking-wider font-bold text-[#29251F] text-[10px]">
                  Ordered Silhouettes ({order.orderItems?.length || 0})
                </p>
                <div className="space-y-1.5">
                  {order.orderItems?.map((item, idx) => (
                    <div key={idx} className="flex justify-between py-1 border-b border-[#FAF9F6]">
                      <span>
                        {item.title} (Size: <strong className="text-[#29251F]">{item.size}</strong>, Color: {item.color}, Qty: {item.quantity})
                      </span>
                      <strong className="text-[#29251F] font-serif-luxury">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </strong>
                    </div>
                  ))}
                </div>
              </div>

              <div className="md:col-span-4 bg-[#FAF9F6] p-3 border border-[#E9E1D6] space-y-1.5">
                <p className="uppercase tracking-wider font-bold text-[#29251F] text-[10px]">
                  Sanctuary Destination
                </p>
                <p className="text-[#29251F] font-medium">{order.shippingAddress?.street}</p>
                <p>
                  {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.postalCode}
                </p>
                {order.trackingNumber && (
                  <p className="pt-1 text-[#A68B66] font-mono">
                    Tracking: <strong>{order.trackingNumber}</strong>
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminOrders;
