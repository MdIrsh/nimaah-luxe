import React from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  ArrowLeft,
  ShieldCheck,
  LogOut,
  Crown,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logoImg from '../assets/nimaah-luxe-logo.png';

export const AdminLayout = () => {
  const { user, logout, switchRole } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard Overview', path: '/admin', icon: LayoutDashboard },
    { name: 'Couture Dress Catalog', path: '/admin/products', icon: ShoppingBag },
    { name: 'Order Fulfillment Pipeline', path: '/admin/orders', icon: Package },
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col">
      {/* Top Admin Bar with Symmetrical Padding */}
      <header className="bg-[#24201A] text-[#FAF9F6] border-b border-[#3A352D] px-6 sm:px-10 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-6">
          <Link to="/" className="flex items-center space-x-2 text-xs uppercase tracking-widest text-gray-400 hover:text-white transition">
            <ArrowLeft size={16} />
            <span>Customer Website</span>
          </Link>
          <div className="h-4 w-[1px] bg-white/20"></div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-[#C5A059]/60 bg-black flex-shrink-0">
              <img src={logoImg} alt="Ni'maah Luxe" className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="font-cinzel text-lg tracking-[0.18em] text-[#FAF9F6] font-bold">
                NI'MAAH LUXE
              </span>
              <span className="text-[8.5px] uppercase tracking-[0.3em] text-[#C5A059] ml-2 font-mono">
                Atelier Command
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-5">
          <button
            onClick={() => {
              switchRole('customer');
              navigate('/');
            }}
            className="text-xs bg-[#C5A059]/20 hover:bg-[#C5A059]/35 text-[#E8D3A2] px-3.5 py-1.5 rounded-xs border border-[#C5A059]/40 transition font-medium tracking-wider uppercase"
          >
            Switch to Client View
          </button>

          <div className="flex items-center space-x-3.5 border-l border-white/20 pl-5">
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
        </div>
      </header>

      {/* Main Admin Body */}
      <div className="flex flex-1">
        {/* Admin Sidebar */}
        <aside className="w-68 bg-white border-r border-[#E9E1D6] p-7 hidden md:block">
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
                    <span>{item.name}</span>
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
        <main className="flex-1 p-8 sm:p-12 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
