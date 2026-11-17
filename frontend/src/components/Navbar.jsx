import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingBag,
  Heart,
  User,
  Search,
  Menu,
  X,
  ShieldCheck,
  ChevronDown,
  LogOut,
  Package,
  Sparkles,
} from 'lucide-react';
import InstagramIcon from './InstagramIcon';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import logoImg from '../assets/nimaah-luxe-logo.png';

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const { user, logout } = useAuth();
  const { itemsCount, wishlist } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setIsMenuOpen(false);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Collection', path: '/shop' },
    { name: 'Dresses', path: '/shop?category=Dresses' },
    { name: 'Ethnic', path: '/shop?category=Ethnic%20Wear' },
    { name: 'Sarees', path: '/shop?category=Sarees' },
    { name: 'Kurtis', path: '/shop?category=Kurtis' },
    { name: 'Western', path: '/shop?category=Western%20Wear' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#FFFFFF]/98 backdrop-blur-md border-b border-[#E9E1D6]/80 transition-all shadow-xs">
      {/* 1. Top Announcement Bar — Responsive for Mobile & Desktop */}
      <div className="bg-[#29251F] text-[#FAF9F6] py-2 px-3 sm:px-6 lg:px-8 uppercase font-medium flex items-center justify-between border-b border-[#3A352D]">
        <div className="hidden lg:flex items-center space-x-2 text-[#C5A059] text-[10.5px] tracking-[0.2em]">
          <Sparkles size={12} />
          <span>Haute Couture & Prêt Atelier</span>
        </div>

        <div className="mx-auto flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 text-center text-[9.5px] sm:text-[11px] tracking-[0.12em] sm:tracking-[0.2em]">
          <span>Free Shipping Over ₹15,000</span>
          <span className="text-[#C5A059]">•</span>
          <span className="text-[#E9E1D6]">
            Code: <strong className="text-[#C5A059]">NIMAAH20</strong>
          </span>
        </div>

        <div className="hidden lg:flex items-center text-[10px] text-[#E9E1D6] tracking-[0.18em]">
          <span>Chennai, India • +91 8618621612</span>
        </div>
      </div>

      {/* 2. Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 lg:h-24 gap-2">
          {/* Left: Mobile Menu Button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => {
                setIsMenuOpen(!isMenuOpen);
                setIsSearchOpen(false);
              }}
              className="p-2 -ml-1.5 text-[#29251F] hover:text-[#C5A059] focus:outline-none transition"
              aria-label="Toggle navigation menu"
            >
              {isMenuOpen ? <X size={24} strokeWidth={1.6} /> : <Menu size={24} strokeWidth={1.6} />}
            </button>
          </div>

          {/* Brand Emblem & Logo */}
          <div className="flex items-center min-w-0">
            <Link
              to="/"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center space-x-2.5 sm:space-x-3.5 group py-1"
            >
              <div className="relative w-10 h-10 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full overflow-hidden border border-[#C5A059]/60 shadow-sm flex-shrink-0 bg-[#29251F] p-0.5">
                <img
                  src={logoImg}
                  alt="Ni'maah Luxe Emblem"
                  className="w-full h-full object-cover rounded-full group-hover:scale-105 transition duration-500"
                />
              </div>
              <div className="flex flex-col text-left min-w-0">
                <span className="font-cinzel text-base sm:text-xl lg:text-2xl font-semibold tracking-[0.12em] sm:tracking-[0.18em] text-[#29251F] group-hover:text-[#A68B66] transition-colors leading-tight truncate">
                  NI'MAAH LUXE
                </span>
                <span className="font-sans text-[7.5px] sm:text-[9px] tracking-[0.22em] sm:tracking-[0.35em] text-[#A68B66] uppercase font-medium mt-0.5 truncate">
                  Divinely Inspired Fashion
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-6 xl:space-x-7">
            {navLinks.map((link) => {
              const isActive = location.pathname + location.search === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-[11.5px] uppercase tracking-[0.18em] font-medium transition-colors py-2 relative group whitespace-nowrap ${
                    isActive
                      ? 'text-[#A68B66] font-semibold'
                      : 'text-[#29251F]/80 hover:text-[#29251F]'
                  }`}
                >
                  {link.name}
                  <span
                    className={`absolute bottom-0 left-0 h-[2px] bg-[#A68B66] transition-all duration-300 ${
                      isActive ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons — Clean & Uncrowded on Phones */}
          <div className="flex items-center space-x-1 sm:space-x-3.5 lg:space-x-4 flex-shrink-0">
            {/* Instagram (sm and up; also inside Mobile Drawer) */}
            <a
              href="https://www.instagram.com/nimaahluxe"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex p-2 text-[#29251F] hover:text-[#C5A059] transition-colors items-center group"
              title="Follow @nimaahluxe on Instagram"
              aria-label="Instagram @nimaahluxe"
            >
              <InstagramIcon size={19} />
              <span className="hidden xl:inline ml-1.5 text-[11px] font-cinzel font-semibold tracking-wider text-[#A68B66] group-hover:text-[#29251F]">
                @nimaahluxe
              </span>
            </a>

            {/* Search Button */}
            <button
              onClick={() => {
                setIsSearchOpen(!isSearchOpen);
                setIsMenuOpen(false);
              }}
              className="p-2 text-[#29251F] hover:text-[#A68B66] transition-colors"
              title="Search creations"
              aria-label="Search"
            >
              <Search size={19} strokeWidth={1.6} />
            </button>

            {/* Wishlist Icon (visible on sm+, also in mobile drawer) */}
            <Link
              to="/wishlist"
              className="hidden sm:flex p-2 text-[#29251F] hover:text-[#A68B66] transition-colors relative"
              title="Private Wishlist"
              aria-label="Wishlist"
            >
              <Heart size={19} strokeWidth={1.6} />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-0.5 bg-[#A68B66] text-white text-[9.5px] w-4 h-4 rounded-full flex items-center justify-center font-bold shadow-xs">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Shopping Bag Icon */}
            <Link
              to="/cart"
              onClick={() => setIsMenuOpen(false)}
              className="p-2 text-[#29251F] hover:text-[#A68B66] transition-colors relative"
              title="Shopping Bag"
              aria-label="Shopping Bag"
            >
              <ShoppingBag size={19} strokeWidth={1.6} />
              {itemsCount > 0 && (
                <span className="absolute top-1 right-0.5 bg-[#29251F] text-[#FAF9F6] text-[9.5px] w-4 h-4 rounded-full flex items-center justify-center font-bold shadow-xs">
                  {itemsCount}
                </span>
              )}
            </Link>

            {/* Profile / Sign In */}
            <div className="relative pl-0.5 sm:pl-1">
              {user ? (
                <>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-1 p-1 text-[#29251F] hover:text-[#A68B66] transition-colors focus:outline-none"
                    aria-expanded={isUserMenuOpen}
                  >
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-[#C5A059]/60 overflow-hidden bg-[#FAF9F6] flex items-center justify-center shadow-xs">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <User size={15} />
                      )}
                    </div>
                    <ChevronDown size={13} className="text-[#A68B66] hidden sm:block" />
                  </button>

                  {isUserMenuOpen && (
                    <div
                      className="absolute right-0 mt-3 w-64 bg-white border border-[#E9E1D6] shadow-xl py-2 z-50 rounded-xs"
                      onMouseLeave={() => setIsUserMenuOpen(false)}
                    >
                      <div className="px-5 py-3 border-b border-[#FAF9F6] space-y-1">
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-medium">Signed In As</p>
                        <p className="text-sm font-semibold text-[#29251F] truncate">{user.name}</p>
                        <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
                        <span className="inline-block mt-1 text-[9.5px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-xs bg-[#FAF9F6] text-[#A68B66] border border-[#E9E1D6]">
                          {user.role === 'admin' ? 'Store Administrator' : "Ni'maah Privé Client"}
                        </span>
                      </div>

                      {user.role === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center px-5 py-3 text-xs text-[#29251F] hover:bg-[#FAF9F6] hover:text-[#A68B66] transition font-medium"
                        >
                          <ShieldCheck size={16} className="mr-3 text-[#A68B66]" />
                          Admin Command Portal
                        </Link>
                      )}

                      <Link
                        to="/account/orders"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center px-5 py-3 text-xs text-[#29251F] hover:bg-[#FAF9F6] hover:text-[#A68B66] transition font-medium"
                      >
                        <Package size={16} className="mr-3 text-[#A68B66]" />
                        Orders & Live Tracker
                      </Link>

                      <Link
                        to="/account/profile"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center px-5 py-3 text-xs text-[#29251F] hover:bg-[#FAF9F6] hover:text-[#A68B66] transition font-medium"
                      >
                        <User size={16} className="mr-3 text-[#A68B66]" />
                        Profile & Addresses
                      </Link>

                      <div className="border-t border-[#E9E1D6] my-1"></div>

                      <button
                        onClick={() => {
                          logout();
                          setIsUserMenuOpen(false);
                          navigate('/login');
                        }}
                        className="w-full flex items-center px-5 py-3 text-xs text-red-600 hover:bg-red-50 transition font-medium text-left"
                      >
                        <LogOut size={16} className="mr-3" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 bg-[#29251F] hover:bg-[#C5A059] text-white text-[10px] sm:text-[11px] uppercase tracking-[0.14em] sm:tracking-[0.2em] font-semibold transition shadow-xs whitespace-nowrap"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Search Bar Overlay */}
        {isSearchOpen && (
          <div className="py-3 sm:py-4 border-t border-[#E9E1D6]">
            <form onSubmit={handleSearchSubmit} className="relative max-w-2xl mx-auto flex items-center">
              <Search size={16} className="absolute left-3.5 text-[#A68B66]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search dresses, sarees, kurtis, blazers..."
                className="w-full pl-10 pr-24 py-3 bg-[#FAF9F6] border border-[#E9E1D6] focus:outline-none focus:border-[#A68B66] text-sm text-[#29251F] placeholder-gray-400"
                autoFocus
              />
              <button
                type="submit"
                className="absolute right-1.5 px-4 py-2 bg-[#29251F] text-white text-[11px] uppercase tracking-widest font-semibold hover:bg-[#A68B66] transition"
              >
                Search
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Smooth Touch-Friendly Mobile Drawer Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-[#E9E1D6] px-5 pt-3 pb-7 space-y-1 shadow-xl max-h-[82vh] overflow-y-auto">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setIsMenuOpen(false)}
              className="block py-3 text-xs uppercase tracking-[0.2em] text-[#29251F] hover:text-[#A68B66] border-b border-[#FAF9F6] font-medium"
            >
              {link.name}
            </Link>
          ))}

          <Link
            to="/shop?category=Accessories"
            onClick={() => setIsMenuOpen(false)}
            className="block py-3 text-xs uppercase tracking-[0.2em] text-[#29251F] hover:text-[#A68B66] border-b border-[#FAF9F6] font-medium"
          >
            Accessories
          </Link>

          <Link
            to="/wishlist"
            onClick={() => setIsMenuOpen(false)}
            className="flex items-center justify-between py-3 text-xs uppercase tracking-[0.2em] text-[#29251F] hover:text-[#A68B66] border-b border-[#FAF9F6] font-medium"
          >
            <span className="flex items-center space-x-2.5">
              <Heart size={15} className="text-[#C5A059]" />
              <span>Private Wishlist</span>
            </span>
            {wishlist.length > 0 && (
              <span className="px-2 py-0.5 bg-[#A68B66] text-white text-[10px] rounded-full font-bold">
                {wishlist.length}
              </span>
            )}
          </Link>

          {user?.role === 'admin' && (
            <Link
              to="/admin"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center space-x-2.5 py-3 text-xs uppercase tracking-[0.2em] text-[#C5A059] border-b border-[#FAF9F6] font-bold"
            >
              <ShieldCheck size={15} />
              <span>Admin Command Portal</span>
            </Link>
          )}

          {/* Mobile Footer Contact & Instagram Pill */}
          <div className="pt-4 flex items-center justify-between gap-3">
            <a
              href="https://www.instagram.com/nimaahluxe"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center space-x-2 py-2.5 bg-[#FAF9F6] border border-[#E9E1D6] text-xs font-cinzel font-semibold text-[#29251F]"
            >
              <InstagramIcon size={15} className="text-[#C5A059]" />
              <span>@nimaahluxe</span>
            </a>
            <a
              href="tel:+918618621612"
              className="flex-1 text-center py-2.5 bg-[#29251F] text-[#FAF9F6] text-[11px] tracking-wider font-medium"
            >
              +91 8618621612
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
