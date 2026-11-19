import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  ShoppingCart,
  Users,
  IndianRupee,
  TrendingUp,
  ArrowRight,
  Eye,
  Heart,
  ChevronDown,
  Gift,
  ExternalLink,
  Plus,
} from 'lucide-react';
import api from '../services/api';
import { FALLBACK_PRODUCT_IMAGE } from '../services/productService';

export const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    orderStatusMap: {
      Delivered: 0,
      Processing: 0,
      Shipped: 0,
      Cancelled: 0,
    },
    recentOrders: [],
  });

  const [topProducts, setTopProducts] = useState([]);
  const [activeTimeFilter, setActiveTimeFilter] = useState('1M');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, prodRes] = await Promise.allSettled([
          api.get('/admin/stats'),
          api.get('/products?sort=popular'),
        ]);

        if (statsRes.status === 'fulfilled' && statsRes.value.data?.success) {
          const live = statsRes.value.data.data;
          setStats({
            totalProducts: live.totalProducts ?? 0,
            totalOrders: live.totalOrders ?? 0,
            totalCustomers: live.totalCustomers ?? 0,
            totalRevenue: live.totalRevenue ?? 0,
            orderStatusMap: live.orderStatusMap || {},
            recentOrders: Array.isArray(live.recentOrders) ? live.recentOrders : [],
          });
        }

        if (prodRes.status === 'fulfilled' && prodRes.value.data?.success) {
          const prods = prodRes.value.data.data?.products || [];
          setTopProducts(prods.slice(0, 3));
        }
      } catch (err) {
        console.error('Failed to load dashboard live data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const totalOrdersCount = stats.totalOrders || 0;
  const delivCount = stats.orderStatusMap?.['Delivered'] || 0;
  const procCount =
    (stats.orderStatusMap?.['Processing & Tailoring'] || 0) +
    (stats.orderStatusMap?.['Order Placed'] || 0) +
    (stats.orderStatusMap?.['Admin Received'] || 0);
  const shipCount = stats.orderStatusMap?.['Shipped'] || 0;
  const cancCount = stats.orderStatusMap?.['Cancelled'] || 0;

  const delivPct = totalOrdersCount > 0 ? Math.round((delivCount / totalOrdersCount) * 100) : 0;
  const procPct = totalOrdersCount > 0 ? Math.round((procCount / totalOrdersCount) * 100) : 0;
  const shipPct = totalOrdersCount > 0 ? Math.round((shipCount / totalOrdersCount) * 100) : 0;
  const cancPct = totalOrdersCount > 0 ? Math.max(0, 100 - delivPct - procPct - shipPct) : 0;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* =========================================================================
          1. TOP WELCOME & HERO PROMO ROW (Exact Match)
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Welcome Card */}
        <div className="lg:col-span-5 bg-gradient-to-r from-[#FFFDF9] via-[#FAF6EE] to-[#F5ECE0] border border-[#E8DEC8] rounded-2xl p-6 sm:p-7 flex flex-col justify-center relative overflow-hidden shadow-2xs">
          <div className="relative z-10 space-y-1.5">
            <h2 className="text-xl sm:text-2xl font-bold text-[#14110C] flex items-center gap-2">
              <span>👋</span>
              <span>Welcome Back, Admin!</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-600">
              Here's what's happening with your store today.
            </p>
          </div>
          {/* Subtle Decorative Floral Motif */}
          <div className="absolute right-0 top-0 bottom-0 w-36 pointer-events-none opacity-30 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#C5A059]/40 via-transparent to-transparent" />
        </div>

        {/* Right Hero Banner Card */}
        <div className="lg:col-span-7 bg-[#EDE4D5] rounded-2xl border border-[#DECDB3] overflow-hidden relative shadow-2xs min-h-[140px] flex items-center">
          <div className="p-6 sm:p-8 z-10 space-y-1.5 max-w-md">
            <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#C5A059] font-cinzel block">
              N'MAAH LUXE
            </span>
            <h3 className="font-serif-luxury text-2xl sm:text-3xl font-semibold text-[#14110C] leading-tight">
              Fashion Beyond Limits
            </h3>
            <p className="text-xs text-gray-700 pb-2">
              Manage your store with ease
            </p>
            <Link
              to="/admin/products"
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-[#29251F] hover:bg-[#C5A059] text-white rounded-full text-xs font-semibold tracking-wider transition shadow-sm"
            >
              <span>Manage Store</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          {/* Model Banner Image on the right */}
          <div className="absolute right-0 top-0 bottom-0 w-1/2 sm:w-2/5 overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80"
              alt="Ni'maah Luxe Model"
              className="w-full h-full object-cover object-top filter contrast-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#EDE4D5] via-transparent to-transparent" />
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. 4 KPI METRIC CARDS WITH SPARKLINES (Exact Match)
          ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Products */}
        <div className="bg-white border border-[#EAE1D1] rounded-2xl p-5 shadow-2xs hover:shadow-xs transition space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-xl bg-[#FDF6E9] border border-[#F6E3BE] flex items-center justify-center text-[#C5A059]">
              <ShoppingBag size={20} />
            </div>
            <div className="w-28 h-9">
              {/* Mini Sparkline Curve */}
              <svg viewBox="0 0 100 35" className="w-full h-full">
                <defs>
                  <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#C5A059" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#C5A059" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0 25 Q20 5 40 22 T80 10 T100 6 L100 35 L0 35 Z"
                  fill="url(#goldGrad)"
                />
                <path
                  d="M0 25 Q20 5 40 22 T80 10 T100 6"
                  fill="none"
                  stroke="#C5A059"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
          <div>
            <span className="text-[11px] text-gray-500 font-medium">Total Products</span>
            <div className="flex items-baseline justify-between mt-0.5">
              <span className="text-2xl font-bold text-[#14110C]">
                {stats.totalProducts.toLocaleString()}
              </span>
              <span className="text-[11px] font-semibold text-emerald-600 flex items-center">
                ↑ 12%
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Orders */}
        <div className="bg-white border border-[#EAE1D1] rounded-2xl p-5 shadow-2xs hover:shadow-xs transition space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-xl bg-[#FEF1EC] border border-[#FBD9CD] flex items-center justify-center text-[#E06D44]">
              <ShoppingCart size={20} />
            </div>
            <div className="w-28 h-9">
              <svg viewBox="0 0 100 35" className="w-full h-full">
                <defs>
                  <linearGradient id="orangeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#E06D44" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#E06D44" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0 28 Q25 20 50 12 T80 18 T100 8 L100 35 L0 35 Z"
                  fill="url(#orangeGrad)"
                />
                <path
                  d="M0 28 Q25 20 50 12 T80 18 T100 8"
                  fill="none"
                  stroke="#E06D44"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
          <div>
            <span className="text-[11px] text-gray-500 font-medium">Total Orders</span>
            <div className="flex items-baseline justify-between mt-0.5">
              <span className="text-2xl font-bold text-[#14110C]">
                {stats.totalOrders.toLocaleString()}
              </span>
              <span className="text-[11px] font-semibold text-emerald-600 flex items-center">
                ↑ 18%
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Total Customers */}
        <div className="bg-white border border-[#EAE1D1] rounded-2xl p-5 shadow-2xs hover:shadow-xs transition space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-xl bg-[#F2EDFD] border border-[#DFD3FA] flex items-center justify-center text-[#7C57E8]">
              <Users size={20} />
            </div>
            <div className="w-28 h-9">
              <svg viewBox="0 0 100 35" className="w-full h-full">
                <defs>
                  <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7C57E8" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#7C57E8" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0 26 Q30 26 55 16 T85 14 T100 6 L100 35 L0 35 Z"
                  fill="url(#purpleGrad)"
                />
                <path
                  d="M0 26 Q30 26 55 16 T85 14 T100 6"
                  fill="none"
                  stroke="#7C57E8"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
          <div>
            <span className="text-[11px] text-gray-500 font-medium">Total Customers</span>
            <div className="flex items-baseline justify-between mt-0.5">
              <span className="text-2xl font-bold text-[#14110C]">
                {stats.totalCustomers.toLocaleString()}
              </span>
              <span className="text-[11px] font-semibold text-emerald-600 flex items-center">
                ↑ 20%
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Total Revenue */}
        <div className="bg-white border border-[#EAE1D1] rounded-2xl p-5 shadow-2xs hover:shadow-xs transition space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-xl bg-[#ECFBF4] border border-[#C6F5DE] flex items-center justify-center text-[#10B981] font-bold text-lg">
              ₹
            </div>
            <div className="w-28 h-9">
              <svg viewBox="0 0 100 35" className="w-full h-full">
                <defs>
                  <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0 30 Q20 18 45 22 T80 8 T100 5 L100 35 L0 35 Z"
                  fill="url(#greenGrad)"
                />
                <path
                  d="M0 30 Q20 18 45 22 T80 8 T100 5"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
          <div>
            <span className="text-[11px] text-gray-500 font-medium">Total Revenue</span>
            <div className="flex items-baseline justify-between mt-0.5">
              <span className="text-2xl font-bold text-[#14110C]">
                ₹{stats.totalRevenue.toLocaleString('en-IN')}
              </span>
              <span className="text-[11px] font-semibold text-emerald-600 flex items-center">
                ↑ 25%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          3. MIDDLE ROW: SALES ANALYTICS & ORDER STATUS (Exact Match)
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Sales Analytics Chart (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-[#EAE1D1] rounded-2xl p-6 shadow-2xs space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
            <div className="flex items-center space-x-2">
              <span className="text-base font-bold text-[#14110C]">
                📊 Sales Analytics
              </span>
            </div>

            <div className="flex items-center space-x-3 text-xs">
              {/* Legend */}
              <div className="hidden sm:flex items-center space-x-4 pr-2 text-gray-500 text-[11px]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#C5A059]" />
                  <span>Revenue</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                  <span>Orders</span>
                </span>
              </div>

              {/* Time Filters */}
              <div className="flex items-center bg-[#F7F3EB] rounded-lg p-0.5 text-[11px] font-medium">
                {['7D', '30D', '3M', '1M'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setActiveTimeFilter(t)}
                    className={`px-2.5 py-1 rounded-md transition ${
                      activeTimeFilter === t
                        ? 'bg-[#8C6D37] text-white font-semibold shadow-xs'
                        : 'text-gray-600 hover:text-black'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div className="px-2.5 py-1 bg-[#FAF7F2] border border-[#E5DAC6] rounded-md text-[11px] font-medium flex items-center gap-1 cursor-pointer">
                <span>Revenue</span>
                <ChevronDown size={12} />
              </div>
            </div>
          </div>

          {/* Interactive Chart Canvas Area */}
          <div className="relative pt-4 pb-2">
            {/* Hover Tooltip on Apr 21 (Exact match) */}
            <div className="absolute left-[70%] top-[25%] -translate-x-1/2 -translate-y-full bg-white border border-[#E5DAC6] rounded-lg px-2.5 py-1 text-center shadow-md pointer-events-none z-10">
              <span className="text-[11px] font-bold text-[#14110C] block">₹1,25,000</span>
              <span className="text-[9.5px] text-gray-400">Apr 21</span>
            </div>

            <svg viewBox="0 0 600 220" className="w-full h-56 sm:h-64">
              <defs>
                <linearGradient id="mainAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#C5A059" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#C5A059" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid lines */}
              <line x1="50" y1="30" x2="590" y2="30" stroke="#F3EDE3" strokeDasharray="3 3" />
              <line x1="50" y1="80" x2="590" y2="80" stroke="#F3EDE3" strokeDasharray="3 3" />
              <line x1="50" y1="130" x2="590" y2="130" stroke="#F3EDE3" strokeDasharray="3 3" />
              <line x1="50" y1="180" x2="590" y2="180" stroke="#F3EDE3" strokeDasharray="3 3" />

              {/* Y Axis Labels */}
              <text x="10" y="34" className="text-[9.5px] fill-gray-400 font-sans">₹1.5L</text>
              <text x="15" y="84" className="text-[9.5px] fill-gray-400 font-sans">₹1L</text>
              <text x="10" y="134" className="text-[9.5px] fill-gray-400 font-sans">₹50k</text>
              <text x="25" y="184" className="text-[9.5px] fill-gray-400 font-sans">₹0</text>

              {/* Shaded Area */}
              <path
                d="M50 160 L100 135 L170 145 L250 120 L300 130 L370 125 L430 75 L490 120 L540 125 L590 115 L590 180 L50 180 Z"
                fill="url(#mainAreaGrad)"
              />

              {/* Spline Path */}
              <path
                d="M50 160 L100 135 L170 145 L250 120 L300 130 L370 125 L430 75 L490 120 L540 125 L590 115"
                fill="none"
                stroke="#C5A059"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data points */}
              {[
                [50, 160],
                [100, 135],
                [170, 145],
                [250, 120],
                [300, 130],
                [370, 125],
                [430, 75],
                [490, 120],
                [540, 125],
                [590, 115],
              ].map(([cx, cy], i) => (
                <circle
                  key={i}
                  cx={cx}
                  cy={cy}
                  r={cx === 430 ? '5' : '3.5'}
                  fill={cx === 430 ? '#C5A059' : '#FFFFFF'}
                  stroke="#C5A059"
                  strokeWidth="2"
                />
              ))}

              {/* X Axis Labels */}
              <text x="50" y="205" className="text-[10px] fill-gray-500 font-sans text-anchor-middle">Apr 1</text>
              <text x="170" y="205" className="text-[10px] fill-gray-500 font-sans text-anchor-middle">Apr 7</text>
              <text x="300" y="205" className="text-[10px] fill-gray-500 font-sans text-anchor-middle">Apr 14</text>
              <text x="430" y="205" className="text-[10px] fill-gray-500 font-sans text-anchor-middle">Apr 21</text>
              <text x="560" y="205" className="text-[10px] fill-gray-500 font-sans text-anchor-middle">Apr 30</text>
            </svg>
          </div>
        </div>

        {/* Right: Order Status & Special Offer Card (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          {/* Order Status Widget */}
          <div className="bg-white border border-[#EAE1D1] rounded-2xl p-5 shadow-2xs flex-1 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-[#14110C]">Order Status</span>
              <Link
                to="/admin/orders"
                className="text-xs text-[#C5A059] font-semibold hover:underline flex items-center gap-0.5"
              >
                <span>View All</span>
                <ArrowRight size={12} />
              </Link>
            </div>

            <div className="flex items-center justify-between gap-4 pt-1">
              {/* Donut Chart with Center Text */}
              <div className="relative w-32 h-32 flex-shrink-0">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  {totalOrdersCount === 0 ? (
                    <circle
                      cx="18"
                      cy="18"
                      r="15"
                      fill="none"
                      stroke="#EAE1D1"
                      strokeWidth="4"
                    />
                  ) : (
                    <>
                      {/* Delivered: Green */}
                      <circle
                        cx="18"
                        cy="18"
                        r="15"
                        fill="none"
                        stroke="#10B981"
                        strokeWidth="4"
                        strokeDasharray={`${delivPct} 100`}
                        strokeDashoffset="0"
                      />
                      {/* Processing: Amber */}
                      <circle
                        cx="18"
                        cy="18"
                        r="15"
                        fill="none"
                        stroke="#F59E0B"
                        strokeWidth="4"
                        strokeDasharray={`${procPct} 100`}
                        strokeDashoffset={`-${delivPct}`}
                      />
                      {/* Shipped: Indigo */}
                      <circle
                        cx="18"
                        cy="18"
                        r="15"
                        fill="none"
                        stroke="#6366F1"
                        strokeWidth="4"
                        strokeDasharray={`${shipPct} 100`}
                        strokeDashoffset={`-${delivPct + procPct}`}
                      />
                      {/* Cancelled: Red */}
                      <circle
                        cx="18"
                        cy="18"
                        r="15"
                        fill="none"
                        stroke="#EF4444"
                        strokeWidth="4"
                        strokeDasharray={`${cancPct} 100`}
                        strokeDashoffset={`-${delivPct + procPct + shipPct}`}
                      />
                    </>
                  )}
                </svg>

                {/* Donut Center Count */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-sm font-bold text-[#14110C] leading-none">
                    {totalOrdersCount.toLocaleString()}
                  </span>
                  <span className="text-[8.5px] text-gray-400 font-medium mt-0.5">
                    Total Orders
                  </span>
                </div>
              </div>

              {/* Status Breakdown Legend */}
              <div className="space-y-2 text-xs flex-1">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-gray-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                    <span>Delivered</span>
                  </span>
                  <span className="font-semibold text-gray-800">
                    {delivPct}% ({delivCount})
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-gray-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                    <span>Processing</span>
                  </span>
                  <span className="font-semibold text-gray-800">
                    {procPct}% ({procCount})
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-gray-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#6366F1]" />
                    <span>Shipped</span>
                  </span>
                  <span className="font-semibold text-gray-800">
                    {shipPct}% ({shipCount})
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-gray-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
                    <span>Cancelled</span>
                  </span>
                  <span className="font-semibold text-gray-800">
                    {cancPct}% ({cancCount})
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Special Offer Promo Card */}
          <div className="bg-[#FAF3E8] border border-[#E9DEC8] rounded-2xl p-4 flex items-center justify-between relative overflow-hidden shadow-2xs">
            <div className="space-y-1 z-10 max-w-[65%]">
              <div className="flex items-center gap-1.5 text-[#C5A059] text-[10.5px] font-bold uppercase tracking-wider">
                <Gift size={13} />
                <span>Special Offer</span>
              </div>
              <h4 className="font-serif-luxury text-sm font-bold text-[#14110C] leading-tight">
                Flat 30% OFF
              </h4>
              <p className="text-[10px] text-gray-600">on Premium Collection</p>
              <Link
                to="/admin/products"
                className="mt-1 px-3 py-1 bg-[#14110C] hover:bg-[#C5A059] text-white rounded-md text-[10px] font-semibold transition inline-flex items-center gap-1"
              >
                <span>Curate Collection</span>
                <ArrowRight size={10} />
              </Link>
            </div>

            <div className="w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden shadow-xs">
              <img
                src="https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=400&q=80"
                alt="Luxury Bag"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          4. BOTTOM ROW: RECENT ORDERS TABLE & TOP SELLING PRODUCTS (100% Real Live Data)
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Recent Orders Table (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-[#EAE1D1] rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-base font-bold text-[#14110C]">
                👜 Recent Orders
              </span>
              <span className="text-[10px] bg-[#FAF3E8] border border-[#E9DEC8] text-[#C5A059] px-2 py-0.5 rounded-full font-semibold">
                Live MongoDB
              </span>
            </div>
            <Link
              to="/admin/orders"
              className="text-xs text-[#C5A059] font-semibold hover:underline flex items-center gap-0.5"
            >
              <span>View All Orders</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#F0E6D8] text-[10.5px] text-gray-400 uppercase tracking-wider font-semibold">
                  <th className="py-2.5 px-3">Order ID</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Payment</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F6EFE5]">
                {stats.recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-gray-400 text-xs">
                      No real customer orders yet. Live orders will automatically appear here.
                    </td>
                  </tr>
                ) : (
                  stats.recentOrders.map((ord) => {
                    const statusColor =
                      ord.orderStatus === 'Delivered'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : ord.orderStatus === 'Shipped'
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        : ord.orderStatus === 'Cancelled'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200';

                    const paymentColor = ord.isPaid
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200';

                    const formattedDate = ord.createdAt
                      ? new Date(ord.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : 'Recent';

                    const customerName =
                      ord.user?.name ||
                      ord.shippingAddress?.fullName ||
                      'Valued Patron';

                    const shortId = `#${(ord._id || '').slice(-6).toUpperCase()}`;

                    return (
                      <tr key={ord._id} className="hover:bg-[#FAF7F2] transition">
                        <td className="py-3 px-3 font-semibold text-[#14110C] font-mono">
                          {shortId}
                        </td>
                        <td className="py-3 px-3 font-medium text-gray-700">
                          {customerName}
                        </td>
                        <td className="py-3 px-3 font-semibold text-[#14110C]">
                          ₹{(ord.totalPrice || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${statusColor}`}
                          >
                            {ord.orderStatus || 'Processing'}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${paymentColor}`}
                          >
                            {ord.isPaid ? 'Paid' : 'Pending'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-gray-500 text-[11px]">
                          {formattedDate}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <Link
                            to="/admin/orders"
                            className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[#F8F5F0] hover:bg-[#C5A059] hover:text-white text-gray-600 transition shadow-2xs"
                            title="View order in pipeline"
                          >
                            <Eye size={13} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Top Selling Products (4 cols - Real Catalog) */}
        <div className="lg:col-span-4 bg-white border border-[#EAE1D1] rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-[#14110C]">
              🏆 Top Selling Products
            </span>
            <Link
              to="/admin/products"
              className="text-xs text-[#C5A059] font-semibold hover:underline flex items-center gap-0.5"
            >
              <span>View All Products</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          {topProducts.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-400">
              No products found in atelier catalog.
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {topProducts.map((p, index) => {
                const rankBadges = [
                  'bg-[#C5A059] text-white',
                  'bg-gray-400 text-white',
                  'bg-[#D4A373] text-white',
                ];
                const rankText = `#${index + 1}`;
                const rankClass = rankBadges[index] || 'bg-[#29251F] text-white';
                const imageSrc =
                  p.images?.[0] ||
                  'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=400&q=80';

                return (
                  <div
                    key={p._id || index}
                    className="bg-[#FAF7F2] border border-[#E8DEC8] rounded-xl p-2.5 flex flex-col justify-between relative group hover:shadow-sm transition"
                  >
                    {/* Wishlist Heart Top Right */}
                    <button className="absolute top-3.5 right-3.5 p-1 rounded-full bg-white/80 text-gray-400 hover:text-red-500 transition shadow-2xs">
                      <Heart size={11} />
                    </button>

                    {/* Product Image + Rank Badge */}
                    <div className="relative w-full h-32 rounded-lg overflow-hidden bg-white mb-2 shadow-2xs">
                      <img
                        src={imageSrc}
                        alt={p.title}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = FALLBACK_PRODUCT_IMAGE;
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300 bg-white"
                      />
                      <span
                        className={`absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-md text-[9px] font-bold shadow-xs ${rankClass}`}
                      >
                        {rankText}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="space-y-0.5">
                      <h5 className="text-[11px] font-semibold text-[#14110C] line-clamp-1 leading-tight">
                        {p.title}
                      </h5>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-[#14110C]">
                          ₹{((p.discountedPrice !== undefined ? p.discountedPrice : p.price) || 0).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <span className="text-[9.5px] text-gray-500 block">
                        {p.stockCount ?? 0} in stock
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
