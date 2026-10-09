'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/authContext';
import {
  ShieldCheck,
  Mail,
  Lock,
  User,
  ArrowRight,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2,
} from 'lucide-react';
import { Logo } from '@/components/Logo';

export function AdminAuthCard() {
  const { signIn, signUp } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    if (mode === 'signup') {
      if (!name.trim()) {
        setErrorMsg('Please provide your name or business name.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match.');
        return;
      }
      if (password.length < 6) {
        setErrorMsg('Password must be at least 6 characters.');
        return;
      }
    }

    setIsSubmitting(true);

    if (mode === 'signin') {
      const res = await signIn(email, password);
      if (!res.success) {
        setErrorMsg(res.error || 'Authentication failed. Please check your credentials.');
      }
    } else {
      const res = await signUp(email, password, name);
      if (!res.success) {
        setErrorMsg(res.error || 'Registration failed.');
      } else {
        setSuccessMsg('Account registered successfully! Logging you in...');
      }
    }

    setIsSubmitting(false);
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-8">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl transition-all">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 sm:p-8 text-white relative">
          <div className="flex items-center justify-between">
            <Logo size="lg" showWordmark={false} />
            <span className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-emerald-400 backdrop-blur-md border border-white/10">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Charger Management</span>
            </span>
          </div>

          <div className="mt-4">
            <h2 className="text-xl font-black tracking-tight text-white sm:text-2xl">
              {mode === 'signin' ? 'Sign In' : 'Create Account'}
            </h2>
            <p className="mt-1 text-xs text-slate-300 leading-relaxed">
              Sign in to manage your charging stations, update pricing, or drop new location pins.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-100 bg-slate-50/80 p-1.5 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorMsg(null);
            }}
            className={`flex-1 rounded-xl py-2 transition-all ${
              mode === 'signin'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMsg(null);
            }}
            className={`flex-1 rounded-xl py-2 transition-all ${
              mode === 'signup'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">
          {/* Error Alert */}
          {errorMsg && (
            <div className="flex items-start gap-2.5 rounded-2xl bg-rose-50 p-3.5 text-xs font-medium text-rose-800 border border-rose-200 animate-in fade-in">
              <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success Alert */}
          {successMsg && (
            <div className="flex items-center gap-2.5 rounded-2xl bg-emerald-50 p-3.5 text-xs font-semibold text-emerald-800 border border-emerald-200 animate-in fade-in">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Name Field (Sign Up Only) */}
          {mode === 'signup' && (
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700">
                Full Name or Operator / Business Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Radisson Blu Kigali or Jean Paul"
                  className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
                <User className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              </div>
            </div>
          )}

          {/* Email Field */}
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-700">
              Email Address *
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
              <Mail className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">Password *</label>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-xs font-medium text-slate-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
              <Lock className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-600 p-0.5"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password (Sign Up Only) */}
          {mode === 'signup' && (
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700">
                Confirm Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
                <Lock className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-600 py-3 text-xs font-bold text-white shadow-lg shadow-brand-600/30 hover:bg-brand-700 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <span>{mode === 'signin' ? 'Sign In' : 'Create My Account'}</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
