import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = authService.getCurrentUser();
    if (savedUser) {
      setUser(savedUser);
    } else {
      // Provide initial demo customer session
      const demoUser = {
        _id: 'demo_user_1',
        name: 'Aisha Al-Mansoor',
        email: 'customer@nimaahluxe.com',
        role: 'customer',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        addresses: [
          {
            fullName: 'Aisha Al-Mansoor',
            phone: '+91 8618621612',
            street: '14 Royal Crescent, Boat Club Road',
            city: 'Chennai',
            state: 'Tamil Nadu',
            postalCode: '600028',
            country: 'India',
            isDefault: true,
          },
        ],
      };
      setUser(demoUser);
      localStorage.setItem('stylehub_user', JSON.stringify(demoUser));
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
      // Demo fallback login
      const role = email.includes('admin') ? 'admin' : 'customer';
      const fallback = {
        _id: 'user_' + Date.now(),
        name: role === 'admin' ? 'Store Administrator' : 'Fashion Customer',
        email,
        role,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      };
      setUser(fallback);
      localStorage.setItem('stylehub_user', JSON.stringify(fallback));
      localStorage.setItem('stylehub_token', 'demo-token-' + Date.now());
      return { success: true, data: fallback };
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
      const fallback = {
        _id: 'user_' + Date.now(),
        name,
        email,
        role,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      };
      setUser(fallback);
      localStorage.setItem('stylehub_user', JSON.stringify(fallback));
      localStorage.setItem('stylehub_token', 'demo-token-' + Date.now());
      return { success: true, data: fallback };
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
