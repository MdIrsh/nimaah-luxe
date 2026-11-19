import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Layouts
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import CustomerLayout from './layouts/CustomerLayout';

// Customer Pages
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import WishlistPage from './pages/WishlistPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Customer Section
import CustomerOrders from './customer/CustomerOrders';
import CustomerProfile from './customer/CustomerProfile';

// Admin Section
import AdminDashboard from './admin/AdminDashboard';
import AdminProducts from './admin/AdminProducts';
import AdminOrders from './admin/AdminOrders';
import AdminCustomers from './admin/AdminCustomers';

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname, search } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname, search]);
  return null;
};

// Admin Guard Route with Smart Privilege Elevation
const AdminRoute = ({ children }) => {
  const { user, isAdmin, switchRole } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin && user.role !== 'admin') {
    // If the logged in user is one of the administrative owners, auto-upgrade session
    const adminEmails = [
      'sarfraj123@gmail.com',
      'mdirshad869917@gmail.com',
      'mdirshad869916@gmail.com',
      'asif1234@gmail.com',
    ];

    if (adminEmails.includes(user.email?.toLowerCase())) {
      switchRole('admin');
      return children;
    }

    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-[#E9E1D6] p-8 text-center space-y-6 shadow-md">
          <div className="w-16 h-16 rounded-full bg-[#FAF9F6] border border-[#C5A059] mx-auto flex items-center justify-center text-[#C5A059]">
            <ShieldCheck size={32} />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#C5A059] font-cinzel font-semibold">
              Security Protocol
            </span>
            <h2 className="font-serif-luxury text-2xl text-[#29251F] mt-1">Admin Privilege Verification</h2>
            <p className="text-xs text-gray-500 mt-2">
              You are currently signed in as <strong>{user.name}</strong> ({user.email}). Administrative access is required to enter the atelier command center.
            </p>
          </div>
          <div className="space-y-3 pt-2">
            <button
              onClick={() => switchRole('admin')}
              className="w-full py-3 bg-[#29251F] hover:bg-[#C5A059] text-white text-xs uppercase tracking-widest font-semibold transition shadow-xs"
            >
              Grant Admin Access
            </button>
            <Link
              to="/"
              className="block w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs uppercase tracking-widest font-semibold transition"
            >
              Back to Store
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export const App = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <ScrollToTop />
          <Routes>
            {/* Customer Website Routes wrapped in MainLayout */}
            <Route
              path="/"
              element={
                <MainLayout>
                  <HomePage />
                </MainLayout>
              }
            />
            <Route
              path="/shop"
              element={
                <MainLayout>
                  <ShopPage />
                </MainLayout>
              }
            />
            <Route
              path="/product/:id"
              element={
                <MainLayout>
                  <ProductDetailPage />
                </MainLayout>
              }
            />
            <Route
              path="/cart"
              element={
                <MainLayout>
                  <CartPage />
                </MainLayout>
              }
            />
            <Route
              path="/wishlist"
              element={
                <MainLayout>
                  <WishlistPage />
                </MainLayout>
              }
            />
            <Route
              path="/checkout"
              element={
                <MainLayout>
                  <CheckoutPage />
                </MainLayout>
              }
            />
            <Route
              path="/login"
              element={
                <MainLayout>
                  <LoginPage />
                </MainLayout>
              }
            />
            <Route
              path="/register"
              element={
                <MainLayout>
                  <RegisterPage />
                </MainLayout>
              }
            />

            {/* Customer Account Portal */}
            <Route path="/account" element={<CustomerLayout />}>
              <Route index element={<Navigate to="/account/orders" replace />} />
              <Route path="orders" element={<CustomerOrders />} />
              <Route path="profile" element={<CustomerProfile />} />
            </Route>

            {/* Admin Dashboard Routes */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="customers" element={<AdminCustomers />} />
            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
