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

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname, search } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname, search]);
  return null;
};

// Admin Route: Direct immediate access for store administrator
const AdminRoute = ({ children }) => {
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
            <Route path="/account" element={<CustomerLayout />}>
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
