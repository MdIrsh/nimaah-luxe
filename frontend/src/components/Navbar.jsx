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

  const { user, isAdmin, logout, switchRole } = useAuth();
  const { itemsCount, wishlist } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Collection', path: '/shop' },
    { name: 'Dresses', path: '/shop?category=Dresses' },
    { name: 'Sarees', path: '/shop?category=Sarees' },
    { name: 'Kurtis', path: '/shop?category=Kurtis' },
    { name: 'Western Wear', path: '/shop?category=Western%20Wear' },
    { name: 'Accessories', path: '/shop?category=Accessories' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#FFFFFF]/98 backdrop-blur-md border-b border-[#E9E1D6]/80 transition-all shadow-xs">
      {/* 1. Top Announcement Bar */}
      <div className="bg-[#29251F] text-[#FAF9F6] text-[11px] py-2 px-4 sm:px-8 tracking-[0.2em] uppercase font-medium flex items-center justify-between border-b border-[#3A352D]">
        <div className="hidden sm:flex items-center space-x-2 text-[#C5A059]">
          <Sparkles size={12} />
          <span>Haute Couture & Prêt Atelier</span>
        </div>

        <div className="mx-auto flex items-center gap-2 text-center text-[10px] sm:text-[11px]">
          <span>Complimentary White-Glove Shipping On Orders Over ₹15,000</span>
          <span className="text-[#C5A059]">•</span>
          <span className="text-[#E9E1D6]">Code: <strong className="text-[#C5A059] tracking-widest">NIMAAH20</strong></span>
        </div>

        <div className="hidden md:flex items-center text-[10px] text-[#E9E1D6] tracking-widest">
          <span>Chennai, India • +91 8618621612</span>
        </div>
      </div>

      {/* 2. Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24">
          {/* Mobile Menu Button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 -ml-2 text-[#29251F] hover:text-[#C5A059] focus:outline-none transition"
              aria-label="Toggle navigation menu"
            >
              {isMenuOpen ? <X size={26} strokeWidth={1.5} /> : <Menu size={26} strokeWidth={1.5} />}
            </button>
          </div>

          {/* Ni'maah Luxe Official Brand Emblem & Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3.5 group py-2">
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border border-[#C5A059]/60 shadow-sm flex-shrink-0 bg-[#29251F] p-0.5">
                <img
                  src={logoImg}
                  alt="Ni'maah Luxe Emblem"
                  className="w-full h-full object-cover rounded-full group-hover:scale-105 transition duration-500"
                />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-cinzel text-xl sm:text-2xl font-semibold tracking-[0.18em] text-[#29251F] group-hover:text-[#A68B66] transition-colors leading-tight">
                  NI'MAAH LUXE
                </span>
                <span className="font-sans text-[8.5px] sm:text-[9.5px] tracking-[0.35em] text-[#A68B66] uppercase font-medium mt-0.5">
                  Divinely Inspired Fashion
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center space-x-7">
            {navLinks.map((link) => {
              const isActive = location.pathname + location.search === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-[12px] uppercase tracking-[0.2em] font-medium transition-colors py-2 relative group ${
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

          {/* Right Action Icons with Perfect Margins & Padding */}
          <div className="flex items-center space-x-3.5 sm:space-x-5">
            {/* Instagram Official Profile Link */}
            <a
              href="https://www.instagram.com/nimaahluxe"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-[#29251F] hover:text-[#C5A059] transition-colors relative flex items-center group"
              title="Follow @nimaahluxe on Instagram"
              aria-label="Instagram @nimaahluxe"
            >
              <InstagramIcon size={20} />
              <span className="hidden xl:inline ml-1.5 text-[11px] font-cinzel font-semibold tracking-wider text-[#A68B66] group-hover:text-[#29251F]">
                @nimaahluxe
              </span>
            </a>

            {/* Search Button */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 text-[#29251F] hover:text-[#A68B66] transition-colors"
              title="Search creations"
              aria-label="Search"
            >
              <Search size={20} strokeWidth={1.6} />
            </button>

            {/* Wishlist Icon */}
            <Link
              to="/wishlist"
              className="p-2 text-[#29251F] hover:text-[#A68B66] transition-colors relative"
              title="Private Wishlist"
              aria-label="Wishlist"
            >
              <Heart size={20} strokeWidth={1.6} />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-0 bg-[#A68B66] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold shadow-xs">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Shopping Bag Icon */}
            <Link
              to="/cart"
              className="p-2 text-[#29251F] hover:text-[#A68B66] transition-colors relative"
              title="Shopping Bag"
              aria-label="Shopping Bag"
            >
              <ShoppingBag size={20} strokeWidth={1.6} />
              {itemsCount > 0 && (
                <span className="absolute top-1 right-0 bg-[#29251F] text-[#FAF9F6] text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold shadow-xs">
                  {itemsCount}
                </span>
              )}
            </Link>

            {/* Patron Profile Menu or Sign In */}
            <div className="relative pl-1">
              {user ? (
                <>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-1.5 p-1 text-[#29251F] hover:text-[#A68B66] transition-colors focus:outline-none"
                    aria-expanded={isUserMenuOpen}
                  >
                    <div className="w-8 h-8 rounded-full border border-[#C5A059]/60 overflow-hidden bg-[#FAF9F6] flex items-center justify-center shadow-xs">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <User size={16} />
                      )}
                    </div>
                    <ChevronDown size={14} className="text-[#A68B66]" />
                  </button>

                  {/* Dropdown Menu */}
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
                        Orders & Live Delivery Tracker
                      </Link>

                      <Link
                        to="/account/profile"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center px-5 py-3 text-xs text-[#29251F] hover:bg-[#FAF9F6] hover:text-[#A68B66] transition font-medium"
                      >
                        <User size={16} className="mr-3 text-[#A68B66]" />
                        Atelier Profile & Addresses
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
                  className="px-4 py-2 bg-[#29251F] hover:bg-[#C5A059] text-white text-[11px] uppercase tracking-[0.2em] font-semibold transition shadow-xs"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Search Bar Overlay */}
        {isSearchOpen && (
          <div className="py-4 border-t border-[#E9E1D6] animate-fadeIn">
            <form onSubmit={handleSearchSubmit} className="relative max-w-2xl mx-auto flex items-center">
              <Search size={18} className="absolute left-4 text-[#A68B66]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search gowns, sarees, silk dresses, tops, tailored suits..."
                className="w-full pl-12 pr-28 py-3.5 bg-[#FAF9F6] border border-[#E9E1D6] focus:outline-none focus:border-[#A68B66] text-sm text-[#29251F] placeholder-gray-400 font-serif-luxury shadow-inner"
                autoFocus
              />
              <button
                type="submit"
                className="absolute right-2 px-5 py-2 bg-[#29251F] text-white text-xs uppercase tracking-widest font-semibold hover:bg-[#A68B66] transition shadow-xs"
              >
                Search
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Mobile Drawer Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-b border-[#E9E1D6] px-6 pt-3 pb-8 space-y-3.5 shadow-lg">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setIsMenuOpen(false)}
              className="block py-2.5 text-xs uppercase tracking-[0.2em] text-[#29251F] hover:text-[#A68B66] border-b border-[#FAF9F6] font-medium"
            >
              {link.name}
            </Link>
          ))}
          {user?.role === 'admin' && (
            <Link
              to="/admin"
              onClick={() => setIsMenuOpen(false)}
              className="block py-2.5 text-xs uppercase tracking-[0.2em] text-[#A68B66] font-bold"
            >
              Admin Dashboard
            </Link>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
