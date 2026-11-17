import React from 'react';
import { NavLink, Outlet, Navigate } from 'react-router-dom';
import { Package, User, Heart, LogOut, Crown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import MainLayout from './MainLayout';
import logoImg from '../assets/nimaah-luxe-logo.png';

export const CustomerLayout = () => {
  const { user, loading, logout } = useAuth();

  if (!loading && !user) {
    return <Navigate to="/login" replace />;
  }

  const links = [
    { name: 'Orders & Tracking', path: '/account/orders', icon: Package },
    { name: 'Profile & Address', path: '/account/profile', icon: User },
    { name: 'Wishlist', path: '/wishlist', icon: Heart },
  ];

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14">
        {/* Customer Header */}
        <div className="bg-white border border-[#E9E1D6] p-5 sm:p-8 mb-6 sm:mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-[#C5A059] p-0.5 shadow-sm bg-white flex-shrink-0">
              <img
                src={user?.avatar || logoImg}
                alt={user?.name}
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-1.5 text-[10px] uppercase tracking-[0.25em] text-[#C5A059] font-cinzel font-semibold">
                <Crown size={12} />
                <span>Client Sanctuary</span>
              </div>
              <h1 className="font-serif-luxury text-2xl sm:text-3xl text-[#29251F] mt-0.5 truncate">
                {user?.name}
              </h1>
              <p className="text-xs text-gray-500 font-light truncate">{user?.email}</p>
            </div>
          </div>

          <div className="w-full sm:w-auto px-4 py-2.5 bg-[#FAF9F6] border border-[#E9E1D6] text-xs">
            <span className="text-gray-400 block text-[9px] uppercase tracking-widest">Membership Tier</span>
            <strong className="text-[#C5A059] tracking-widest uppercase font-cinzel font-semibold text-[11px]">
              Ni'maah Haute Privé
            </strong>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 sm:gap-10">
          {/* Navigation — Horizontal Scroll Tabs on Mobile, Sidebar on Desktop */}
          <div className="md:col-span-1">
            <div className="bg-white border border-[#E9E1D6] p-2.5 sm:p-3.5 flex md:flex-col gap-2 md:gap-1.5 overflow-x-auto no-scrollbar shadow-xs">
              {links.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    className={({ isActive }) =>
                      `flex items-center space-x-2.5 px-4 py-3 text-xs uppercase tracking-wider whitespace-nowrap flex-shrink-0 transition ${
                        isActive
                          ? 'bg-[#29251F] text-[#FAF9F6] font-semibold shadow-xs'
                          : 'text-[#29251F]/80 hover:bg-[#FAF9F6] hover:text-[#C5A059]'
                      }`
                    }
                  >
                    <Icon size={15} />
                    <span>{link.name}</span>
                  </NavLink>
                );
              })}

              <button
                onClick={logout}
                className="flex items-center space-x-2.5 px-4 py-3 text-xs uppercase tracking-wider text-red-600 hover:bg-red-50 transition md:border-t md:border-[#FAF9F6] md:mt-4 font-medium whitespace-nowrap flex-shrink-0"
              >
                <LogOut size={15} />
                <span>Log Out</span>
              </button>
            </div>
          </div>

          {/* Right Main Content */}
          <div className="md:col-span-3 min-w-0">
            <Outlet />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default CustomerLayout;
