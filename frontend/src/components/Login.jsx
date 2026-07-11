import React, { useState } from 'react';
import { User, Lock, Mail, ArrowRight, Loader2, KeyRound, Eye, EyeOff } from 'lucide-react';

export default function Login({ onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'customer' // customer or admin
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!formData.email.trim() || !formData.password.trim()) {
      setError('Please fill in all credentials.');
      return;
    }

    if (isRegister && !formData.username.trim()) {
      setError('Please enter your full name.');
      return;
    }

    setLoading(true);

    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      const body = isRegister 
        ? formData 
        : { email: formData.email, password: formData.password };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed. Please verify credentials.');
      }

      setLoading(false);
      
      if (isRegister) {
        setSuccessMsg('Account created successfully! Auto logging in...');
        setTimeout(() => {
          onLoginSuccess(data.token, data.user);
        }, 1200);
      } else {
        onLoginSuccess(data.token, data.user);
      }

    } catch (err) {
      setLoading(false);
      setError(err.message || 'An error occurred during verification.');
    }
  };

  return (
    <div id="auth-section-wrapper" className="max-w-md mx-auto my-10">
      <div className="bg-white rounded-3xl border border-stone-100 p-8 shadow-xs space-y-6">
        
        {/* Header Title */}
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl text-emerald-600 flex items-center justify-center mx-auto mb-3 border border-emerald-100/30">
            <KeyRound className="h-5 w-5" />
          </div>
          <h2 className="text-xl font-extrabold font-display text-stone-800">
            {isRegister ? 'Create Market Account' : 'Welcome to Namma Market'}
          </h2>
          <p className="text-xs text-stone-500">
            {isRegister ? 'Join us to place orders and track deliveries' : 'Log in to checkout, track orders & view seller dashboard'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {isRegister && (
            <div>
              <label className="block text-xs font-bold font-mono text-stone-500 uppercase mb-1 tracking-wider">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-stone-400">
                  <User className="h-4 w-4" />
                </span>
                <input
                  id="auth-username"
                  type="text"
                  name="username"
                  required
                  placeholder="Enter full name"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 transition-all"
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold font-mono text-stone-500 uppercase mb-1 tracking-wider">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-stone-400">
                <Mail className="h-4 w-4" />
              </span>
              <input
                id="auth-email"
                type="email"
                name="email"
                required
                placeholder="name@email.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 transition-all"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold font-mono text-stone-500 uppercase mb-1 tracking-wider">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-stone-400">
                <Lock className="h-4 w-4" />
              </span>
              <input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 transition-all"
                value={formData.password}
                onChange={handleChange}
              />
              <button
                id="auth-password-toggle"
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Tester Role Selection Dropdown */}
          {isRegister && (
            <div className="bg-stone-50 border border-stone-100 rounded-2xl p-4">
              <label className="block text-[10px] font-bold font-mono text-stone-500 uppercase mb-1.5 tracking-wider">
                Account Type (Toggle to view Admin Dashboard)
              </label>
              <select
                id="auth-role"
                name="role"
                className="w-full bg-white border border-stone-200 text-xs rounded-xl p-2 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 cursor-pointer"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="customer">🛒 Customer (Order & Track)</option>
                <option value="admin">🏢 Seller / Admin (Inventory Management & Order Dashboard)</option>
              </select>
            </div>
          )}

          {error && (
            <p className="text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-2xl p-3 text-center font-bold">
              {error}
            </p>
          )}

          {successMsg && (
            <p className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-2xl p-3 text-center font-bold animate-pulse">
              {successMsg}
            </p>
          )}

          {/* Submit */}
          <button
            id="auth-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-emerald-600/10"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                {isRegister ? 'Create Account' : 'Sign In'}
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Toggle links */}
        <div className="text-center pt-2">
          <button
            id="auth-switch-view-btn"
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
              setSuccessMsg('');
            }}
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer"
          >
            {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Create one"}
          </button>
        </div>

      </div>
    </div>
  );
}
