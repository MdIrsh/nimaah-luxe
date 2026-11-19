import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * Verify session cryptographically against the backend database.
   * Derives user role strictly from the verified server token,
   * completely ignoring any unverified or tampered frontend localStorage data.
   */
  const verifySession = useCallback(async () => {
    const token = localStorage.getItem('stylehub_token');

    if (!token || token.startsWith('demo-token-')) {
      authService.logout();
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await api.get('/auth/profile');
      if (response.data && response.data.success && response.data.data) {
        const verifiedUser = response.data.data;
        setUser(verifiedUser);
        localStorage.setItem('stylehub_user', JSON.stringify(verifiedUser));
      } else {
        authService.logout();
        setUser(null);
      }
    } catch (error) {
      // Token is invalid, expired, or user was deleted/modified
      authService.logout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    verifySession();
  }, [verifySession]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await authService.login({ email, password });
      if (response && response.data) {
        setUser(response.data);
      }
      return response;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        'Cannot connect to authentication server. Please check your credentials or network connection.';
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      // Security: Registration strictly assigns 'customer' role on backend
      const response = await authService.register({ name, email, password });
      if (response && response.data) {
        setUser(response.data);
      }
      return response;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        'Cannot complete registration. Please check your details or network connection.';
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const role = (user?.role || '').toLowerCase();
  const isAdmin = role === 'admin' || role === 'super_admin';
  const isSuperAdmin = role === 'super_admin';
  const isCustomer = role === 'customer';

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        role: user ? role : 'guest',
        isCustomer,
        isAdmin,
        isSuperAdmin,
        loading,
        login,
        register,
        logout,
        refreshSession: verifySession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
