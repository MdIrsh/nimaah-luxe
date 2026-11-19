import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Crown,
  Search,
  Sparkles,
  Shirt,
  Gem,
  ShoppingBag,
  Layers,
  Tag,
} from 'lucide-react';
import InstagramIcon from '../components/InstagramIcon';
import ProductCard from '../components/ProductCard';
import { productService, DEMO_PRODUCTS } from '../services/productService';
import { getProductImageUrl, handleImageError } from '../utils/imageUtils';
import logoImg from '../assets/nimaah-luxe-logo.png';
import instaProfileImg from '../assets/nimaahluxe-profile.png';

export const HomePage = () => {
  const [products, setProducts] = useState(DEMO_PRODUCTS);
  const [mobileSearch, setMobileSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const data = await productService.getProducts();
        if (data && data.length > 0) {
          setProducts(data);
        }
      } catch (err) {
        console.error('Error fetching home catalog:', err);
      }
    };
    fetchCatalog();
  }, []);

  const handleMobileSearch = (e) => {
    e.preventDefault();
    if (mobileSearch.trim()) {
      navigate(`/shop?search=${encodeURIComponent(mobileSearch.trim())}`);
    }
  };

  const quickCategories = [
    { name: 'For You', path: '/shop', icon: Sparkles, active: true },
    { name: 'Dresses', path: '/shop?category=Dresses', icon: Crown },
    { name: 'Ethnic', path: '/shop?category=Ethnic%20Wear', icon: Gem },
    { name: 'Sarees', path: '/shop?category=Sarees', icon: Layers },
    { name: 'Kurtis', path: '/shop?category=Kurtis', icon: Shirt },
    { name: 'Tops', path: '/shop?category=Tops', icon: Tag },
    { name: 'Western', path: '/shop?category=Western%20Wear', icon: ShoppingBag },
  ];

  const spotlightRow = products.slice(0, 3);
  const weddingSpecials = products.slice(2, 5);
  const newArrivals = products.slice(0, 4);
  const bestSellers = products.filter((p) => p.isBestSeller || p.ratings >= 4.9).slice(0, 4);

  return (
    <div className="space-y-8 sm:space-y-16 lg:space-y-24 pb-12 sm:pb-24">
      {/* MOBILE APP-STYLE TOP SEARCH + CATEGORY ICON BAR */}
      <div className="lg:hidden bg-gradient-to-b from-[#F5EFE6] to-[#FAF9F6] pt-3 pb-2 border-b border-[#E9E1D6]/70">
        {/* Rounded Search Bar */}
        <div className="px-3.5 pb-3">
          <form onSubmit={handleMobileSearch} className="relative">
            <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A68B66]" />
            <input
              type="text"
              value={mobileSearch}
              onChange={(e) => setMobileSearch(e.target.value)}
              placeholder="Search for Dresses, Sarees, Kurtis..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#C5A059]/60 rounded-xl text-xs text-[#29251F] placeholder-gray-400 shadow-xs focus:outline-none focus:border-[#29251F]"
            />
          </form>
        </div>

        {/* Horizontal Category Icon Tabs */}
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar px-4 pt-1">
          {quickCategories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.name}
                to={cat.path}
                className={`flex flex-col items-center gap-1 pb-2 flex-shrink-0 border-b-2 transition ${
                  cat.active
                    ? 'border-[#29251F] text-[#29251F] font-semibold'
                    : 'border-transparent text-[#29251F]/70'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                    cat.active
                      ? 'bg-[#29251F] text-[#E8D3A2] border-[#29251F]'
                      : 'bg-white text-[#A68B66] border-[#E9E1D6]'
                  }`}
                >
                  <Icon size={16} strokeWidth={1.7} />
                </div>
                <span className="text-[10.5px] whitespace-nowrap">{cat.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 1. Hero Banner — Sleek Rounded App Card on Mobile, Grand Full-Bleed on Desktop */}
      <section className="px-3.5 lg:px-0">
        <div className="relative min-h-[240px] sm:min-h-[420px] lg:min-h-[82vh] flex items-center bg-[#24201A] overflow-hidden rounded-2xl lg:rounded-none shadow-md lg:shadow-none">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=2000&q=85"
              alt="Ni'maah Luxe Haute Couture Editorial"
              className="w-full h-full object-cover object-top opacity-45"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#24201A] via-[#24201A]/80 to-[#24201A]/20"></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-5 sm:px-8 py-8 sm:py-16 lg:py-28 text-[#FAF9F6] w-full">
            <div className="max-w-xl space-y-3 sm:space-y-6">
              <div className="inline-flex items-center space-x-2 px-2.5 sm:px-4 py-1 sm:py-1.5 bg-[#C5A059]/20 backdrop-blur-md border border-[#C5A059]/40 text-[#E8D3A2] text-[9px] sm:text-xs uppercase tracking-[0.18em] sm:tracking-[0.3em] font-semibold rounded-full sm:rounded-xs">
                <Crown size={12} className="text-[#C5A059] flex-shrink-0" />
                <span>Couture Collection 2026</span>
              </div>

              <h1 className="font-serif-luxury text-3xl sm:text-5xl lg:text-7xl font-normal leading-[1.08] tracking-tight">
                Divinely <span className="italic font-light text-[#E8D3A2]">Inspired Fashion.</span>
              </h1>

              <p className="text-[11px] sm:text-sm lg:text-base text-gray-300 font-light leading-relaxed max-w-md line-clamp-2 sm:line-clamp-none">
                Opulent evening gowns, handwoven Banarasi sarees, and sculpted silhouettes tailored to honor sovereign grace.
              </p>

              <div className="flex items-center gap-2.5 sm:gap-4 pt-1 sm:pt-2">
                <Link
                  to="/shop"
                  className="px-5 sm:px-9 py-2.5 sm:py-4 bg-[#FAF9F6] text-[#29251F] hover:bg-[#C5A059] hover:text-white text-[10px] sm:text-xs font-semibold uppercase tracking-[0.16em] sm:tracking-[0.2em] rounded-lg sm:rounded-none transition shadow-lg"
                >
                  Shop Now
                </Link>
                <Link
                  to="/shop?category=Dresses"
                  className="px-4 sm:px-9 py-2.5 sm:py-4 bg-transparent border border-[#C5A059]/70 hover:border-white text-white text-[10px] sm:text-xs font-semibold uppercase tracking-[0.16em] sm:tracking-[0.2em] rounded-lg sm:rounded-none transition"
                >
                  Evening Gowns
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. 3-Column Quick Spotlight Strip (Existing MongoDB Dresses) */}
      <section className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
        <div className="grid grid-cols-3 gap-2.5 sm:gap-6">
          {spotlightRow.map((prod) => (
            <Link
              key={prod._id}
              to={`/product/${prod._id}`}
              className="group bg-white rounded-xl sm:rounded-sm border border-[#E9E1D6] overflow-hidden shadow-xs flex flex-col"
            >
              <div className="aspect-[3/4] sm:aspect-[4/4] overflow-hidden bg-[#FAF9F6]">
                <img
                  src={getProductImageUrl(prod.images?.[0])}
                  alt={prod.title}
                  loading="lazy"
                  onError={handleImageError}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition duration-500"
                />
              </div>
              <div className="p-2 sm:p-4 text-center space-y-0.5 bg-white">
                <p className="text-[10px] sm:text-xs font-bold text-[#29251F]">
                  From ₹{(prod.discountedPrice || prod.price).toLocaleString('en-IN')}
                </p>
                <p className="text-[9.5px] sm:text-xs text-gray-500 truncate">{prod.category}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Royal Wedding & Festive Highlight Box (3-Column Compact App Card using Existing Dresses) */}
      <section className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-gradient-to-br from-[#F4ECE1] via-[#EFE5D7] to-[#E6D8C5] p-3.5 sm:p-7 lg:p-10 border border-[#C5A059]/35 shadow-xs space-y-3.5 sm:space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[9.5px] sm:text-[11px] uppercase tracking-[0.22em] text-[#A68B66] font-cinzel font-bold block">
                Ni'maah Luxe
              </span>
              <h2 className="font-serif-luxury text-xl sm:text-3xl text-[#29251F] font-semibold leading-tight">
                Royal Couture Edit
              </h2>
            </div>
            <span className="px-3 py-1 bg-[#29251F] text-[#E8D3A2] text-[9.5px] sm:text-xs font-cinzel uppercase tracking-widest rounded-full border border-[#C5A059]/50 shadow-xs">
              Wedding Specials
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2.5 sm:gap-5">
            {weddingSpecials.map((prod) => (
              <Link
                key={prod._id}
                to={`/product/${prod._id}`}
                className="group bg-white/90 rounded-xl overflow-hidden shadow-xs border border-white flex flex-col"
              >
                <div className="aspect-[3/4] overflow-hidden bg-[#FAF9F6]">
                  <img
                    src={getProductImageUrl(prod.images?.[0])}
                    alt={prod.title}
                    loading="lazy"
                    onError={handleImageError}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition duration-500"
                  />
                </div>
                <div className="p-2 sm:p-3.5 text-center space-y-0.5">
                  <p className="text-[10px] sm:text-xs text-[#29251F] truncate font-medium">
                    {prod.title}
                  </p>
                  <p className="text-[10px] sm:text-sm font-bold text-[#A68B66]">
                    ₹{(prod.discountedPrice || prod.price).toLocaleString('en-IN')}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. New Arrivals — 2-Column App Grid on Mobile, 4-Column on Desktop */}
      <section className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-4 sm:mb-8 border-b border-[#E9E1D6] pb-3 sm:pb-4">
          <div>
            <span className="text-[9.5px] sm:text-[11px] uppercase tracking-[0.24em] text-[#C5A059] font-cinzel font-semibold">
              Fresh Off The Runway
            </span>
            <h2 className="font-serif-luxury text-2xl sm:text-4xl text-[#29251F]">New Arrivals</h2>
          </div>
          <Link
            to="/shop?sort=newest"
            className="inline-flex items-center space-x-1 text-[10.5px] sm:text-xs uppercase tracking-[0.14em] text-[#29251F] hover:text-[#C5A059] font-semibold transition"
          >
            <span>View All</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-7">
          {newArrivals.map((prod) => (
            <ProductCard key={prod._id} product={prod} />
          ))}
        </div>
      </section>

      {/* 5. Best Sellers — 2-Column App Grid on Mobile, 4-Column on Desktop */}
      <section className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-4 sm:mb-8 border-b border-[#E9E1D6] pb-3 sm:pb-4">
          <div>
            <span className="text-[9.5px] sm:text-[11px] uppercase tracking-[0.24em] text-[#C5A059] font-cinzel font-semibold">
              Most Coveted Silhouettes
            </span>
            <h2 className="font-serif-luxury text-2xl sm:text-4xl text-[#29251F]">Best Sellers</h2>
          </div>
          <Link
            to="/shop?sort=popular"
            className="inline-flex items-center space-x-1 text-[10.5px] sm:text-xs uppercase tracking-[0.14em] text-[#29251F] hover:text-[#C5A059] font-semibold transition"
          >
            <span>View All</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-7">
          {bestSellers.map((prod) => (
            <ProductCard key={prod._id} product={prod} />
          ))}
        </div>
      </section>

      {/* 6. Official Instagram Showcase: @nimaahluxe */}
      <section className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl sm:rounded-sm border border-[#E9E1D6] p-4 sm:p-10 lg:p-14 shadow-xs space-y-5 sm:space-y-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-[#E9E1D6] pb-5 sm:pb-7">
            <div className="flex items-center space-x-3.5 sm:space-x-5">
              <div className="relative p-0.5 rounded-full bg-gradient-to-tr from-[#C5A059] via-[#F4E3B2] to-[#8C7355] shadow-md flex-shrink-0">
                <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-[#24201A] p-0.5 border border-white">
                  <img
                    src={instaProfileImg}
                    alt="@nimaahluxe Instagram Profile"
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center space-x-1.5">
                  <h3 className="font-cinzel text-lg sm:text-2xl font-bold text-[#29251F] tracking-wider">
                    @nimaahluxe
                  </h3>
                  <span className="p-0.5 bg-[#C5A059] text-white rounded-full">
                    <Crown size={10} />
                  </span>
                </div>
                <p className="text-[9.5px] sm:text-xs text-[#A68B66] font-medium tracking-[0.16em] uppercase font-cinzel">
                  Divinely Inspired Fashion
                </p>
              </div>
            </div>

            <a
              href="https://www.instagram.com/nimaahluxe"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto justify-center px-6 py-2.5 sm:py-3.5 bg-[#29251F] hover:bg-[#C5A059] text-white text-[11px] sm:text-xs uppercase tracking-[0.18em] font-semibold rounded-lg sm:rounded-none transition flex items-center space-x-2 shadow-sm flex-shrink-0"
            >
              <InstagramIcon size={15} />
              <span>Follow @nimaahluxe</span>
            </a>
          </div>

          <div className="grid grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4">
            {products.slice(0, 6).map((prod) => (
              <a
                key={prod._id}
                href="https://www.instagram.com/nimaahluxe"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative aspect-square overflow-hidden rounded-lg sm:rounded-none bg-[#FAF9F6] border border-[#E9E1D6]"
              >
                <img
                  src={getProductImageUrl(prod.images?.[0])}
                  alt={prod.title}
                  loading="lazy"
                  onError={handleImageError}
                  className="w-full h-full object-cover object-top group-hover:scale-110 transition duration-500 ease-out"
                />
                <div className="absolute inset-0 bg-[#29251F]/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-white p-2 text-center space-y-1">
                  <InstagramIcon size={16} className="text-[#E8D3A2]" />
                  <p className="text-[9px] line-clamp-2 text-gray-200">{prod.category}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
