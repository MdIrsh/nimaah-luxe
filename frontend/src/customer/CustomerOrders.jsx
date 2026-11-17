import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { orderService } from '../services/orderService';
import { useAuth } from '../context/AuthContext';

export const CustomerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await orderService.getMyOrders();
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching customer orders:', err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Workflow steps based on flowchart
  const workflowSteps = [
    'Order Placed',
    'Admin Received',
    'Processing & Tailoring',
    'Shipped',
    'Delivered',
  ];

  const getStepStatus = (currentStatus, stepName) => {
    const orderIndex = workflowSteps.indexOf(currentStatus);
    const stepIndex = workflowSteps.indexOf(stepName);

    if (orderIndex >= stepIndex) return 'completed';
    if (orderIndex === stepIndex - 1) return 'current';
    return 'pending';
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-[#E9E1D6] pb-4">
        <h2 className="font-serif-luxury text-2xl text-[#29251F]">Order History & Fulfillment Tracker</h2>
        <p className="text-xs text-gray-500 mt-1">
          Follow your bespoke attire journey from the master artisan atelier to your doorstep.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white border border-[#E9E1D6] p-12 text-center space-y-4">
          <Package size={32} className="mx-auto text-gray-300" />
          <h3 className="font-serif-luxury text-xl">No Orders Placed Yet</h3>
          <p className="text-xs text-gray-500">Your acquisitions will appear here with live tracking.</p>
          <Link
            to="/shop"
            className="inline-block px-6 py-2.5 bg-[#29251F] text-white text-xs uppercase tracking-widest"
          >
            Explore Collections
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {orders.map((order) => (
            <div key={order._id} className="bg-white border border-[#E9E1D6] shadow-sm overflow-hidden">
              {/* Order Meta Header */}
              <div className="bg-[#FAF9F6] border-b border-[#E9E1D6] p-4 sm:p-6 flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-gray-400">Order Reference</span>
                  <p className="font-mono text-xs font-bold text-[#29251F]">{order._id}</p>
                  <p className="text-[10px] text-gray-500">
                    Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' })}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-gray-400">Total Investment</span>
                  <p className="font-serif-luxury text-base font-semibold text-[#29251F]">
                    ₹{order.totalPrice?.toLocaleString('en-IN')}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-gray-400">Fulfillment Status</span>
                  <span className="inline-block px-2.5 py-1 bg-[#29251F] text-[#FAF9F6] text-xs font-semibold uppercase tracking-wider">
                    {order.orderStatus || 'Admin Received'}
                  </span>
                </div>
              </div>

              {/* Workflow Stepper Diagram (Flowchart Implementation) */}
              <div className="p-6 border-b border-[#E9E1D6] bg-white">
                <p className="text-[11px] uppercase tracking-widest text-[#A68B66] font-semibold mb-4">
                  Flowchart Timeline: Atelier to Patron
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 relative">
                  {workflowSteps.map((step, idx) => {
                    const status = getStepStatus(order.orderStatus || 'Admin Received', step);
                    return (
                      <div
                        key={step}
                        className={`p-3 border text-center rounded-sm transition ${
                          status === 'completed'
                            ? 'bg-[#29251F] text-white border-[#29251F]'
                            : status === 'current'
                            ? 'bg-[#E9E1D6] text-[#29251F] border-[#A68B66] font-semibold'
                            : 'bg-[#FAF9F6] text-gray-400 border-[#E9E1D6]'
                        }`}
                      >
                        <span className="block text-[10px] uppercase font-bold tracking-wider mb-1">
                          Step {idx + 1}
                        </span>
                        <span className="text-xs">{step}</span>
                      </div>
                    );
                  })}
                </div>

                {order.trackingNumber && (
                  <div className="mt-4 p-3 bg-[#FAF9F6] border border-[#E9E1D6] flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <Truck size={16} className="text-[#A68B66]" />
                      <span>
                        Shipped via <strong>{order.courierPartner || 'BlueDart Luxury Express'}</strong>. Waybill:
                        <code className="ml-1 bg-white px-1.5 py-0.5 border border-[#E9E1D6] text-[#29251F] font-mono">
                          {order.trackingNumber}
                        </code>
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Order Items */}
              <div className="p-6 divide-y divide-[#FAF9F6]">
                {order.orderItems?.map((item, idx) => (
                  <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-14 h-20 object-cover object-top border border-[#E9E1D6]"
                      />
                      <div>
                        <h4 className="font-serif-luxury text-sm text-[#29251F] font-semibold">{item.title}</h4>
                        <p className="text-xs text-gray-500">
                          Size: <strong>{item.size}</strong> • Color: <strong>{item.color}</strong> • Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="font-serif-luxury text-sm font-semibold text-[#29251F]">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerOrders;
