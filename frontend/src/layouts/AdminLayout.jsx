import React from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  ArrowLeft,
  LogOut,
  Crown,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logoImg from '../assets/nimaah-luxe-logo.png';

export const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Overview', fullName: 'Dashboard Overview', path: '/admin', icon: LayoutDashboard },
    { name: 'Catalog', fullName: 'Couture Dress Catalog', path: '/admin/products', icon: ShoppingBag },
    { name: 'Orders', fullName: 'Order Fulfillment Pipeline', path: '/admin/orders', icon: Package },
    { name: 'Customers', fullName: 'Customer Portfolio', path: '/admin/customers', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col">
      {/* Top Admin Bar */}
      <header className="bg-[#24201A] text-[#FAF9F6] border-b border-[#3A352D] px-4 sm:px-6 lg:px-10 py-3.5 sm:py-4 flex items-center justify-between gap-3 sticky top-0 z-50">
        <div className="flex items-center space-x-3 sm:space-x-6 min-w-0">
          <Link
            to="/"
            className="flex items-center space-x-1.5 text-[11px] sm:text-xs uppercase tracking-wider text-gray-300 hover:text-white transition flex-shrink-0"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Customer Website</span>
            <span className="sm:hidden">Store</span>
          </Link>
          <div className="h-4 w-[1px] bg-white/20"></div>
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden border border-[#C5A059]/60 bg-black flex-shrink-0">
              <img src={logoImg} alt="Ni'maah Luxe" className="w-full h-full object-cover" />
            </div>
            <div className="truncate">
              <span className="font-cinzel text-sm sm:text-lg tracking-[0.14em] sm:tracking-[0.18em] text-[#FAF9F6] font-bold">
                NI'MAAH LUXE
              </span>
              <span className="hidden md:inline text-[8.5px] uppercase tracking-[0.3em] text-[#C5A059] ml-2 font-mono">
                Atelier Command
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3 flex-shrink-0">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-white">{user?.name || 'Administrator'}</p>
            <p className="text-[10px] text-[#C5A059] uppercase tracking-wider font-cinzel">Super Admin</p>
          </div>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="p-2 text-gray-400 hover:text-red-400 transition"
            title="Sign Out"
            aria-label="Sign Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Mobile Admin Navigation Bar (md:hidden) */}
      <nav className="md:hidden bg-white border-b border-[#E9E1D6] px-3 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar sticky top-[57px] z-40">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
              className={({ isActive }) =>
                `flex items-center space-x-2 px-4 py-2 text-xs uppercase tracking-wider whitespace-nowrap flex-shrink-0 transition ${
                  isActive
                    ? 'bg-[#29251F] text-[#FAF9F6] font-semibold'
                    : 'bg-[#FAF9F6] text-[#29251F]/80 border border-[#E9E1D6]'
                }`
              }
            >
              <Icon size={14} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Main Admin Body */}
      <div className="flex flex-1">
        {/* Desktop Admin Sidebar */}
        <aside className="w-64 lg:w-68 bg-white border-r border-[#E9E1D6] p-6 lg:p-7 hidden md:block flex-shrink-0">
          <div className="mb-8">
            <p className="text-[10px] uppercase font-bold tracking-[0.25em] text-gray-400 mb-4 font-cinzel">
              Store Management
            </p>
            <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/admin'}
                    className={({ isActive }) =>
                      `flex items-center space-x-3.5 px-4 py-3.5 text-xs uppercase tracking-wider rounded-xs transition ${
                        isActive
                          ? 'bg-[#29251F] text-[#FAF9F6] font-semibold shadow-xs'
                          : 'text-[#29251F]/80 hover:bg-[#FAF9F6] hover:text-[#C5A059]'
                      }`
                    }
                  >
                    <Icon size={16} />
                    <span>{item.fullName}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          <div className="mt-12 p-5 bg-[#FAF9F6] border border-[#E9E1D6] rounded-xs space-y-2">
            <div className="flex items-center space-x-2 text-[#C5A059] text-xs font-semibold uppercase tracking-wider">
              <Crown size={15} />
              <span>Flowchart Sync</span>
            </div>
            <p className="text-[11px] text-gray-600 leading-relaxed font-light">
              Real-time synchronization with order pipeline: Admin Receives Order &rarr; Process & Tailor &rarr; Shipped &rarr; Delivered.
            </p>
          </div>
        </aside>

        {/* Dynamic Admin Content */}
        <main className="flex-1 p-4 sm:p-8 lg:p-12 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
