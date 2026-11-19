import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
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
      const role = (res?.data?.role || '').toLowerCase();
      if (role === 'admin' || role === 'super_admin') {
        navigate('/admin');
      } else {
        const redirect = new URLSearchParams(window.location.search).get('redirect') || '/';
        navigate(redirect.startsWith('/admin') ? '/' : redirect);
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8 sm:py-16">
      <div className="bg-white border border-[#E9E1D6] p-6 sm:p-8 shadow-sm space-y-6">
        <div className="text-center space-y-1">
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#C5A059] font-cinzel font-semibold">
            Ni'maah Luxe Sanctuary
          </span>
          <h1 className="font-serif-luxury text-3xl text-[#29251F]">Patron Sign In</h1>
          <p className="text-xs text-gray-500">Sign in to manage your wardrobe, wishlist, and orders</p>
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
              placeholder="Enter your registered email"
              className="w-full p-3 bg-[#FAF9F6] border border-[#E9E1D6] focus:outline-none focus:border-[#C5A059]"
            />
          </div>

          <div>
            <label className="block uppercase tracking-wider text-gray-500 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full p-3 bg-[#FAF9F6] border border-[#E9E1D6] focus:outline-none focus:border-[#C5A059]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#29251F] hover:bg-[#C5A059] text-white uppercase tracking-[0.2em] font-semibold transition flex items-center justify-center space-x-2 shadow-sm disabled:opacity-60"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight size={14} />
          </button>
        </form>

        <div className="text-center text-xs text-gray-500 pt-2 border-t border-[#FAF9F6]">
          New to Ni'maah Luxe?{' '}
          <Link to="/register" className="text-[#A68B66] font-semibold hover:underline">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
