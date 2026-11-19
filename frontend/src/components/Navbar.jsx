import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingBag,
  Heart,
  User,
  Search,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Package,
  Bell,
  Headphones,
  Sparkles,
  Phone,
  Mail,
  MessageCircle,
  Clock,
  CheckCircle2,
  ShieldCheck,
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
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);

  const { user, logout, isAdmin } = useAuth();
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
    { name: 'Collection', path: '/shop' },
    { name: 'Dresses', path: '/shop?category=Dresses' },
    { name: 'Ethnic', path: '/shop?category=Ethnic Wear' },
    { name: 'Sarees', path: '/shop?category=Sarees' },
    { name: 'Kurtis', path: '/shop?category=Kurtis' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#FAF9F6] border-b border-[#E9E1D6] transition-all duration-300">
      {/* 1. Ultra-Thin Top Luxury Announcement Bar */}
      <div className="bg-[#14110C] text-[#E8DCC9] text-[9.5px] sm:text-[10px] tracking-[0.25em] uppercase py-1.5 px-4 text-center border-b border-[#2A231A]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span className="hidden md:inline font-cinzel text-[#C5A059]">Bespoke Haute Couture</span>
          <p className="flex-1 text-center font-medium">
            Complimentary Concierge Shipping on All Luxury Orders • Handcrafted in Atelier
          </p>
          <button
            onClick={() => setIsSupportModalOpen(true)}
            className="hidden md:inline hover:text-[#C5A059] transition cursor-pointer"
          >
            Client Concierge
          </button>
        </div>
      </div>

      {/* 2. Main Brand Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 sm:h-20">
          {/* Mobile Menu Button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1.5 text-[#29251F] hover:text-[#A68B66] transition-colors focus:outline-none"
              aria-label="Toggle navigation drawer"
            >
              {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

          {/* Left Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center space-x-6 text-xs uppercase tracking-[0.2em] font-medium text-[#29251F]">
            {navLinks.map((link) => {
              const isActive =
                location.pathname + location.search === link.path ||
                (link.path === '/shop' && location.pathname === '/shop' && !location.search);
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`hover:text-[#A68B66] transition-colors pb-1 relative ${
                    isActive ? 'text-[#A68B66] font-semibold' : ''
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-[#A68B66]"></span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Center Brand Identity */}
          <div className="flex-shrink-0 text-center">
            <Link to="/" className="flex flex-col items-center group">
              <span className="font-cinzel text-xl sm:text-2xl md:text-3xl tracking-[0.16em] sm:tracking-[0.2em] text-[#29251F] font-bold group-hover:text-[#A68B66] transition-colors uppercase leading-none">
                Ni'maah Luxe
              </span>
              <span className="font-serif italic text-[8.5px] sm:text-[10px] tracking-[0.25em] sm:tracking-[0.3em] text-[#A68B66] uppercase mt-1 leading-none">
                StyleHub Haute Couture
              </span>
            </Link>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Search Toggle Button */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-1.5 sm:p-2 text-[#29251F] hover:text-[#A68B66] transition-colors rounded-full"
              title="Search collection"
              aria-label="Search"
            >
              <Search size={18} strokeWidth={1.6} />
            </button>

            {/* Private Wishlist Link */}
            <Link
              to="/wishlist"
              className="p-1.5 sm:p-2 text-[#29251F] hover:text-[#A68B66] transition-colors relative"
              title="Private Wishlist"
              aria-label="Wishlist"
            >
              <Heart size={18} strokeWidth={1.6} />
              {wishlist.length > 0 && (
                <span className="absolute 0 top-0.5 right-0.5 w-4 h-4 bg-[#A68B66] text-[#FAF9F6] text-[9px] rounded-full flex items-center justify-center font-bold">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Shopping Cart Bag */}
            <Link
              to="/cart"
              className="p-1.5 sm:p-2 text-[#29251F] hover:text-[#A68B66] transition-colors relative"
              title="Shopping Cart"
              aria-label="Cart"
            >
              <ShoppingBag size={18} strokeWidth={1.6} />
              {itemsCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-[#29251F] text-[#FAF9F6] text-[9px] rounded-full flex items-center justify-center font-bold">
                  {itemsCount}
                </span>
              )}
            </Link>

            {/* Customer Profile & Account Dropdown (Flipkart style: Clean Customer Menu Only) */}
            <div className="relative">
              {user ? (
                <>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-1 p-0.5 text-[#29251F] hover:text-[#A68B66] transition-colors focus:outline-none"
                    aria-expanded={isUserMenuOpen}
                    title="Account Menu"
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
                      {/* Patron Header */}
                      <div className="px-5 py-3 border-b border-[#FAF9F6] space-y-1">
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-medium">Hello,</p>
                        <p className="text-sm font-semibold text-[#29251F] truncate">{user.name}</p>
                        <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
                        <span className="inline-block mt-1 text-[9.5px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-xs bg-[#FAF9F6] text-[#A68B66] border border-[#E9E1D6]">
                          {isAdmin ? 'Store Administrator' : "Ni'maah Privé Patron"}
                        </span>
                      </div>

                      {/* Admin Quick Switch (Strictly visible ONLY to verified Admins) */}
                      {isAdmin && (
                        <div className="p-2 mx-3 my-1.5 bg-[#14110C] border border-[#C5A059]/40 rounded-xs shadow-xs">
                          <Link
                            to="/admin/dashboard"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center justify-between text-xs text-[#C5A059] font-bold hover:text-white transition px-2 py-1"
                          >
                            <span className="flex items-center space-x-2">
                              <ShieldCheck size={14} className="text-[#C5A059]" />
                              <span>Admin Dashboard</span>
                            </span>
                            <span>&rarr;</span>
                          </Link>
                        </div>
                      )}

                      {/* 1. My Profile */}
                      <Link
                        to="/account/profile"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center px-5 py-2.5 text-xs text-[#29251F] hover:bg-[#FAF9F6] hover:text-[#A68B66] transition font-medium"
                      >
                        <User size={15} className="mr-3 text-[#A68B66]" />
                        My Profile
                      </Link>

                      {/* 2. My Orders */}
                      <Link
                        to="/account/orders"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center px-5 py-2.5 text-xs text-[#29251F] hover:bg-[#FAF9F6] hover:text-[#A68B66] transition font-medium"
                      >
                        <Package size={15} className="mr-3 text-[#A68B66]" />
                        My Orders
                      </Link>

                      {/* 3. Wishlist */}
                      <Link
                        to="/wishlist"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center justify-between px-5 py-2.5 text-xs text-[#29251F] hover:bg-[#FAF9F6] hover:text-[#A68B66] transition font-medium"
                      >
                        <span className="flex items-center">
                          <Heart size={15} className="mr-3 text-[#A68B66]" />
                          Wishlist
                        </span>
                        {wishlist.length > 0 && (
                          <span className="px-2 py-0.5 bg-[#FAF9F6] text-[#A68B66] border border-[#E9E1D6] text-[10px] rounded-full font-bold">
                            {wishlist.length}
                          </span>
                        )}
                      </Link>

                      {/* 4. Cart */}
                      <Link
                        to="/cart"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center justify-between px-5 py-2.5 text-xs text-[#29251F] hover:bg-[#FAF9F6] hover:text-[#A68B66] transition font-medium"
                      >
                        <span className="flex items-center">
                          <ShoppingBag size={15} className="mr-3 text-[#A68B66]" />
                          Cart
                        </span>
                        {itemsCount > 0 && (
                          <span className="px-2 py-0.5 bg-[#29251F] text-white text-[10px] rounded-full font-bold">
                            {itemsCount}
                          </span>
                        )}
                      </Link>

                      {/* 5. Notifications */}
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          setIsNotificationsModalOpen(true);
                        }}
                        className="w-full flex items-center justify-between px-5 py-2.5 text-xs text-[#29251F] hover:bg-[#FAF9F6] hover:text-[#A68B66] transition font-medium text-left"
                      >
                        <span className="flex items-center">
                          <Bell size={15} className="mr-3 text-[#A68B66]" />
                          Notifications
                        </span>
                        <span className="w-2 h-2 rounded-full bg-[#C5A059]"></span>
                      </button>

                      {/* 6. Customer Support */}
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          setIsSupportModalOpen(true);
                        }}
                        className="w-full flex items-center px-5 py-2.5 text-xs text-[#29251F] hover:bg-[#FAF9F6] hover:text-[#A68B66] transition font-medium text-left"
                      >
                        <Headphones size={15} className="mr-3 text-[#A68B66]" />
                        Customer Support
                      </button>

                      <div className="border-t border-[#E9E1D6] my-1"></div>

                      {/* 7. Logout */}
                      <button
                        onClick={() => {
                          logout();
                          setIsUserMenuOpen(false);
                          navigate('/login');
                        }}
                        className="w-full flex items-center px-5 py-2.5 text-xs text-red-600 hover:bg-red-50 transition font-medium text-left"
                      >
                        <LogOut size={15} className="mr-3" />
                        Logout
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="hidden sm:inline-block px-3.5 py-1.5 sm:px-4 sm:py-2 bg-[#29251F] hover:bg-[#C5A059] text-white text-[10px] sm:text-[11px] uppercase tracking-[0.15em] sm:tracking-[0.2em] font-semibold transition shadow-xs whitespace-nowrap"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="sm:hidden p-1.5 text-[#29251F] hover:text-[#A68B66] transition-colors rounded-full"
                    title="Patron Sign In"
                    aria-label="Sign In"
                  >
                    <User size={18} strokeWidth={1.6} />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar Overlay */}
      {isSearchOpen && (
        <div className="py-3 sm:py-4 border-t border-[#E9E1D6] bg-white">
          <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto px-4 flex items-stretch gap-2">
            <div className="relative flex-1 min-w-0">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A68B66]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search luxury gowns, sarees, kurtis..."
                className="w-full pl-9 pr-3 py-2.5 bg-[#FAF9F6] border border-[#E9E1D6] focus:outline-none focus:border-[#A68B66] text-xs sm:text-sm text-[#29251F] placeholder-gray-400"
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#29251F] hover:bg-[#A68B66] text-[#FAF9F6] text-xs uppercase tracking-widest font-semibold transition shrink-0"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => setIsSearchOpen(false)}
              className="p-2 text-gray-400 hover:text-[#29251F] transition shrink-0"
            >
              <X size={18} />
            </button>
          </form>
        </div>
      )}

      {/* 3. Mobile Navigation Drawer (Pure Customer Menu - ZERO Admin Links) */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-[#E9E1D6] px-4 pt-3 pb-6 space-y-1 shadow-lg max-h-[85vh] overflow-y-auto">
          {/* Customer Profile Card on Mobile */}
          {user ? (
            <div className="p-3.5 bg-[#FAF9F6] border border-[#E9E1D6] rounded-xs mb-3 space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest">Signed In As</p>
                {isAdmin && (
                  <span className="text-[9px] uppercase font-bold px-2 py-0.5 bg-[#14110C] text-[#C5A059] rounded-xs">
                    Admin
                  </span>
                )}
              </div>
              <p className="text-sm font-bold text-[#29251F] truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>

              {isAdmin && (
                <div className="pt-2">
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full flex items-center justify-between p-2.5 bg-[#14110C] text-[#C5A059] rounded-xs text-xs font-bold uppercase tracking-wider shadow-sm"
                  >
                    <span className="flex items-center space-x-2">
                      <ShieldCheck size={15} />
                      <span>Open Admin Dashboard</span>
                    </span>
                    <span>&rarr;</span>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 mb-3">
              <Link
                to="/login"
                onClick={() => setIsMenuOpen(false)}
                className="py-2.5 text-center bg-[#29251F] text-white text-xs uppercase tracking-wider font-semibold"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setIsMenuOpen(false)}
                className="py-2.5 text-center bg-[#FAF9F6] border border-[#E9E1D6] text-[#29251F] text-xs uppercase tracking-wider font-semibold"
              >
                Register
              </Link>
            </div>
          )}

          {/* Flipkart Reference Customer Menu Items */}
          {user && (
            <div className="border-b border-[#FAF9F6] pb-2 mb-2 space-y-0.5">
              <Link
                to="/account/profile"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center space-x-3 py-2.5 text-xs uppercase tracking-wider text-[#29251F] hover:text-[#A68B66] font-medium"
              >
                <User size={15} className="text-[#A68B66]" />
                <span>My Profile</span>
              </Link>

              <Link
                to="/account/orders"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center space-x-3 py-2.5 text-xs uppercase tracking-wider text-[#29251F] hover:text-[#A68B66] font-medium"
              >
                <Package size={15} className="text-[#A68B66]" />
                <span>My Orders</span>
              </Link>

              <Link
                to="/wishlist"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center justify-between py-2.5 text-xs uppercase tracking-wider text-[#29251F] hover:text-[#A68B66] font-medium"
              >
                <span className="flex items-center space-x-3">
                  <Heart size={15} className="text-[#A68B66]" />
                  <span>Wishlist</span>
                </span>
                {wishlist.length > 0 && (
                  <span className="px-2 py-0.5 bg-[#A68B66] text-white text-[10px] rounded-full font-bold">
                    {wishlist.length}
                  </span>
                )}
              </Link>

              <Link
                to="/cart"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center justify-between py-2.5 text-xs uppercase tracking-wider text-[#29251F] hover:text-[#A68B66] font-medium"
              >
                <span className="flex items-center space-x-3">
                  <ShoppingBag size={15} className="text-[#A68B66]" />
                  <span>Cart</span>
                </span>
                {itemsCount > 0 && (
                  <span className="px-2 py-0.5 bg-[#29251F] text-white text-[10px] rounded-full font-bold">
                    {itemsCount}
                  </span>
                )}
              </Link>

              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsNotificationsModalOpen(true);
                }}
                className="w-full flex items-center space-x-3 py-2.5 text-xs uppercase tracking-wider text-[#29251F] hover:text-[#A68B66] font-medium text-left"
              >
                <Bell size={15} className="text-[#A68B66]" />
                <span>Notifications</span>
              </button>

              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsSupportModalOpen(true);
                }}
                className="w-full flex items-center space-x-3 py-2.5 text-xs uppercase tracking-wider text-[#29251F] hover:text-[#A68B66] font-medium text-left"
              >
                <Headphones size={15} className="text-[#A68B66]" />
                <span>Customer Support</span>
              </button>

              <button
                onClick={() => {
                  logout();
                  setIsMenuOpen(false);
                  navigate('/login');
                }}
                className="w-full flex items-center space-x-3 py-2.5 text-xs uppercase tracking-wider text-red-600 hover:text-red-700 font-medium text-left"
              >
                <LogOut size={15} />
                <span>Logout</span>
              </button>
            </div>
          )}

          {/* Boutique Navigation Links */}
          <div className="pt-2 border-t border-[#FAF9F6]">
            <p className="text-[10px] text-gray-400 uppercase tracking-widest px-1 py-1 font-semibold">Explore Catalog</p>
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className="block py-2.5 text-xs uppercase tracking-[0.2em] text-[#29251F] hover:text-[#A68B66] font-medium"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Mobile Footer Contact & Instagram Pill */}
          <div className="pt-4 flex items-center justify-between gap-3 border-t border-[#FAF9F6]">
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

      {/* 4. Customer Support Concierge Modal */}
      {isSupportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white border border-[#E9E1D6] max-w-md w-full p-6 shadow-2xl relative space-y-5 animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setIsSupportModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-[#29251F]"
            >
              <X size={18} />
            </button>

            <div className="text-center space-y-1">
              <div className="w-10 h-10 rounded-full bg-[#FAF9F6] border border-[#C5A059] flex items-center justify-center mx-auto text-[#C5A059]">
                <Headphones size={20} />
              </div>
              <h3 className="font-serif-luxury text-xl font-bold text-[#29251F]">Client Concierge & Support</h3>
              <p className="text-xs text-gray-500">How may our atelier assist your haute couture journey today?</p>
            </div>

            <div className="space-y-3 text-xs">
              <a
                href="tel:+918618621612"
                className="flex items-center p-3 bg-[#FAF9F6] border border-[#E9E1D6] hover:border-[#C5A059] transition space-x-3 group"
              >
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#C5A059] border border-[#E9E1D6]">
                  <Phone size={14} />
                </div>
                <div>
                  <p className="font-semibold text-[#29251F] group-hover:text-[#A68B66]">Direct Concierge Hotline</p>
                  <p className="text-gray-500 text-[11px]">+91 8618621612 (10:00 AM – 8:00 PM IST)</p>
                </div>
              </a>

              <a
                href="mailto:support@stylehub.com"
                className="flex items-center p-3 bg-[#FAF9F6] border border-[#E9E1D6] hover:border-[#C5A059] transition space-x-3 group"
              >
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#C5A059] border border-[#E9E1D6]">
                  <Mail size={14} />
                </div>
                <div>
                  <p className="font-semibold text-[#29251F] group-hover:text-[#A68B66]">Atelier Support Desk</p>
                  <p className="text-gray-500 text-[11px]">support@stylehub.com</p>
                </div>
              </a>

              <Link
                to="/track-order"
                onClick={() => setIsSupportModalOpen(false)}
                className="flex items-center p-3 bg-[#FAF9F6] border border-[#E9E1D6] hover:border-[#C5A059] transition space-x-3 group"
              >
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#C5A059] border border-[#E9E1D6]">
                  <Clock size={14} />
                </div>
                <div>
                  <p className="font-semibold text-[#29251F] group-hover:text-[#A68B66]">Track Order & Live Parcel</p>
                  <p className="text-gray-500 text-[11px]">Check BlueDart shipment status & delivery timeline</p>
                </div>
              </Link>
            </div>

            <button
              onClick={() => setIsSupportModalOpen(false)}
              className="w-full py-2.5 bg-[#29251F] text-white text-xs uppercase tracking-wider font-semibold hover:bg-[#C5A059] transition"
            >
              Close Concierge Desk
            </button>
          </div>
        </div>
      )}

      {/* 5. Customer Notifications Modal */}
      {isNotificationsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white border border-[#E9E1D6] max-w-md w-full p-6 shadow-2xl relative space-y-5 animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setIsNotificationsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-[#29251F]"
            >
              <X size={18} />
            </button>

            <div className="text-center space-y-1">
              <div className="w-10 h-10 rounded-full bg-[#FAF9F6] border border-[#C5A059] flex items-center justify-center mx-auto text-[#C5A059]">
                <Bell size={20} />
              </div>
              <h3 className="font-serif-luxury text-xl font-bold text-[#29251F]">Notifications & Updates</h3>
              <p className="text-xs text-gray-500">Latest updates for your Ni'maah Luxe wardrobe</p>
            </div>

            <div className="space-y-2.5 text-xs divide-y divide-[#FAF9F6]">
              <div className="pt-2 flex items-start space-x-3">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[#29251F]">Live Order Tracking Active</p>
                  <p className="text-gray-500 text-[11px]">
                    Real-time BlueDart tracking timeline is now active for all your bespoke orders.
                  </p>
                  <span className="text-[10px] text-gray-400">Just now</span>
                </div>
              </div>

              <div className="pt-2 flex items-start space-x-3">
                <Sparkles size={16} className="text-[#C5A059] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[#29251F]">Seasonal Haute Couture Edition</p>
                  <p className="text-gray-500 text-[11px]">
                    Handcrafted Mulberry Silk Sarees & French Chantilly Lace designs now live in Collection.
                  </p>
                  <span className="text-[10px] text-gray-400">Today</span>
                </div>
              </div>

              <div className="pt-2 flex items-start space-x-3">
                <ShoppingBag size={16} className="text-[#29251F] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[#29251F]">Complimentary Express Shipping</p>
                  <p className="text-gray-500 text-[11px]">
                    Enjoy insured express courier delivery on all orders this season.
                  </p>
                  <span className="text-[10px] text-gray-400">Member Privilege</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsNotificationsModalOpen(false)}
              className="w-full py-2.5 bg-[#29251F] text-white text-xs uppercase tracking-wider font-semibold hover:bg-[#C5A059] transition"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
