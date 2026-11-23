import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Lock, AlertTriangle, ArrowRight, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logoImg from '../assets/nimaah-luxe-logo.png';

export const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { user, isAdmin, adminLogin } = useAuth();
  const navigate = useNavigate();

  // If already authenticated as Admin, navigate to Admin Dashboard
  useEffect(() => {
    if (user && isAdmin) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [user, isAdmin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Clear any previous conflicting customer tokens before authenticating as admin
      localStorage.removeItem('stylehub_token');
      localStorage.removeItem('stylehub_user');

      const res = await adminLogin(email.trim().toLowerCase(), password.trim());
      const role = (res?.data?.role || '').toLowerCase();
      if (role === 'admin' || role === 'super_admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        setError('Access Denied: Administrative authority required.');
      }
    } catch (err) {
      console.error('Admin login error:', err);
      const msg = err.message || 'Invalid administrator credentials or access denied';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0E0C09] text-[#F3EAD8] flex flex-col justify-between selection:bg-[#C5A059] selection:text-black">
      {/* Top Security Header */}
      <header className="border-b border-[#2A231A] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-full border border-[#C5A059] p-0.5 bg-black flex items-center justify-center shadow-md">
            <img src={logoImg} alt="Ni'maah Luxe" className="w-full h-full object-cover rounded-full" />
          </div>
          <div>
            <span className="font-cinzel text-sm sm:text-base tracking-[0.2em] font-bold text-[#F3EAD8] block leading-tight">
              STYLEHUB / NI'MAAH LUXE
            </span>
            <span className="text-[10px] uppercase tracking-widest text-[#C5A059] block">
              Internal Command Center
            </span>
          </div>
        </div>

        <Link
          to="/"
          className="flex items-center space-x-2 text-xs text-gray-400 hover:text-[#C5A059] transition uppercase tracking-wider"
        >
          <ArrowLeft size={13} />
          <span>Client Storefront</span>
        </Link>
      </header>

      {/* Main Authentication Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-[#16130E] border border-[#2F271E] p-8 sm:p-10 shadow-2xl relative overflow-hidden">
          {/* Subtle gold accent line at top */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#C5A059] to-transparent"></div>

          <div className="text-center space-y-2 mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#201B14] border border-[#C5A059]/40 text-[#C5A059] mb-2 shadow-inner">
              <ShieldCheck size={24} />
            </div>
            <h1 className="font-cinzel text-xl sm:text-2xl font-bold tracking-wider text-[#F3EAD8]">
              Administrative Sign In
            </h1>
            <p className="text-xs text-gray-400 tracking-wide">
              Authorized personnel gateway for store operations & inventory
            </p>
          </div>

          {/* If signed in as Customer, show clear notice */}
          {user && !isAdmin && (
            <div className="mb-6 p-3.5 bg-amber-950/40 border border-amber-800/60 rounded-xs text-xs text-amber-200 flex items-start space-x-2.5">
              <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold">Signed in as Customer ({user.email})</p>
                <p className="text-[11px] text-amber-300/80">
                  Customer accounts are not authorized to view this portal. Please log in with your administrative credentials.
                </p>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="mb-6 p-3.5 bg-red-950/60 border border-red-800/80 rounded-xs text-xs text-red-200 flex items-center space-x-2">
              <AlertTriangle size={15} className="text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            <div>
              <label className="block uppercase tracking-[0.18em] text-[10.5px] font-medium text-gray-400 mb-2">
                Administrator Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@stylehub.com"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  className="w-full px-4 py-3 bg-[#0E0C09] border border-[#2F271E] text-[#F3EAD8] focus:outline-none focus:border-[#C5A059] transition text-xs font-mono placeholder:text-gray-600"
                />
              </div>
            </div>

            <div>
              <label className="block uppercase tracking-[0.18em] text-[10.5px] font-medium text-gray-400 mb-2">
                Master Security Key / Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password (e.g. irshad1234)"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  className="w-full pl-4 pr-11 py-3 bg-[#0E0C09] border border-[#2F271E] text-[#F3EAD8] focus:outline-none focus:border-[#C5A059] transition text-xs font-mono placeholder:text-gray-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#C5A059] transition cursor-pointer p-1"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#C5A059] hover:bg-[#D4AF37] text-black uppercase tracking-[0.22em] text-xs font-bold transition flex items-center justify-center space-x-2 shadow-lg disabled:opacity-60 cursor-pointer"
            >
              <Lock size={13} />
              <span>{loading ? 'Authenticating Security Clearance...' : 'Authenticate & Enter'}</span>
              <ArrowRight size={14} />
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-8 pt-5 border-t border-[#251F18] text-center text-[10.5px] text-gray-500 space-y-1">
            <p className="flex items-center justify-center space-x-1.5">
              <ShieldCheck size={12} className="text-[#C5A059]" />
              <span>Cryptographic Session Validation Active</span>
            </p>
            <p className="text-[9.5px] text-gray-600">
              Unauthorized access attempts are monitored and logged with IP verification.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1C1711] py-4 text-center text-[11px] text-gray-600">
        StyleHub / Ni'maah Luxe Management Infrastructure • Secure Administrative Zone
      </footer>
    </div>
  );
};

export default AdminLoginPage;
