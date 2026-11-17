import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = authService.getCurrentUser();
    const token = localStorage.getItem('stylehub_token');

    // Only restore real authenticated sessions (ignore old dummy demo_user_1)
    if (savedUser && token && !token.startsWith('demo-token-') && savedUser._id !== 'demo_user_1') {
      setUser(savedUser);
    } else {
      authService.logout();
      setUser(null);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await authService.login({ email, password });
      setUser(response.data);
      return response;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        'Cannot connect to backend server. Make sure backend is running on port 5000 and connected to MongoDB.';
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, role = 'customer') => {
    setLoading(true);
    try {
      const response = await authService.register({ name, email, password, role });
      setUser(response.data);
      return response;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        'Cannot connect to backend server. Make sure backend is running on port 5000 and connected to MongoDB.';
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const switchRole = (newRole) => {
    if (!user) return;
    const updated = { ...user, role: newRole };
    setUser(updated);
    localStorage.setItem('stylehub_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        loading,
        login,
        register,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
