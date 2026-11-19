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
import TrackOrderPage from './pages/TrackOrderPage';

// Customer Section
import CustomerOrders from './customer/CustomerOrders';
import CustomerProfile from './customer/CustomerProfile';

// Admin Section
import AdminDashboard from './admin/AdminDashboard';
import AdminProducts from './admin/AdminProducts';
import AdminOrders from './admin/AdminOrders';
import AdminCustomers from './admin/AdminCustomers';
import AdminReviews from './admin/AdminReviews';

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname, search } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname, search]);
  return null;
};

// Strict Admin Route Guard: Only ADMIN or SUPER_ADMIN can enter. Customers & guests are blocked.
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#14110C] flex items-center justify-center text-[#E8DCC9]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-[#C5A059] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="font-cinzel text-xs tracking-widest text-[#C5A059]">Verifying Security Access...</p>
        </div>
      </div>
    );
  }

  // Not signed in -> redirect to login with intent
  if (!user) {
    return <Navigate to="/login?redirect=/admin" replace />;
  }

  const role = (user.role || '').toLowerCase();
  // If Customer tries to access Admin Panel -> strictly redirect to Customer Website
  if (role !== 'admin' && role !== 'super_admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Customer Protected Route Guard: Requires authentication for account features
const CustomerRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#C5A059] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login?redirect=/account" replace />;
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
            <Route
              path="/track-order"
              element={
                <MainLayout>
                  <TrackOrderPage />
                </MainLayout>
              }
            />
            <Route
              path="/track-order/:orderId"
              element={
                <MainLayout>
                  <TrackOrderPage />
                </MainLayout>
              }
            />

            {/* Customer Account Portal */}
            <Route
              path="/account"
              element={
                <CustomerRoute>
                  <CustomerLayout />
                </CustomerRoute>
              }
            >
              <Route index element={<Navigate to="/account/orders" replace />} />
              <Route path="orders" element={<CustomerOrders />} />
              <Route path="orders/:orderId/track" element={<TrackOrderPage />} />
              <Route path="track" element={<TrackOrderPage />} />
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
              <Route path="reviews" element={<AdminReviews />} />
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
