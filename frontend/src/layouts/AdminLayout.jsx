import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  Archive,
  Tag,
  Star,
  BarChart3,
  Settings,
  User,
  LogOut,
  Search,
  Bell,
  Sun,
  ChevronDown,
  ArrowRight,
  Menu,
  X,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  CheckCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import logoImg from '../assets/nimaah-luxe-logo.png';

export const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Strict RBAC Guard: Ensure user is authenticated and holds administrative authority
  useEffect(() => {
    if (!user) {
      navigate('/admin/login', { replace: true });
    } else {
      const role = (user.role || '').toLowerCase();
      if (role !== 'admin' && role !== 'super_admin') {
        navigate('/', { replace: true });
      }
    }
  }, [user, navigate]);

  // Live Notifications State
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationRef = useRef(null);

  const [notifications, setNotifications] = useState([]);

  // Fetch real live orders and low stock items from backend (Zero dummy data)
  useEffect(() => {
    const fetchLiveAlerts = async () => {
      try {
        const res = await api.get('/admin/stats');
        if (res.data?.success && res.data.data) {
          const { recentOrders, lowStockProducts } = res.data.data;
          const liveList = [];

          if (recentOrders && recentOrders.length > 0) {
            recentOrders.slice(0, 4).forEach((ord) => {
              liveList.push({
                id: `live_ord_${ord._id}`,
                type: 'order',
                title: `Order #${ord._id.slice(-6).toUpperCase()}`,
                desc: `${ord.user?.name || ord.shippingAddress?.fullName || 'Patron'} placed an order for ₹${(ord.totalPrice || 0).toLocaleString('en-IN')} via ${ord.paymentMethod || 'Razorpay'}`,
                time: new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                unread: true,
                link: '/admin/orders',
                icon: ShoppingBag,
                color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
              });
            });
          }

          if (lowStockProducts && lowStockProducts.length > 0) {
            lowStockProducts.slice(0, 3).forEach((p) => {
              liveList.push({
                id: `live_stk_${p._id}`,
                type: 'stock',
                title: 'Low Stock Alert',
                desc: `${p.title} has only ${p.stockCount} items remaining in atelier`,
                time: 'Live',
                unread: true,
                link: '/admin/products',
                icon: AlertTriangle,
                color: 'text-amber-600 bg-amber-50 border-amber-200',
              });
            });
          }

          setNotifications(liveList);
        }
      } catch (e) {
        // Silent on poll error
      }
    };

    fetchLiveAlerts();
    const interval = setInterval(fetchLiveAlerts, 30000); // 30s live poll
    return () => clearInterval(interval);
  }, []);

  // Close notifications dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const handleNotificationClick = (item) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, unread: false } : n))
    );
    setIsNotificationsOpen(false);
    navigate(item.link);
  };

  const navMenuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard, end: true },
    { name: 'Products', path: '/admin/products', icon: ShoppingBag, hasChevron: true },
    { name: 'Orders', path: '/admin/orders', icon: Package, hasChevron: true },
    { name: 'Customers', path: '/admin/customers', icon: Users },
    { name: 'Inventory', path: '/admin/products', icon: Archive },
    { name: 'Coupons', path: '/admin/dashboard', icon: Tag },
    { name: 'Reviews', path: '/admin/reviews', icon: Star },
    { name: 'Analytics', path: '/admin/dashboard', icon: BarChart3 },
    { name: 'Settings', path: '/admin/dashboard', icon: Settings, hasChevron: true },
    { name: 'Profile', path: '/account/profile', icon: User },
  ];

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const role = (user?.role || '').toLowerCase();
  // Defense-in-depth: Never render any part of AdminLayout if unauthorized
  if (!user || (role !== 'admin' && role !== 'super_admin')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F8F5F0] flex flex-col md:flex-row font-sans text-[#29251F]">
      {/* =========================================================================
          LEFT LUXURY DARK SIDEBAR (Exact Match to Screenshot)
          ========================================================================= */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-[#14110C] text-[#E8DCC9] flex flex-col justify-between z-50 border-r border-[#2A231A] transition-transform duration-300 ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } overflow-y-auto no-scrollbar shadow-2xl flex-shrink-0`}
      >
        {/* Brand Header */}
        <div>
          <div className="p-6 border-b border-[#2A231A] flex items-center justify-between">
            <Link to="/admin" className="flex items-center space-x-3 group">
              <div className="w-11 h-11 rounded-full border border-[#C5A059] p-0.5 bg-black flex items-center justify-center flex-shrink-0 shadow-md">
                <img
                  src={logoImg}
                  alt="Ni'maah Luxe"
                  className="w-full h-full object-cover rounded-full group-hover:scale-105 transition"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-cinzel text-lg tracking-[0.14em] text-[#F3EAD8] font-bold leading-tight">
                  N'MAAH LUXE
                </span>
                <span className="font-serif italic text-[10px] tracking-wider text-[#C5A059] mt-0.5">
                  Divinely Inspired Fashion
                </span>
              </div>
            </Link>

            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="md:hidden text-gray-400 hover:text-white p-1"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5 text-xs">
            {navMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.end
                ? (location.pathname === item.path || (item.path === '/admin/dashboard' && location.pathname === '/admin'))
                : location.pathname.startsWith(item.path) && item.path !== '/admin' && item.path !== '/admin/dashboard';

              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  end={item.end}
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className={({ isActive: navActive }) => {
                    const active = item.end ? navActive : isActive;
                    return `flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium tracking-wide transition-all ${
                      active
                        ? 'bg-gradient-to-r from-[#C5A059] via-[#B89248] to-[#8C6D37] text-white shadow-md font-semibold'
                        : 'text-[#B8AA99] hover:bg-[#221C14] hover:text-[#E8DCC9]'
                    }`;
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <Icon size={17} strokeWidth={1.8} />
                    <span>{item.name}</span>
                  </div>
                  {item.hasChevron && (
                    <ChevronDown size={14} className="opacity-60" />
                  )}
                </NavLink>
              );
            })}

            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-[#B8AA99] hover:bg-red-950/40 hover:text-red-400 transition text-xs font-medium"
            >
              <LogOut size={17} strokeWidth={1.8} />
              <span>Logout</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Bottom Banner & Footer */}
        <div className="p-4 pt-0">
          <div className="relative rounded-2xl overflow-hidden border border-[#3A3022] p-4 text-center bg-gradient-to-b from-[#221C14] to-[#120E0A] shadow-lg">
            <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-2 border border-[#C5A059]/50 shadow-md">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
                alt="Model"
                className="w-full h-full object-cover"
              />
            </div>
            <h4 className="font-serif-luxury text-sm font-semibold text-[#F3EAD8]">
              Style Redefined
            </h4>
            <Link
              to="/"
              className="mt-2.5 inline-flex items-center justify-center space-x-1 px-4 py-1.5 bg-[#FAF7F2] hover:bg-[#C5A059] text-[#14110C] hover:text-white rounded-full text-[10.5px] font-semibold uppercase tracking-wider transition shadow-sm w-full"
            >
              <span>Visit Store</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          <p className="text-[10px] text-gray-500 text-center mt-3 font-mono">
            © 2026 N'MAAH LUXE
          </p>
        </div>
      </aside>

      {/* Overlay for mobile drawer */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-xs"
        />
      )}

      {/* =========================================================================
          RIGHT CONTENT WRAPPER
          ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar (Exact match to screenshot) */}
        <header className="sticky top-0 z-30 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E8DEC8] px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
          {/* Mobile Hamburger + Global Search */}
          <div className="flex items-center space-x-3 flex-1 max-w-xl">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden p-2 text-[#29251F] hover:bg-[#EDE5D8] rounded-lg"
              aria-label="Open sidebar"
            >
              <Menu size={20} />
            </button>

            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, orders, customers... (Ctrl + K)"
                className="w-full pl-10 pr-4 py-2 bg-white border border-[#E5DAC6] rounded-xl text-xs text-[#29251F] placeholder-gray-400 focus:outline-none focus:border-[#C5A059] shadow-2xs"
              />
            </div>
          </div>

          {/* Right Action Icons: Notification, Profile, Theme Toggle */}
          <div className="flex items-center space-x-3 sm:space-x-4 flex-shrink-0">
            {/* Live Interactive Notification Bell */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className={`relative p-2 rounded-full transition ${
                  isNotificationsOpen
                    ? 'bg-[#EDE5D8] text-[#C5A059]'
                    : 'text-[#29251F] hover:bg-[#EDE5D8]'
                }`}
                title="Store Notifications"
                aria-label="Notifications"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popup Dropdown */}
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-[#E8DEC8] rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in duration-200">
                  {/* Header */}
                  <div className="p-4 bg-[#FAF7F2] border-b border-[#E8DEC8] flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-[#14110C]">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#C5A059] text-white">
                          {unreadCount} New
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-[11px] text-[#C5A059] hover:text-[#8C6D37] font-semibold flex items-center space-x-1"
                      >
                        <CheckCheck size={13} />
                        <span>Mark all read</span>
                      </button>
                    )}
                  </div>

                  {/* Notification List */}
                  <div className="max-h-80 overflow-y-auto divide-y divide-[#F6EFE5]">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-xs text-gray-500">
                        No notifications to display
                      </div>
                    ) : (
                      notifications.map((item) => {
                        const Icon = item.icon || Bell;
                        return (
                          <div
                            key={item.id}
                            onClick={() => handleNotificationClick(item)}
                            className={`p-3.5 flex items-start space-x-3 cursor-pointer transition hover:bg-[#FAF7F2] ${
                              item.unread ? 'bg-[#FFFDF9]' : 'opacity-75'
                            }`}
                          >
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border ${
                                item.color || 'bg-gray-100 text-gray-600 border-gray-200'
                              }`}
                            >
                              <Icon size={16} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <h5 className="text-xs font-bold text-[#14110C] truncate">
                                  {item.title}
                                </h5>
                                <span className="text-[10px] text-gray-400 whitespace-nowrap">
                                  {item.time}
                                </span>
                              </div>
                              <p className="text-[11px] text-gray-600 line-clamp-2 mt-0.5 leading-snug">
                                {item.desc}
                              </p>
                            </div>
                            {item.unread && (
                              <span className="w-2 h-2 rounded-full bg-[#C5A059] flex-shrink-0 mt-1.5" />
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Footer */}
                  <div className="p-3 bg-[#FAF7F2] border-t border-[#E8DEC8] text-center">
                    <Link
                      to="/admin/orders"
                      onClick={() => setIsNotificationsOpen(false)}
                      className="text-[11px] font-semibold text-[#14110C] hover:text-[#C5A059] transition inline-flex items-center space-x-1"
                    >
                      <span>View All in Orders Pipeline</span>
                      <ArrowRight size={11} />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Sun / Theme icon */}
            <button
              className="p-2 text-gray-500 hover:text-[#29251F] hover:bg-[#EDE5D8] rounded-full transition"
              title="Light theme active"
            >
              <Sun size={18} />
            </button>

            {/* Admin Profile Dropdown */}
            <div className="flex items-center space-x-2.5 pl-2 border-l border-[#E5DAC6]">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-[#C5A059] shadow-xs flex-shrink-0">
                <img
                  src={
                    user?.avatar ||
                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'
                  }
                  alt="Admin Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-[#14110C] leading-tight">
                  {user?.name || 'Admin'}
                </span>
                <span className="text-[10px] text-gray-500 leading-tight">
                  Super Admin
                </span>
              </div>
              <ChevronDown size={14} className="text-gray-400 hidden sm:block" />
            </div>
          </div>
        </header>

        {/* Dynamic Nested Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
