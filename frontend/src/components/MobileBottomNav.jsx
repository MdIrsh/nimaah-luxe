import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, LayoutGrid, Heart, User, ShoppingBag, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export const MobileBottomNav = () => {
  const { itemsCount, wishlist } = useCart();
  const { user, isAdmin } = useAuth();

  const safeWishlistCount = Array.isArray(wishlist) ? wishlist.length : 0;
  const safeCartCount = Number(itemsCount || 0);

  const tabs = [
    { name: 'Home', path: '/', icon: Home, end: true },
    { name: 'Categories', path: '/shop', icon: LayoutGrid },
    { name: 'Wishlist', path: '/wishlist', icon: Heart, badge: safeWishlistCount },
    {
      name: isAdmin ? 'Admin' : 'Account',
      path: isAdmin ? '/admin/dashboard' : (user ? '/account/profile' : '/login'),
      icon: isAdmin ? ShieldCheck : User,
    },
    { name: 'Cart', path: '/cart', icon: ShoppingBag, badge: safeCartCount },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-white/98 backdrop-blur-md border-t border-[#E9E1D6] shadow-[0_-4px_20px_rgba(41,37,31,0.06)]">
      <div className="grid grid-cols-5 h-16 px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.name}
              to={tab.path}
              end={tab.end}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 relative transition-colors ${
                  isActive ? 'text-[#A68B66] font-semibold' : 'text-[#29251F]/65'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative">
                    <Icon size={20} strokeWidth={isActive ? 2.1 : 1.6} />
                    {tab.badge > 0 && (
                      <span className="absolute -top-1.5 -right-2 bg-[#29251F] text-[#FAF9F6] text-[9px] min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center font-bold">
                        {tab.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] tracking-wide leading-none">{tab.name}</span>
                  {isActive && (
                    <span className="absolute top-0 inset-x-3 h-[2px] bg-[#C5A059] rounded-full" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
