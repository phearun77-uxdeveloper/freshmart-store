import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { X, User, Lock, Mail, Phone, MapPin, Sparkles, ShieldCheck } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, login, register, quickDemoLogin } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>('login');

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (tab === 'login') {
        await login(email, password);
      } else {
        await register({ name, email, password, phone, address });
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoClick = async (role: 'admin' | 'customer') => {
    setError(null);
    setIsSubmitting(true);
    try {
      await quickDemoLogin(role);
    } catch (err: any) {
      setError(err.message || 'Demo sign in failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity" onClick={closeAuthModal} />

      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 z-10 border border-slate-200">
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xl mb-3">
            FM
          </div>
          <h3 className="text-lg font-bold text-slate-900 font-display">
            {tab === 'login' ? 'Welcome back to FreshMart' : 'Create your FreshMart Account'}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {tab === 'login'
              ? 'Sign in to access your saved basket and order tracking'
              : 'Sign up for farm-fresh grocery delivery right to your door'}
          </p>
        </div>

        {/* 1-Click Fast Demo Login Strip */}
        <div className="mb-6 p-3 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-2">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              1-Click Instant Demo Login:
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemoClick('customer')}
              disabled={isSubmitting}
              className="py-1.5 px-3 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 flex items-center justify-center gap-1.5 shadow-xs transition-colors"
            >
              <User className="w-3.5 h-3.5 text-emerald-600" />
              <span>Demo Customer</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoClick('admin')}
              disabled={isSubmitting}
              className="py-1.5 px-3 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 flex items-center justify-center gap-1.5 shadow-xs transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              <span>Demo Admin</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 mb-5">
          <button
            type="button"
            onClick={() => { setTab('login'); setError(null); }}
            className={`flex-1 py-2 text-xs font-bold transition-colors border-b-2 ${
              tab === 'login'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setTab('register'); setError(null); }}
            className={`flex-1 py-2 text-xs font-bold transition-colors border-b-2 ${
              tab === 'register'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Register
          </button>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {tab === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Jane Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-900 focus:outline-emerald-600"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-900 focus:outline-emerald-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-900 focus:outline-emerald-600"
              />
            </div>
          </div>

          {tab === 'register' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone (Optional)</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-900 focus:outline-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Delivery Address (Optional)</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Street, City, Zip"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-900 focus:outline-emerald-600"
                  />
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors disabled:opacity-50"
          >
            {isSubmitting
              ? 'Processing...'
              : tab === 'login'
              ? 'Sign In to Account'
              : 'Complete Registration'}
          </button>
        </form>
      </div>
    </div>
  );
};
