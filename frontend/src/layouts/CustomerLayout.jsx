import React from 'react';
import { NavLink, Link, Outlet, Navigate } from 'react-router-dom';
import { Package, User, Heart, LogOut, Crown, ShieldCheck, Sparkles, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import MainLayout from './MainLayout';
import logoImg from '../assets/nimaah-luxe-logo.png';

export const CustomerLayout = () => {
  const { user, loading, logout, isAdmin } = useAuth();

  if (!loading && !user) {
    return <Navigate to="/login" replace />;
  }

  const links = [
    ...(isAdmin
      ? [
          {
            name: 'Admin Dashboard',
            path: '/admin/dashboard',
            icon: ShieldCheck,
            isAdminLink: true,
          },
        ]
      : []),
    { name: 'Orders & Tracking', path: '/account/orders', icon: Package },
    { name: 'Profile & Address', path: '/account/profile', icon: User },
    { name: 'Wishlist', path: '/wishlist', icon: Heart },
  ];

  // User monogram initials
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'NL';

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#FAF9F6] pb-28 lg:pb-16 pt-4 sm:pt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Admin Quick Entry Card (Strictly visible ONLY to verified Admin) */}
          {isAdmin && (
            <div className="mb-6 p-4 sm:p-5 bg-gradient-to-r from-[#1E1912] via-[#2A231A] to-[#14110C] border-2 border-[#C5A059] rounded-2xl text-[#FAF9F6] shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3.5">
                <div className="p-2.5 bg-[#C5A059]/20 rounded-xl border border-[#C5A059]/50 text-[#E8D3A2] shrink-0">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-cinzel text-sm sm:text-base font-bold text-[#E8D3A2]">
                      Store Administrator Portal
                    </h3>
                    <span className="px-2 py-0.5 bg-[#C5A059] text-[#14110C] text-[9px] font-black uppercase rounded">
                      Staff Verified
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 mt-0.5">
                    Manage atelier products, orders, live tracking & patrons
                  </p>
                </div>
              </div>
              <Link
                to="/admin/dashboard"
                className="w-full sm:w-auto px-5 py-2.5 bg-[#C5A059] hover:bg-[#E8D3A2] text-[#14110C] text-xs font-bold uppercase tracking-wider rounded-xl transition text-center shadow-sm flex items-center justify-center space-x-2 shrink-0"
              >
                <span>Open Admin Portal</span>
                <ChevronRight size={14} />
              </Link>
            </div>
          )}

          {/* Customer Profile Sanctuary Header Card */}
          <div className="bg-white border border-[#E9E1D6] rounded-2xl p-5 sm:p-7 mb-6 sm:mb-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="flex items-center space-x-4 min-w-0">
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-[#C5A059] p-0.5 shadow-sm bg-white shrink-0">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-full h-full object-cover rounded-full"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = logoImg;
                    }}
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-[#1E1912] to-[#14110C] flex items-center justify-center text-[#C5A059] font-serif-luxury font-bold text-lg sm:text-xl">
                    {initials}
                  </div>
                )}
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center space-x-1.5 text-[10px] uppercase tracking-[0.25em] text-[#C5A059] font-cinzel font-bold">
                  <Crown size={12} className="shrink-0" />
                  <span>Patron Sanctuary</span>
                </div>
                <h1 className="font-serif-luxury text-xl sm:text-2xl lg:text-3xl font-bold text-[#14110C] mt-0.5 truncate leading-tight">
                  {user?.name || 'Valued Patron'}
                </h1>
                <p className="text-xs text-gray-500 font-light truncate mt-0.5">{user?.email}</p>
              </div>
            </div>

            {/* Membership Tier & Loyalty Crest */}
            <div className="w-full md:w-auto flex items-center justify-between md:justify-end gap-3 px-4 py-3 bg-[#FAF9F6] border border-[#E9E1D6] rounded-xl text-xs">
              <div>
                <span className="text-gray-400 block text-[9px] uppercase tracking-widest font-semibold">
                  Membership Tier
                </span>
                <strong className="text-[#C5A059] tracking-widest uppercase font-cinzel font-bold text-xs sm:text-[13px] block mt-0.5">
                  Ni'maah Haute Privé
                </strong>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#14110C] text-[#C5A059] flex items-center justify-center shrink-0 border border-[#C5A059]/40 shadow-2xs">
                <Sparkles size={14} />
              </div>
            </div>
          </div>

          {/* Content Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
            {/* Navigation Tabs (Horizontal scroll on phone, elegant sidebar on desktop) */}
            <div className="lg:col-span-3">
              <div className="bg-white border border-[#E9E1D6] rounded-2xl p-2 sm:p-3 shadow-xs">
                <div className="flex lg:flex-col gap-1.5 overflow-x-auto no-scrollbar">
                  {links.map((link) => {
                    const Icon = link.icon;
                    return (
                      <NavLink
                        key={link.path}
                        to={link.path}
                        className={({ isActive }) =>
                          `flex items-center space-x-2.5 px-3.5 py-3 rounded-xl text-xs uppercase tracking-wider whitespace-nowrap shrink-0 transition-all ${
                            link.isAdminLink
                              ? 'bg-[#14110C] text-[#C5A059] border border-[#C5A059]/50 font-bold hover:bg-[#201B14]'
                              : isActive
                              ? 'bg-[#14110C] text-[#FAF9F6] font-bold shadow-xs'
                              : 'text-[#29251F]/75 hover:bg-[#FAF9F6] hover:text-[#C5A059]'
                          }`
                        }
                      >
                        <Icon size={16} className={link.isAdminLink ? 'text-[#C5A059]' : 'shrink-0'} />
                        <span className="font-medium">{link.name}</span>
                      </NavLink>
                    );
                  })}

                  <button
                    type="button"
                    onClick={logout}
                    className="flex items-center space-x-2.5 px-3.5 py-3 rounded-xl text-xs uppercase tracking-wider text-red-600 hover:bg-red-50 transition lg:border-t lg:border-[#FAF9F6] lg:mt-2 font-semibold whitespace-nowrap shrink-0"
                  >
                    <LogOut size={16} className="shrink-0" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-9 min-w-0">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default CustomerLayout;
