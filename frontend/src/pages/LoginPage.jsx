import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login(email, password);
      if (res?.data?.role === 'admin' || email.includes('admin')) {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError('Invalid credentials or authentication error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (role) => {
    if (role === 'admin') {
      setEmail('admin@stylehub.com');
      setPassword('admin123');
      login('admin@stylehub.com', 'admin123').then(() => navigate('/admin'));
    } else {
      setEmail('customer@stylehub.com');
      setPassword('customer123');
      login('customer@stylehub.com', 'customer123').then(() => navigate('/'));
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white border border-[#E9E1D6] p-8 shadow-sm space-y-6">
        <div className="text-center space-y-1">
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#A68B66] font-semibold">
            StyleHub Sanctuary
          </span>
          <h1 className="font-serif-luxury text-3xl text-[#29251F]">Patron Access</h1>
          <p className="text-xs text-gray-500">Sign in to manage your wardrobe, private wishlist, and orders</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block uppercase tracking-wider text-gray-500 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. patron@stylehub.com"
              className="w-full p-3 bg-[#FAF9F6] border border-[#E9E1D6] focus:outline-none focus:border-[#A68B66]"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="uppercase tracking-wider text-gray-500">Password</label>
              <a href="#forgot" className="text-[10px] text-[#A68B66] hover:underline uppercase">
                Forgot?
              </a>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full p-3 bg-[#FAF9F6] border border-[#E9E1D6] focus:outline-none focus:border-[#A68B66]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#29251F] hover:bg-[#A68B66] text-white uppercase tracking-[0.2em] font-semibold transition flex items-center justify-center space-x-2 shadow-sm"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight size={14} />
          </button>
        </form>

        {/* 1-Click Fast Preview Buttons */}
        <div className="border-t border-[#E9E1D6] pt-4 space-y-2">
          <p className="text-[10px] uppercase tracking-widest text-gray-400 text-center">
            Instant Demo Sign-in
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('customer')}
              className="py-2 bg-[#FAF9F6] border border-[#E9E1D6] hover:border-[#A68B66] text-[11px] font-semibold text-[#29251F] uppercase tracking-wider transition"
            >
              Demo Client
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin')}
              className="py-2 bg-[#FAF9F6] border border-[#E9E1D6] hover:border-[#A68B66] text-[11px] font-semibold text-[#A68B66] uppercase tracking-wider transition"
            >
              Demo Admin
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-gray-500 pt-2">
          New to StyleHub?{' '}
          <Link to="/register" className="text-[#A68B66] font-semibold hover:underline">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
