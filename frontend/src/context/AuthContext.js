'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getToken, getRole, clearAuth, setToken, setRefreshToken, setRole } from '../utils/cookie';
import axiosInstance from '../api/axios';
import { useRouter, usePathname } from 'next/navigation';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const checkAuth = async () => {
    const token = getToken();
    if (token) {
      try {
        const response = await axiosInstance.get('/user/profile/me');
        setUser(response.data);
        setIsAuthenticated(true);
      } catch (error) {
        clearAuth();
        setUser(null);
        setIsAuthenticated(false);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // Simple route guarding
  useEffect(() => {
    if (!loading) {
      const publicPaths = ['/login', '/register', '/otp-verify', '/forgot-password', '/reset-password'];
      const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

      if (!isAuthenticated && !isPublicPath) {
        router.push('/login');
      } else if (isAuthenticated && isPublicPath) {
        router.push('/dashboard');
      } else if (isAuthenticated && pathname.startsWith('/admin') && user?.role !== 'admin') {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, loading, pathname, user, router]);

  const login = (userData, token, refreshToken) => {
    setUser(userData);
    setToken(token);
    setRefreshToken(refreshToken);
    setRole(userData.role);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      await axiosInstance.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuth();
      setUser(null);
      setIsAuthenticated(false);
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
