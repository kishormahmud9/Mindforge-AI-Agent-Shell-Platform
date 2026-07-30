'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import axiosInstance from '@/api/axios';
import { Key, ArrowLeft, ShieldCheck, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

function OtpForm() {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Email missing. Please register again.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await axiosInstance.post('/otp/verify', { email, otp });
      router.push('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    if (!email || resending) return;
    setResending(true);
    try {
      await axiosInstance.post('/otp/send', { email });
      // Toast or simple notification could go here
    } catch (err) {
      setError('Resend failed. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-6 bg-bg relative overflow-hidden text-text">
       {/* Background Radiance */}
       <div className="absolute inset-0 bg-primary/5 rounded-full blur-[160px] animate-pulse pointer-events-none" />

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
            <ShieldCheck size={32} className="text-primary" />
          </motion.div>
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tighter">Verify email</h1>
          <p className="text-text-muted text-[13px] font-light leading-relaxed">
            We've sent a 6-digit code to <br/>
            <span className="text-white font-medium">{email || 'your email'}</span>
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
          
          <div className="space-y-4 text-center">
            <label className="input-label">OTP Code</label>
            <div className="relative group">
              <Key size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                required
                maxLength="6"
                className="input-field pl-12 text-center text-2xl tracking-[0.5rem] font-bold py-4 focus:border-primary/40"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
              />
            </div>
          </div>

          <button className="btn btn-primary w-full py-3.5" type="submit" disabled={loading || otp.length < 6}>
            {loading ? <div className="loading-spinner"></div> : 'Verify Code'}
          </button>
        </form>

        <div className="mt-10 flex flex-col items-center gap-4">
          <button 
            onClick={resendOtp}
            disabled={resending}
            className="text-[13px] font-medium text-primary hover:text-primary-hover transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw size={14} className={resending ? 'animate-spin' : ''} />
            {resending ? 'Resending...' : "Didn't receive code? Resend"}
          </button>
          <Link href="/register" className="inline-flex items-center gap-2 text-text-muted hover:text-white text-[13px] font-medium transition-colors">
            <ArrowLeft size={14} />
            Back to registration
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function OtpVerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-bg flex items-center justify-center text-white font-sans">
      <div className="loading-spinner w-8 h-8"></div>
    </div>}>
      <OtpForm />
    </Suspense>
  );
}
