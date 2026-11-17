import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Shield, Truck, RefreshCw, Award, Sparkles } from 'lucide-react';
import InstagramIcon from './InstagramIcon';
import logoImg from '../assets/nimaah-luxe-logo.png';
import instaProfileImg from '../assets/nimaahluxe-profile.png';

export const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer className="bg-[#29251F] text-[#FAF9F6] border-t border-[#3A352D] mt-28">
      {/* 1. Value Proposition Banner with generous padding */}
      <div className="border-b border-white/10 py-12 bg-[#221E19]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-white/5 rounded-full text-[#C5A059] flex-shrink-0 mt-0.5 border border-[#C5A059]/20">
                <Truck size={22} />
              </div>
              <div>
                <h4 className="text-xs font-semibold tracking-[0.18em] uppercase text-white font-cinzel">White-Glove Courier</h4>
                <p className="text-[11px] text-gray-400 mt-1 leading-relaxed font-light">Complimentary insured expedited delivery on luxury fashion orders.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="p-3 bg-white/5 rounded-full text-[#C5A059] flex-shrink-0 mt-0.5 border border-[#C5A059]/20">
                <Award size={22} />
              </div>
              <div>
                <h4 className="text-xs font-semibold tracking-[0.18em] uppercase text-white font-cinzel">Artisanal Couture</h4>
                <p className="text-[11px] text-gray-400 mt-1 leading-relaxed font-light">Handcrafted by master artisans with pure mulberry silks and authentic zari.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="p-3 bg-white/5 rounded-full text-[#C5A059] flex-shrink-0 mt-0.5 border border-[#C5A059]/20">
                <RefreshCw size={22} />
              </div>
              <div>
                <h4 className="text-xs font-semibold tracking-[0.18em] uppercase text-white font-cinzel">Bespoke Fit Promise</h4>
                <p className="text-[11px] text-gray-400 mt-1 leading-relaxed font-light">Complimentary personalized sizing assistance & seamless 14-day exchange.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="p-3 bg-white/5 rounded-full text-[#C5A059] flex-shrink-0 mt-0.5 border border-[#C5A059]/20">
                <Shield size={22} />
              </div>
              <div>
                <h4 className="text-xs font-semibold tracking-[0.18em] uppercase text-white font-cinzel">Encrypted Checkout</h4>
                <p className="text-[11px] text-gray-400 mt-1 leading-relaxed font-light">PCI-DSS bank-grade 256-bit encryption for confidential transactions.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Footer Navigation & Brand Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-16">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-6">
            <Link to="/" className="flex items-center space-x-3.5 group">
              <div className="w-12 h-12 rounded-full overflow-hidden border border-[#C5A059]/60 bg-[#29251F] flex-shrink-0 p-0.5">
                <img src={logoImg} alt="Ni'maah Luxe" className="w-full h-full object-cover rounded-full" />
              </div>
              <div>
                <span className="font-cinzel text-2xl tracking-[0.18em] text-[#FAF9F6] block">
                  NI'MAAH LUXE
                </span>
                <span className="text-[9px] tracking-[0.35em] text-[#C5A059] uppercase font-sans block mt-0.5">
                  Divinely Inspired Fashion
                </span>
              </div>
            </Link>

            <p className="text-xs leading-relaxed text-gray-300 max-w-sm font-light">
              Ni'maah Luxe honors women through divinely inspired couture. From majestic Banarasi handloom sarees and ethereal crystal evening gowns to sharp modern power dressing, each piece is an intimate celebration of timeless majesty.
            </p>

            <div className="pt-2 text-xs text-gray-400 space-y-1">
              <p className="text-[10px] uppercase tracking-[0.25em] text-[#C5A059] font-semibold mb-1">
                Atelier Headquarters
              </p>
              <p>Chennai, India</p>
              <p>
                concierge@nimaahluxe.com •{' '}
                <a href="tel:+918618621612" className="hover:text-white transition">
                  +91 8618621612
                </a>
              </p>
            </div>

            {/* Instagram Profile Badge */}
            <div className="pt-2">
              <a
                href="https://www.instagram.com/nimaahluxe"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-3 p-2.5 bg-white/5 hover:bg-white/10 border border-[#C5A059]/30 hover:border-[#C5A059] transition duration-300 rounded-xs group"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden border border-[#C5A059] p-0.5 bg-[#29251F] flex-shrink-0">
                  <img src={instaProfileImg} alt="@nimaahluxe" className="w-full h-full object-cover rounded-full" />
                </div>
                <div className="text-left">
                  <div className="flex items-center space-x-1.5 text-xs text-white group-hover:text-[#E8D3A2]">
                    <InstagramIcon size={14} className="text-[#C5A059]" />
                    <span className="font-semibold font-cinzel">@nimaahluxe</span>
                  </div>
                  <span className="text-[10px] text-gray-400 block font-light">Official Instagram Atelier</span>
                </div>
              </a>
            </div>
          </div>

          {/* Collections */}
          <div>
            <h4 className="text-xs font-semibold tracking-[0.2em] uppercase text-[#C5A059] font-cinzel mb-6">
              Collections
            </h4>
            <ul className="space-y-3.5 text-xs text-gray-300 font-light">
              <li><Link to="/shop?category=Dresses" className="hover:text-white transition">Haute Evening Gowns</Link></li>
              <li><Link to="/shop?category=Sarees" className="hover:text-white transition">Heritage Silk Sarees</Link></li>
              <li><Link to="/shop?category=Kurtis" className="hover:text-white transition">Kashmiri Artisanal Kurtis</Link></li>
              <li><Link to="/shop?category=Western%20Wear" className="hover:text-white transition">Structured Wool Blazers</Link></li>
              <li><Link to="/shop?category=Tops" className="hover:text-white transition">Silk Corsets & Tops</Link></li>
              <li><Link to="/shop?category=Accessories" className="hover:text-white transition">Quilted Leather Bags</Link></li>
            </ul>
          </div>

          {/* Client Care */}
          <div>
            <h4 className="text-xs font-semibold tracking-[0.2em] uppercase text-[#C5A059] font-cinzel mb-6">
              Patron Care
            </h4>
            <ul className="space-y-3.5 text-xs text-gray-300 font-light">
              <li><Link to="/account/orders" className="hover:text-white transition">Track Your Order Pipeline</Link></li>
              <li><Link to="/account/profile" className="hover:text-white transition">Atelier Account Profile</Link></li>
              <li><Link to="/wishlist" className="hover:text-white transition">Private Wishlist Vault</Link></li>
              <li><a href="#size-guide" className="hover:text-white transition">Bespoke Sizing Chart</a></li>
              <li><a href="#care" className="hover:text-white transition">Fabric & Zari Preservation</a></li>
              <li><a href="#shipping" className="hover:text-white transition">White-Glove Shipping & Returns</a></li>
            </ul>
          </div>

          {/* Gazette Newsletter */}
          <div>
            <h4 className="text-xs font-semibold tracking-[0.2em] uppercase text-[#C5A059] font-cinzel mb-4">
              The Ni'maah Gazette
            </h4>
            <p className="text-xs text-gray-300 leading-relaxed font-light mb-5">
              Receive private invitations to confidential runway previews, bespoke salon events, and limited atelier releases.
            </p>

            {subscribed ? (
              <div className="flex items-center space-x-2 text-xs text-emerald-300 bg-emerald-950/60 p-3.5 border border-emerald-700/60">
                <CheckCircle2 size={16} />
                <span>You are warmly welcomed to the Ni'maah Gazette.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2.5">
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full bg-white/5 border border-white/20 py-3 pl-4 pr-11 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-[#C5A059] transition"
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-[#C5A059] text-[#29251F] hover:bg-[#E8D3A2] transition flex items-center justify-center font-bold"
                    title="Subscribe"
                    aria-label="Subscribe to Gazette"
                  >
                    <ArrowRight size={14} />
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 font-light">Confidentiality assured. Unsubscribe anytime.</p>
              </form>
            )}
          </div>
        </div>

        {/* 3. Bottom Bar */}
        <div className="border-t border-white/10 mt-16 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 font-light gap-4">
          <p>© {new Date().getFullYear()} NI'MAAH LUXE Atelier. All Rights Reserved. Divinely Inspired Fashion.</p>
          <div className="flex items-center space-x-6 text-[11px] tracking-wider uppercase">
            <span className="hover:text-white cursor-pointer transition">Privacy Code</span>
            <span className="hover:text-white cursor-pointer transition">Terms of Atelier</span>
            <span className="hover:text-white cursor-pointer transition">Authenticity Seal</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
