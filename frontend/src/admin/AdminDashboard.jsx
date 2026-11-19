import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  ShoppingBag,
  Package,
  Users,
  TrendingUp,
  RotateCcw,
} from 'lucide-react';
import { productService } from '../services/productService';
import { orderService } from '../services/orderService';
import api from '../services/api';

export const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    orderStatusMap: {
      'Order Placed': 0,
      'Admin Received': 0,
      'Processing & Tailoring': 0,
      'Shipped': 0,
      'Delivered': 0,
      'Cancelled': 0,
    },
    lowStockCount: 0,
    lowStockProducts: [],
    recentOrders: [],
  });
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/stats');
      if (res.data?.success && res.data.data) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching admin dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const totalRevenue = stats.totalRevenue;
  const totalOrders = stats.totalOrders;
  const adminReceivedCount = stats.orderStatusMap?.['Admin Received'] || 0;
  const processingCount = stats.orderStatusMap?.['Processing & Tailoring'] || 0;
  const shippedCount = stats.orderStatusMap?.['Shipped'] || 0;
  const deliveredCount = stats.orderStatusMap?.['Delivered'] || 0;

  const handleSeedData = async () => {
    setSeeding(true);
    try {
      await productService.seedProducts();
      await fetchStats();
      alert("Ni'maah Luxe luxury catalog successfully seeded into MongoDB!");
    } catch (err) {
      alert('Failed to seed catalog. Check MongoDB connection.');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 border-b border-[#E9E1D6] pb-8">
        <div>
          <span className="text-[11px] uppercase tracking-[0.35em] text-[#C5A059] font-cinzel font-semibold">
            Administrative Headquarters
          </span>
          <h1 className="font-serif-luxury text-3xl sm:text-4xl text-[#29251F] mt-1.5">
            Live Store Performance & MongoDB Data
          </h1>
        </div>

        <div className="flex items-center space-x-3.5">
          <button
            onClick={handleSeedData}
            disabled={seeding}
            className="px-5 py-2.5 bg-[#E9E1D6] hover:bg-[#d8cebf] text-[#29251F] text-xs uppercase tracking-widest font-semibold flex items-center space-x-2 transition shadow-xs"
          >
            <RotateCcw size={14} className={seeding ? 'animate-spin' : ''} />
            <span>{seeding ? 'Seeding...' : 'Seed Products'}</span>
          </button>

          <Link
            to="/admin/products"
            className="px-5 py-2.5 bg-[#29251F] text-white hover:bg-[#C5A059] text-xs uppercase tracking-widest font-semibold transition shadow-xs"
          >
            Manage Catalog
          </Link>
        </div>
      </div>

      {/* Real MongoDB KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7">
        <div className="bg-white border border-[#E9E1D6] p-7 space-y-3 shadow-xs">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs uppercase tracking-wider font-semibold font-cinzel">Total Revenue</span>
            <div className="p-2.5 bg-[#FAF9F6] text-[#C5A059] rounded-xs border border-[#E9E1D6]">
              <DollarSign size={18} />
            </div>
          </div>
          <p className="font-serif-luxury text-3xl font-semibold text-[#29251F]">
            ₹{totalRevenue.toLocaleString('en-IN')}
          </p>
          <div className="flex items-center space-x-1.5 text-xs text-emerald-700 font-medium">
            <TrendingUp size={14} />
            <span>Live from MongoDB orders</span>
          </div>
        </div>

        <div className="bg-white border border-[#E9E1D6] p-7 space-y-3 shadow-xs">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs uppercase tracking-wider font-semibold font-cinzel">Total Orders</span>
            <div className="p-2.5 bg-[#FAF9F6] text-[#C5A059] rounded-xs border border-[#E9E1D6]">
              <Package size={18} />
            </div>
          </div>
          <p className="font-serif-luxury text-3xl font-semibold text-[#29251F]">
            {totalOrders}
          </p>
          <div className="flex items-center space-x-1 text-xs text-gray-500 font-light">
            <span>Synced with Atlas</span>
          </div>
        </div>

        <div className="bg-white border border-[#E9E1D6] p-7 space-y-3 shadow-xs">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs uppercase tracking-wider font-semibold font-cinzel">Active Products</span>
            <div className="p-2.5 bg-[#FAF9F6] text-[#C5A059] rounded-xs border border-[#E9E1D6]">
              <ShoppingBag size={18} />
            </div>
          </div>
          <p className="font-serif-luxury text-3xl font-semibold text-[#29251F]">
            {stats.totalProducts}
          </p>
          <div className="flex items-center space-x-1 text-xs text-gray-500 font-light">
            <span>Live catalog count</span>
          </div>
        </div>

        <div className="bg-white border border-[#E9E1D6] p-7 space-y-3 shadow-xs">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs uppercase tracking-wider font-semibold font-cinzel">Total Customers</span>
            <div className="p-2.5 bg-[#FAF9F6] text-[#C5A059] rounded-xs border border-[#E9E1D6]">
              <Users size={18} />
            </div>
          </div>
          <p className="font-serif-luxury text-3xl font-semibold text-[#29251F]">
            {stats.totalCustomers}
          </p>
          <div className="flex items-center space-x-1 text-xs text-emerald-700 font-medium">
            <span>Stored in nimaah_luxe.users</span>
          </div>
        </div>
      </div>

      {/* Live Flowchart Pipeline Fulfillment Counts */}
      <div className="bg-white border border-[#E9E1D6] p-8 space-y-5 shadow-xs">
        <h3 className="font-serif-luxury text-2xl text-[#29251F] border-b border-[#E9E1D6] pb-4">
          Live Order Fulfillment Pipeline
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
          <div className="p-5 bg-[#FAF9F6] border border-[#E9E1D6] text-center space-y-1.5 shadow-2xs">
            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 font-cinzel">Step 11</span>
            <p className="text-xs font-semibold text-[#29251F]">Admin Receives Order</p>
            <p className="text-xl font-serif-luxury text-[#C5A059] font-bold">{adminReceivedCount} Orders</p>
          </div>

          <div className="p-5 bg-[#FAF9F6] border border-[#E9E1D6] text-center space-y-1.5 shadow-2xs">
            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 font-cinzel">Step 12-A</span>
            <p className="text-xs font-semibold text-[#29251F]">Processing & Tailoring</p>
            <p className="text-xl font-serif-luxury text-[#C5A059] font-bold">{processingCount} Orders</p>
          </div>

          <div className="p-5 bg-[#FAF9F6] border border-[#E9E1D6] text-center space-y-1.5 shadow-2xs">
            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 font-cinzel">Step 12-B</span>
            <p className="text-xs font-semibold text-[#29251F]">Shipped (In Transit)</p>
            <p className="text-xl font-serif-luxury text-[#C5A059] font-bold">{shippedCount} Orders</p>
          </div>

          <div className="p-5 bg-[#FAF9F6] border border-[#E9E1D6] text-center space-y-1.5 shadow-2xs">
            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 font-cinzel">Step 13</span>
            <p className="text-xs font-semibold text-[#29251F]">Customer Receives Dress</p>
            <p className="text-xl font-serif-luxury text-emerald-700 font-bold">{deliveredCount} Delivered</p>
          </div>
        </div>
      </div>

      {/* Live Registered Users Table from MongoDB */}
      <div className="bg-white border border-[#E9E1D6] p-8 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-[#E9E1D6] pb-4">
          <h3 className="font-serif-luxury text-2xl text-[#29251F]">
            Registered Clients & Login Activity ({users.length})
          </h3>
        </div>

        {users.length === 0 ? (
          <p className="text-xs text-gray-500">No users registered yet in MongoDB.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF9F6] text-gray-500 uppercase tracking-wider border-b border-[#E9E1D6]">
                <tr>
                  <th className="py-3.5 px-5 font-cinzel">Name</th>
                  <th className="py-3.5 px-5 font-cinzel">Email</th>
                  <th className="py-3.5 px-5 font-cinzel">Role</th>
                  <th className="py-3.5 px-5 font-cinzel">Last Login</th>
                  <th className="py-3.5 px-5 font-cinzel">Logins</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#FAF9F6]">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-[#FAF9F6]/60 transition">
                    <td className="py-3.5 px-5 font-semibold text-[#29251F]">{u.name}</td>
                    <td className="py-3.5 px-5 text-gray-600">{u.email}</td>
                    <td className="py-3.5 px-5">
                      <span className="px-2.5 py-0.5 text-[10px] uppercase bg-[#FAF9F6] border border-[#E9E1D6] font-semibold text-[#A68B66]">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-gray-500">
                      {u.lastLoginAt
                        ? new Date(u.lastLoginAt).toLocaleString('en-IN')
                        : new Date(u.createdAt).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-5 font-semibold text-[#29251F]">{u.loginCount || 1}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
