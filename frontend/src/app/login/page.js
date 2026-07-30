'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/api/axios';
import { Shield, User, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await axiosInstance.post('/auth/login', formData);
      const { user, accessToken, refreshToken } = response.data;
      login(user, accessToken, refreshToken);
      router.push('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-6 bg-bg relative overflow-hidden">
      {/* Background Radiance */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="glass-card w-full max-w-[420px] p-10 md:p-12 relative z-10"
      >
        <div className="text-center mb-10">
          <motion.div 
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-primary/20"
          >
            <Shield size={32} className="text-primary" />
          </motion.div>
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tighter">Welcome back</h1>
          <p className="text-text-muted text-sm font-light uppercase tracking-widest opacity-60">Jaysea Intelligence</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-3.5 rounded-xl bg-red-500/5 border border-red-500/10 text-red-500 text-center text-[13px] font-medium"
            >
              {error}
            </motion.div>
          )}
          
          <div className="space-y-1.5">
            <label className="input-label">Email Address</label>
            <div className="relative group">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" />
              <input
                type="email"
                required
                className="input-field pl-12"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="name@company.com"
              />
            </div>
          </div>
          
          <div className="space-y-1.5">
            <label className="input-label">Password</label>
            <div className="relative group">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" />
              <input
                type="password"
                required
                className="input-field pl-12"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Link href="/forgot-password" size="sm" className="text-primary hover:text-primary-hover text-[13px] font-medium transition-colors tracking-tight">
              Forgot password?
            </Link>
          </div>

          <button className="btn btn-primary w-full group py-3.5" type="submit" disabled={loading}>
            {loading ? <div className="loading-spinner"></div> : (
              <>
                Sign In
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <p className="mt-10 text-center text-text-muted text-[13px] font-light">
          New here?{' '}
          <Link href="/register" className="text-primary hover:text-primary-hover font-semibold transition-colors">
            Create an account
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
