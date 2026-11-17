import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, ShieldCheck, Heart, Star, Crown } from 'lucide-react';
import InstagramIcon from '../components/InstagramIcon';
import ProductCard from '../components/ProductCard';
import { productService, DEMO_PRODUCTS } from '../services/productService';
import logoImg from '../assets/nimaah-luxe-logo.png';
import instaProfileImg from '../assets/nimaahluxe-profile.png';

export const HomePage = () => {
  const [products, setProducts] = useState(DEMO_PRODUCTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const data = await productService.getProducts();
        if (data && data.length > 0) {
          setProducts(data);
        }
      } catch (err) {
        console.error('Error fetching home catalog:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCatalog();
  }, []);

  const featuredCollections = [
    {
      title: 'Haute Evening Gowns',
      subtitle: 'Silk Velvets & Hand-beaded Crystals',
      image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1200&q=85',
      category: 'Dresses',
      span: 'col-span-1 md:col-span-2',
    },
    {
      title: 'Banarasi Heritage Sarees',
      subtitle: 'Woven with Pure Antique Gold Zari',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=85',
      category: 'Sarees',
      span: 'col-span-1',
    },
    {
      title: 'Power Tailoring',
      subtitle: 'Virgin Italian Wool Silhouettes',
      image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=85',
      category: 'Western Wear',
      span: 'col-span-1',
    },
    {
      title: 'Kashmiri Artisanal Kurtis',
      subtitle: 'Royal Tilla & Santoon Flairs',
      image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=85',
      category: 'Kurtis',
      span: 'col-span-1 md:col-span-2',
    },
  ];

  const newArrivals = products.slice(0, 4);
  const bestSellers = products.filter((p) => p.isBestSeller || p.ratings >= 4.9).slice(0, 4);

  return (
    <div className="space-y-24 sm:space-y-32 pb-28">
      {/* 1. Grand Fashion Hero Banner with Editorial Framing & Balanced Padding */}
      <section className="relative min-h-[90vh] flex items-center bg-[#24201A] overflow-hidden">
        {/* Background Editorial High-Res Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=2000&q=88"
            alt="Ni'maah Luxe Winter Haute Couture Editorial"
            className="w-full h-full object-cover object-top opacity-45 scale-100 transition-transform duration-1000 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#24201A] via-[#24201A]/80 to-transparent"></div>
        </div>

        {/* Hero Content with Perfect Padding & Margins */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 text-[#FAF9F6] w-full">
          <div className="max-w-2xl space-y-7">
            {/* Crown Emblem Badge */}
            <div className="inline-flex items-center space-x-3 px-4 py-1.5 bg-[#C5A059]/15 backdrop-blur-md border border-[#C5A059]/40 text-[#E8D3A2] text-xs uppercase tracking-[0.3em] font-semibold rounded-xs">
              <Crown size={15} className="text-[#C5A059]" />
              <span>Autumn / Winter Haute Couture 2026</span>
            </div>

            <h1 className="font-serif-luxury text-5xl sm:text-7xl lg:text-8xl font-normal leading-[1.04] tracking-tight">
              Divinely <br />
              <span className="italic font-light text-[#E8D3A2]">Inspired Fashion.</span>
            </h1>

            <p className="text-sm sm:text-base text-gray-300 font-light leading-relaxed max-w-lg">
              Explore Ni'maah Luxe's opulent evening gowns, handwoven Banarasi sarees, and sculpted silhouettes handcrafted to honor sovereign grace.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-3">
              <Link
                to="/shop"
                className="px-8 sm:px-10 py-4 bg-[#FAF9F6] text-[#29251F] hover:bg-[#C5A059] hover:text-white text-xs font-semibold uppercase tracking-[0.22em] transition duration-300 shadow-xl"
              >
                Explore Collection
              </Link>
              <Link
                to="/shop?category=Dresses"
                className="px-8 sm:px-10 py-4 bg-transparent border border-[#C5A059]/60 hover:border-white text-white text-xs font-semibold uppercase tracking-[0.22em] transition duration-300 backdrop-blur-sm"
              >
                Evening Gowns
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Ni'maah Creed Ethos with Generous Breathing Room */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-full overflow-hidden border border-[#C5A059]/50 p-1 shadow-sm bg-white">
          <img src={logoImg} alt="Ni'maah Emblem" className="w-full h-full object-cover rounded-full" />
        </div>
        <span className="text-[11px] uppercase tracking-[0.35em] text-[#C5A059] font-cinzel font-semibold block">
          The Ni'maah Philosophy
        </span>
        <h2 className="font-serif-luxury text-3xl sm:text-5xl text-[#29251F] font-normal leading-tight max-w-3xl mx-auto">
          "Beauty is not crafted to conform; it is divinely inspired to crown the spirit with sovereignty."
        </h2>
        <div className="w-20 h-[1.5px] bg-gradient-to-r from-transparent via-[#C5A059] to-transparent mx-auto mt-6"></div>
      </section>

      {/* 3. Curated Wardrobe Collections with Balanced Gaps */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div className="space-y-1">
            <span className="text-[11px] uppercase tracking-[0.28em] text-[#C5A059] font-cinzel font-semibold">
              Curated Wardrobe
            </span>
            <h2 className="font-serif-luxury text-3xl sm:text-4xl text-[#29251F]">Bespoke Collections</h2>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center space-x-2 text-xs uppercase tracking-[0.2em] text-[#29251F] hover:text-[#C5A059] font-semibold mt-4 md:mt-0 transition group"
          >
            <span>View All Categories</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {featuredCollections.map((col, idx) => (
            <Link
              key={idx}
              to={`/shop?category=${encodeURIComponent(col.category)}`}
              className={`group relative h-[420px] overflow-hidden bg-[#29251F] ${col.span} shadow-sm border border-[#E9E1D6]/60`}
            >
              <img
                src={col.image}
                alt={col.title}
                className="w-full h-full object-cover object-top opacity-80 group-hover:opacity-95 group-hover:scale-105 transition duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent"></div>
              <div className="absolute bottom-8 left-8 right-8 text-white space-y-1.5">
                <span className="text-[10px] uppercase tracking-[0.3em] text-[#C5A059] font-cinzel font-medium block">
                  {col.subtitle}
                </span>
                <h3 className="font-serif-luxury text-2xl sm:text-3xl group-hover:text-[#E8D3A2] transition">
                  {col.title}
                </h3>
                <span className="inline-flex items-center space-x-2 text-xs uppercase tracking-[0.2em] text-white/90 pt-2 group-hover:translate-x-2 transition-transform">
                  <span>Explore Edit</span>
                  <ArrowRight size={13} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Fresh Off The Runway / New Arrivals */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12 border-b border-[#E9E1D6] pb-5">
          <div className="space-y-1">
            <span className="text-[11px] uppercase tracking-[0.28em] text-[#C5A059] font-cinzel font-semibold">
              Fresh Off The Runway
            </span>
            <h2 className="font-serif-luxury text-3xl sm:text-4xl text-[#29251F]">New Arrivals</h2>
          </div>
          <Link
            to="/shop?sort=newest"
            className="hidden sm:inline-flex items-center space-x-2 text-xs uppercase tracking-[0.2em] text-[#29251F] hover:text-[#C5A059] font-semibold transition group"
          >
            <span>View All New</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {newArrivals.map((prod) => (
            <ProductCard key={prod._id} product={prod} />
          ))}
        </div>
      </section>

      {/* 5. Editorial Privilege Banner with Perfect Inset Padding */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative bg-[#E9E1D6] p-8 sm:p-14 lg:p-16 border border-[#C5A059]/40 flex flex-col md:flex-row items-center justify-between gap-10 shadow-sm">
          <div className="max-w-xl space-y-5 text-[#29251F]">
            <span className="text-[11px] uppercase tracking-[0.35em] text-[#A68B66] font-cinzel font-bold">
              Exclusive Privilege
            </span>
            <h2 className="font-serif-luxury text-3xl sm:text-4xl lg:text-5xl leading-tight">
              Complimentary White-Glove Gift & 20% Off Your Curated Order
            </h2>
            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-light">
              Enter private invitation code <strong className="text-[#29251F] font-bold tracking-wider">NIMAAH20</strong> at checkout to unlock savings on our couture gowns and handwoven Banarasi sarees.
            </p>
            <div className="pt-2">
              <Link
                to="/shop"
                className="inline-block px-8 py-4 bg-[#29251F] text-white hover:bg-[#C5A059] text-xs uppercase tracking-[0.2em] font-semibold transition shadow-md"
              >
                Redeem Privilege
              </Link>
            </div>
          </div>

          <div className="w-full md:w-5/12 aspect-[4/3] overflow-hidden shadow-xl border-2 border-white/80">
            <img
              src="https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1000&q=85"
              alt="Ni'maah Luxe Atelier Model"
              className="w-full h-full object-cover object-top hover:scale-105 transition duration-700"
            />
          </div>
        </div>
      </section>

      {/* 6. Best Sellers Collection */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12 border-b border-[#E9E1D6] pb-5">
          <div className="space-y-1">
            <span className="text-[11px] uppercase tracking-[0.28em] text-[#C5A059] font-cinzel font-semibold">
              Most Coveted Silhouettes
            </span>
            <h2 className="font-serif-luxury text-3xl sm:text-4xl text-[#29251F]">Best Sellers</h2>
          </div>
          <Link
            to="/shop?sort=popular"
            className="hidden sm:inline-flex items-center space-x-2 text-xs uppercase tracking-[0.2em] text-[#29251F] hover:text-[#C5A059] font-semibold transition group"
          >
            <span>View All Bestsellers</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {bestSellers.map((prod) => (
            <ProductCard key={prod._id} product={prod} />
          ))}
        </div>
      </section>

      {/* 7. Official Instagram Showcase: @nimaahluxe */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-[#E9E1D6] p-8 sm:p-12 lg:p-14 shadow-xs space-y-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-b border-[#E9E1D6] pb-8">
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-5 text-center sm:text-left">
              {/* Instagram Profile Picture with Royal Story Ring */}
              <div className="relative p-1 rounded-full bg-gradient-to-tr from-[#C5A059] via-[#F4E3B2] to-[#8C7355] shadow-md flex-shrink-0">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-[#24201A] p-0.5 border border-white">
                  <img
                    src={instaProfileImg}
                    alt="@nimaahluxe Instagram Profile"
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-center sm:justify-start space-x-2">
                  <h3 className="font-cinzel text-2xl font-bold text-[#29251F] tracking-wider">
                    @nimaahluxe
                  </h3>
                  <span className="p-1 bg-[#C5A059] text-white rounded-full flex items-center justify-center shadow-xs">
                    <Crown size={11} />
                  </span>
                </div>
                <p className="text-xs text-[#A68B66] font-medium tracking-[0.25em] uppercase font-cinzel">
                  Divinely Inspired Fashion • Official Instagram
                </p>
                <p className="text-xs text-gray-500 font-light">
                  Follow our atelier journey & tag <span className="font-semibold text-[#29251F]">@nimaahluxe</span> to be featured
                </p>
              </div>
            </div>

            <a
              href="https://www.instagram.com/nimaahluxe"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3.5 bg-[#29251F] hover:bg-[#C5A059] text-white text-xs uppercase tracking-[0.2em] font-semibold transition flex items-center space-x-2.5 shadow-md flex-shrink-0"
            >
              <InstagramIcon size={16} />
              <span>Follow @nimaahluxe</span>
            </a>
          </div>

          {/* 6-Photo Runway Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              {
                img: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=600&q=80',
                likes: '1.4k',
                caption: 'Haute Velvet Gown Atelier',
              },
              {
                img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
                likes: '2.1k',
                caption: 'Handwoven Banarasi Zari Silk',
              },
              {
                img: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=600&q=80',
                likes: '980',
                caption: 'Celestial Pleated Silhouette',
              },
              {
                img: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80',
                likes: '1.8k',
                caption: 'Kashmiri Royal Tilla Embroidery',
              },
              {
                img: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=600&q=80',
                likes: '1.2k',
                caption: 'Power Tailoring in Italian Wool',
              },
              {
                img: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80',
                likes: '850',
                caption: 'Artisanal Nappa Leather Clasp',
              },
            ].map((post, idx) => (
              <a
                key={idx}
                href="https://www.instagram.com/nimaahluxe"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative aspect-square overflow-hidden bg-[#FAF9F6] border border-[#E9E1D6]"
              >
                <img
                  src={post.img}
                  alt={post.caption}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-500 ease-out"
                />
                <div className="absolute inset-0 bg-[#29251F]/75 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-white p-2 text-center space-y-1">
                  <InstagramIcon size={20} className="text-[#E8D3A2]" />
                  <span className="text-[10px] font-semibold tracking-wider font-cinzel">♥ {post.likes}</span>
                  <p className="text-[9px] line-clamp-2 text-gray-300 font-light">{post.caption}</p>
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
