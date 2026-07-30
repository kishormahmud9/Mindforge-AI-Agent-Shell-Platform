'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/api/axios';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axiosInstance.post('/auth/forgot-password', { email });
      router.push(`/reset-password?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-6 bg-bg relative overflow-hidden text-text font-sans">
      {/* Background Radiance */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

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
            <Mail size={32} className="text-primary" />
          </motion.div>
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tighter">Forgot password</h1>
          <p className="text-text-muted text-sm font-light leading-relaxed">
            Enter your email address and we'll send you an OTP to reset your password.
          </p>
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
              />
            </div>
          </div>

          <button className="btn btn-primary w-full group py-3.5" type="submit" disabled={loading}>
            {loading ? <div className="loading-spinner"></div> : (
              <>
                Send OTP
                <Send size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </>
            )}
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
