import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  RefreshCw,
  Sparkles,
  ShoppingBag,
  ArrowRight,
} from 'lucide-react';
import { orderService } from '../services/orderService';
import { useAuth } from '../context/AuthContext';
import CustomerOrderCard from '../components/orders/CustomerOrderCard';

export const CustomerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'DELIVERED'
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();

  const fetchOrders = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await orderService.getMyOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching customer orders:', err);
      setOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Metric summaries
  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const activeOrders = orders.filter((o) => {
      const s = String(o.orderStatus || '').toLowerCase();
      return !s.includes('deliver') && !s.includes('cancel');
    }).length;
    const deliveredOrders = orders.filter((o) =>
      String(o.orderStatus || '').toLowerCase().includes('deliver')
    ).length;
    const totalSpent = orders.reduce((acc, o) => acc + (Number(o.totalPrice) || 0), 0);

    return { totalOrders, activeOrders, deliveredOrders, totalSpent };
  }, [orders]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const s = String(o.orderStatus || '').toLowerCase();
      const matchesTab =
        filterTab === 'ALL' ||
        (filterTab === 'ACTIVE' && !s.includes('deliver') && !s.includes('cancel')) ||
        (filterTab === 'DELIVERED' && s.includes('deliver'));

      if (!matchesTab) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      const matchId = String(o._id || '').toLowerCase().includes(q);
      const matchItem = o.orderItems?.some((item) =>
        String(item.title || item.product?.title || '').toLowerCase().includes(q)
      );

      return matchId || matchItem;
    });
  }, [orders, filterTab, searchQuery]);

  return (
    <div className="space-y-6 sm:space-y-8 pb-10">
      {/* =========================================================================
          PAGE HEADER WITH LUXURY TITLE & LIVE METRICS
          ========================================================================= */}
      <div className="bg-white border border-[#E9E1D6] rounded-2xl p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#E9E1D6]/70 pb-5">
          <div>
            <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-[0.25em] text-[#C5A059] font-cinzel">
              <Sparkles size={12} />
              <span>Patron Acquisitions</span>
            </div>
            <h2 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#14110C] mt-1 tracking-tight">
              Order History & Fulfillment Tracker
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 leading-relaxed">
              Follow your bespoke attire journey from the master artisan atelier to your doorstep.
            </p>
          </div>

          {/* Refresh Action */}
          <button
            type="button"
            onClick={() => fetchOrders(true)}
            disabled={refreshing || loading}
            className="self-start md:self-center inline-flex items-center gap-2 px-3.5 py-2 bg-[#FAF9F6] hover:bg-[#FAF7F2] text-[#29251F] border border-[#E9E1D6] rounded-xl text-xs font-semibold transition shadow-2xs active:scale-95 disabled:opacity-50"
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin text-[#C5A059]' : 'text-[#A68B66]'} />
            <span>{refreshing ? 'Syncing...' : 'Sync Live Status'}</span>
          </button>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-5">
          <div className="p-3.5 sm:p-4 rounded-xl bg-[#FAF9F6] border border-[#E9E1D6]/70">
            <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block">
              Total Orders
            </span>
            <p className="font-serif-luxury text-xl sm:text-2xl font-bold text-[#14110C] mt-1">
              {stats.totalOrders}
            </p>
          </div>

          <div className="p-3.5 sm:p-4 rounded-xl bg-[#FAF9F6] border border-[#E9E1D6]/70">
            <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block">
              In Transit / Active
            </span>
            <div className="flex items-center gap-2 mt-1">
              <p className="font-serif-luxury text-xl sm:text-2xl font-bold text-[#C5A059]">
                {stats.activeOrders}
              </p>
              {stats.activeOrders > 0 && (
                <span className="w-2 h-2 rounded-full bg-[#C5A059] animate-ping" />
              )}
            </div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-xl bg-[#FAF9F6] border border-[#E9E1D6]/70">
            <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block">
              Delivered Wardrobe
            </span>
            <p className="font-serif-luxury text-xl sm:text-2xl font-bold text-emerald-800 mt-1">
              {stats.deliveredOrders}
            </p>
          </div>

          <div className="p-3.5 sm:p-4 rounded-xl bg-[#FAF9F6] border border-[#E9E1D6]/70">
            <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block">
              Total Investment
            </span>
            <p className="font-serif-luxury text-xl sm:text-2xl font-bold text-[#14110C] mt-1 truncate">
              ₹{stats.totalSpent.toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      </div>

      {/* =========================================================================
          FILTER TABS & SEARCH CONTROLS
          ========================================================================= */}
      {orders.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-[#E9E1D6] p-3 sm:p-4 rounded-2xl shadow-xs">
          {/* Segmented Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-[#FAF9F6] border border-[#E9E1D6] rounded-xl overflow-x-auto no-scrollbar">
            {[
              { id: 'ALL', label: 'All Orders', count: stats.totalOrders },
              { id: 'ACTIVE', label: 'In Transit', count: stats.activeOrders },
              { id: 'DELIVERED', label: 'Delivered', count: stats.deliveredOrders },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterTab(tab.id)}
                className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  filterTab === tab.id
                    ? 'bg-[#14110C] text-[#FAF9F6] shadow-sm'
                    : 'text-[#29251F]/70 hover:text-[#C5A059] hover:bg-white'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`ml-1.5 text-[10px] px-1.5 py-0.2 rounded-full ${
                    filterTab === tab.id
                      ? 'bg-[#C5A059] text-[#14110C]'
                      : 'bg-white border border-[#E9E1D6] text-gray-500'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reference or product..."
              className="w-full pl-9 pr-3.5 py-2 bg-[#FAF9F6] border border-[#E9E1D6] rounded-xl text-xs text-[#14110C] placeholder-gray-400 focus:outline-none focus:border-[#C5A059] focus:bg-white transition"
            />
          </div>
        </div>
      )}

      {/* =========================================================================
          ORDERS LIST & EMPTY / LOADING STATES
          ========================================================================= */}
      {loading ? (
        <div className="bg-white border border-[#E9E1D6] rounded-2xl p-12 text-center space-y-4 shadow-xs">
          <div className="w-10 h-10 border-2 border-[#C5A059] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-cinzel text-xs font-bold uppercase tracking-widest text-[#C5A059]">
            Retrieving Patron Order Ledgers...
          </p>
        </div>
      ) : orders.length === 0 ? (
        /* Empty State */
        <div className="bg-white border border-[#E9E1D6] rounded-3xl p-8 sm:p-14 text-center space-y-5 shadow-xs max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-full bg-[#FAF9F6] border-2 border-[#E9E1D6] flex items-center justify-center mx-auto text-[#C5A059] shadow-xs">
            <ShoppingBag size={28} />
          </div>
          <div className="space-y-1.5">
            <span className="font-cinzel text-xs uppercase tracking-[0.25em] text-[#C5A059] font-bold">
              Atelier Awaiting
            </span>
            <h3 className="font-serif-luxury text-2xl font-bold text-[#14110C]">
              No Bespoke Orders Placed Yet
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
              When you acquire our handcrafted silks, royal sherwanis, or haute couture, your live fulfillment tracking will appear here.
            </p>
          </div>
          <div className="pt-2">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#14110C] hover:bg-[#C5A059] text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all duration-300 shadow-sm"
            >
              <span>Explore Exclusive Collections</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white border border-[#E9E1D6] rounded-2xl p-8 text-center space-y-2">
          <p className="text-sm font-semibold text-[#14110C]">No orders matched your search query.</p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setFilterTab('ALL');
            }}
            className="text-xs text-[#C5A059] hover:underline font-semibold"
          >
            Clear Search & Filters
          </button>
        </div>
      ) : (
        /* Order Cards List */
        <div className="space-y-6 sm:space-y-8">
          {filteredOrders.map((order, index) => (
            <CustomerOrderCard
              key={order._id}
              order={order}
              // Automatically expand the timeline for the very first order if it's currently active!
              defaultExpanded={index === 0 && !String(order.orderStatus || '').toLowerCase().includes('deliver')}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerOrders;
