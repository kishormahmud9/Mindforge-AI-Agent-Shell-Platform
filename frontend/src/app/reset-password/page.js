'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import axiosInstance from '@/api/axios';
import { Lock, ArrowLeft, ShieldAlert, Key } from 'lucide-react';
import { motion } from 'framer-motion';

function ResetPasswordForm() {
  const [formData, setFormData] = useState({ otp: '', newPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axiosInstance.post('/auth/verify-forgot-password-otp', { email, otp: formData.otp });
      await axiosInstance.post('/auth/reset-password', { email, newPassword: formData.newPassword });
      alert('Password reset successful!');
      router.push('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-6 bg-bg relative overflow-hidden text-text font-sans">
      {/* Background Radiance */}
      <div className="absolute inset-x-0 bottom-0 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

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
            <ShieldAlert size={32} className="text-primary" />
          </motion.div>
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tighter">Reset password</h1>
          <p className="text-text-muted text-[13px] font-light leading-relaxed">
            Please enter your verification code and <br/> set a new primary password.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
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
            <label className="input-label">OTP Code</label>
            <div className="relative group">
              <Key size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                required
                className="input-field pl-12"
                value={formData.otp}
                onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                placeholder="123456"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="input-label">New Password</label>
            <div className="relative group">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" />
              <input
                type="password"
                required
                className="input-field pl-12"
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                placeholder="••••••••"
              />
            </div>
          </div>

          <button className="btn btn-primary w-full py-3.5 mt-2" type="submit" disabled={loading}>
            {loading ? <div className="loading-spinner"></div> : 'Confirm New Password'}
          </button>
        </form>

        <div className="mt-10 text-center">
          <Link href="/login" className="inline-flex items-center gap-2 text-text-muted hover:text-white text-[13px] font-medium transition-colors">
            <ArrowLeft size={14} />
            Back to login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-bg flex items-center justify-center text-white"><div className="loading-spinner"></div></div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
