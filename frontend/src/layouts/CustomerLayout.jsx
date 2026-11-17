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
    { name: 'My Orders & Live Tracking', path: '/account/orders', icon: Package },
    { name: 'Patron Profile & Address', path: '/account/profile', icon: User },
    { name: 'Private Wishlist Vault', path: '/wishlist', icon: Heart },
  ];

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Customer Header with Generous Padding */}
        <div className="bg-white border border-[#E9E1D6] p-7 sm:p-9 mb-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="flex items-center space-x-5">
            <div className="w-18 h-18 rounded-full overflow-hidden border-2 border-[#C5A059] p-0.5 shadow-sm bg-white">
              <img
                src={user?.avatar || logoImg}
                alt={user?.name}
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div>
              <div className="flex items-center space-x-2 text-[10.5px] uppercase tracking-[0.3em] text-[#C5A059] font-cinzel font-semibold">
                <Crown size={13} />
                <span>Client Sanctuary</span>
              </div>
              <h1 className="font-serif-luxury text-3xl sm:text-4xl text-[#29251F] mt-1">{user?.name || 'Valued Client'}</h1>
              <p className="text-xs text-gray-500 font-light">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="px-5 py-3 bg-[#FAF9F6] border border-[#E9E1D6] text-xs">
              <span className="text-gray-400 block text-[9.5px] uppercase tracking-widest">Membership Tier</span>
              <strong className="text-[#C5A059] tracking-widest uppercase font-cinzel font-semibold">Ni'maah Haute Privé</strong>
            </div>
          </div>
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Navigation Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white border border-[#E9E1D6] p-3.5 space-y-1.5 shadow-xs">
              {links.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    className={({ isActive }) =>
                      `flex items-center space-x-3.5 px-4 py-3.5 text-xs uppercase tracking-wider transition ${
                        isActive
                          ? 'bg-[#29251F] text-[#FAF9F6] font-semibold shadow-xs'
                          : 'text-[#29251F]/80 hover:bg-[#FAF9F6] hover:text-[#C5A059]'
                      }`
                    }
                  >
                    <Icon size={16} />
                    <span>{link.name}</span>
                  </NavLink>
                );
              })}

              <button
                onClick={logout}
                className="w-full flex items-center space-x-3.5 px-4 py-3.5 text-xs uppercase tracking-wider text-red-600 hover:bg-red-50 transition border-t border-[#FAF9F6] mt-4 font-medium"
              >
                <LogOut size={16} />
                <span>Log Out</span>
              </button>
            </div>
          </div>

          {/* Right Main Content */}
          <div className="md:col-span-3">
            <Outlet />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default CustomerLayout;
