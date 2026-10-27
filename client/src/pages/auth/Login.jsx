import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, ShieldCheck, CheckCircle2, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ParcelProofLogo from '../../assets/logo/ParcelProofLogo';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Check if session expired query param is present
  const isExpired = new URLSearchParams(location.search).get('expired');

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errorMessage) setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage('');
      const res = await login({
        email: formData.email,
        password: formData.password,
      });

      if (res.success) {
        navigate('/dashboard');
      }
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || 'Invalid credentials. Please verify your email and password.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#F5F6F8]">
      {/* Left Brand Panel (Split Screen) */}
      <div className="hidden lg:flex lg:w-1/2 bg-brand-sidebar text-white p-12 flex-col justify-between relative overflow-hidden border-r border-[#262A33]">
        {/* Subtle geometric background pattern */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-red/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-brand-red/5 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="relative z-10">
          <ParcelProofLogo variant="light" size="lg" />
          <p className="text-gray-400 text-sm mt-3 max-w-sm">
            Pakistan's courier dispute evidence repository for online sellers and e-commerce enterprises.
          </p>
        </div>

        {/* Geometric Illustration & Feature Pillars */}
        <div className="relative z-10 my-8">
          <div className="p-8 rounded-2xl bg-[#1C1F26] border border-[#2B303C] space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-red/20 text-brand-red flex items-center justify-center">
                <ShieldCheck size={22} />
              </div>
              <div>
                <h3 className="font-heading font-bold text-sm text-white">
                  Cryptographic Packing Evidence
                </h3>
                <p className="text-xs text-gray-400">
                  Every photo, video, and label receives an immutable SHA-256 fingerprint.
                </p>
              </div>
            </div>

            <div className="h-px bg-[#262B35]" />

            <div className="space-y-3.5">
              <div className="flex items-start gap-2.5 text-xs text-gray-300">
                <CheckCircle2 size={16} className="text-brand-success mt-0.5 flex-shrink-0" />
                <span>Maintain indisputable dispatch proof against courier shortage claims.</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-gray-300">
                <CheckCircle2 size={16} className="text-brand-success mt-0.5 flex-shrink-0" />
                <span>Built for Pakistani couriers: TCS, Leopards, M&P, and Pakistan Post.</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-gray-300">
                <CheckCircle2 size={16} className="text-brand-success mt-0.5 flex-shrink-0" />
                <span>Auditable shipment status history and verified file integrity checks.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Brand Footer */}
        <div className="relative z-10 flex items-center justify-between text-xs text-gray-400 pt-6 border-t border-[#262A33]">
          <span>ParcelProof System</span>
          <span>Secure Enterprise Access</span>
        </div>
      </div>

      {/* Right Login Form Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-2xl border border-brand-border shadow-card">
          {/* Mobile Logo View */}
          <div className="lg:hidden mb-8 text-center">
            <ParcelProofLogo variant="dark" size="md" className="justify-center" />
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold font-heading text-brand-text">
              Seller Sign In
            </h2>
            <p className="text-xs sm:text-sm text-brand-muted mt-1">
              Enter your seller credentials to access your dispatch and evidence library.
            </p>
          </div>

          {/* Session Expired Notice */}
          {isExpired && (
            <div className="mb-5 p-3.5 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2.5 text-xs text-amber-800">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>Your session has expired. Please sign in again to continue.</span>
            </div>
          )}

          {/* Error Alert */}
          {errorMessage && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5 text-xs text-brand-red">
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold uppercase tracking-wider text-brand-text mb-1.5"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="seller@example.com"
                className="w-full h-11 px-3.5 text-sm bg-[#F5F6F8] border border-brand-border rounded-lg text-brand-text placeholder-brand-muted focus:outline-none focus:border-brand-red focus:bg-white transition-standard"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold uppercase tracking-wider text-brand-text"
                >
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full h-11 pl-3.5 pr-11 text-sm bg-[#F5F6F8] border border-brand-border rounded-lg text-brand-text placeholder-brand-muted focus:outline-none focus:border-brand-red focus:bg-white transition-standard"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-text p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 mt-2 bg-brand-red hover:bg-brand-red-hover text-white font-semibold text-sm rounded-lg flex items-center justify-center gap-2 shadow-sm transition-standard disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Assistant */}
          <div className="mt-4 p-3 bg-[#F5F6F8] border border-brand-border rounded-lg flex items-center justify-between text-xs text-brand-muted">
            <div className="truncate mr-2">
              <span className="font-semibold text-brand-text">Demo Account:</span>{' '}
              <span className="text-brand-text">seller@parcelproof.pk</span> / <span>Password123!</span>
            </div>
            <button
              type="button"
              onClick={() => setFormData({ email: 'seller@parcelproof.pk', password: 'Password123!' })}
              className="text-brand-red font-semibold hover:underline text-xs flex-shrink-0"
            >
              Autofill
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-brand-border text-center">
            <p className="text-xs text-brand-muted">
              Don't have a seller account yet?{' '}
              <Link
                to="/register"
                className="font-semibold text-brand-red hover:underline ml-1"
              >
                Register New Seller Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
