import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ShieldCheck, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ParcelProofLogo from '../../assets/logo/ParcelProofLogo';

export const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    shopName: '',
    phone: '',
    shopAddress: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errorMessage) setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.fullName ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword ||
      !formData.shopName ||
      !formData.phone
    ) {
      setErrorMessage('Please fill in all mandatory fields.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify your confirmation password.');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage('Password must contain at least 6 characters.');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage('');

      const res = await register({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        shopName: formData.shopName,
        phone: formData.phone,
        shopAddress: formData.shopAddress,
      });

      if (res.success) {
        navigate('/dashboard');
      }
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || 'Registration failed. Please check your information and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F5F6F8] p-4 sm:p-8">
      <div className="w-full max-w-xl bg-white p-8 sm:p-10 rounded-2xl border border-brand-border shadow-card my-8">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <ParcelProofLogo variant="dark" size="md" className="justify-center mb-4" />
          <h2 className="text-2xl font-bold font-heading text-brand-text">
            Register Seller Account
          </h2>
          <p className="text-xs sm:text-sm text-brand-muted mt-1 max-w-md mx-auto">
            Create your ParcelProof portal to protect shipments, catalog dispatch media, and verify courier deliveries.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-3.5 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5 text-xs text-brand-red">
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="fullName"
                className="block text-xs font-semibold uppercase tracking-wider text-brand-text mb-1.5"
              >
                Full Name *
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Muhammad Tariq"
                className="w-full h-11 px-3.5 text-sm bg-[#F5F6F8] border border-brand-border rounded-lg text-brand-text placeholder-brand-muted focus:outline-none focus:border-brand-red focus:bg-white transition-standard"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold uppercase tracking-wider text-brand-text mb-1.5"
              >
                Email Address *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="tariq@shop.pk"
                className="w-full h-11 px-3.5 text-sm bg-[#F5F6F8] border border-brand-border rounded-lg text-brand-text placeholder-brand-muted focus:outline-none focus:border-brand-red focus:bg-white transition-standard"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="shopName"
                className="block text-xs font-semibold uppercase tracking-wider text-brand-text mb-1.5"
              >
                Shop / Brand Name *
              </label>
              <input
                id="shopName"
                name="shopName"
                type="text"
                required
                value={formData.shopName}
                onChange={handleChange}
                placeholder="Karachi Tech Hub"
                className="w-full h-11 px-3.5 text-sm bg-[#F5F6F8] border border-brand-border rounded-lg text-brand-text placeholder-brand-muted focus:outline-none focus:border-brand-red focus:bg-white transition-standard"
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-xs font-semibold uppercase tracking-wider text-brand-text mb-1.5"
              >
                Phone Number *
              </label>
              <input
                id="phone"
                name="phone"
                type="text"
                required
                value={formData.phone}
                onChange={handleChange}
                placeholder="0300-1234567"
                className="w-full h-11 px-3.5 text-sm bg-[#F5F6F8] border border-brand-border rounded-lg text-brand-text placeholder-brand-muted focus:outline-none focus:border-brand-red focus:bg-white transition-standard"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="shopAddress"
              className="block text-xs font-semibold uppercase tracking-wider text-brand-text mb-1.5"
            >
              Shop / Warehouse Address (Optional)
            </label>
            <input
              id="shopAddress"
              name="shopAddress"
              type="text"
              value={formData.shopAddress}
              onChange={handleChange}
              placeholder="Shop #14, Saddar Commercial Area, Karachi"
              className="w-full h-11 px-3.5 text-sm bg-[#F5F6F8] border border-brand-border rounded-lg text-brand-text placeholder-brand-muted focus:outline-none focus:border-brand-red focus:bg-white transition-standard"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold uppercase tracking-wider text-brand-text mb-1.5"
              >
                Password *
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min. 6 characters"
                  className="w-full h-11 pl-3.5 pr-10 text-sm bg-[#F5F6F8] border border-brand-border rounded-lg text-brand-text placeholder-brand-muted focus:outline-none focus:border-brand-red focus:bg-white transition-standard"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-text p-1"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-semibold uppercase tracking-wider text-brand-text mb-1.5"
              >
                Confirm Password *
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter password"
                  className="w-full h-11 pl-3.5 pr-10 text-sm bg-[#F5F6F8] border border-brand-border rounded-lg text-brand-text placeholder-brand-muted focus:outline-none focus:border-brand-red focus:bg-white transition-standard"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-text p-1"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 mt-4 bg-brand-red hover:bg-brand-red-hover text-white font-semibold text-sm rounded-lg flex items-center justify-center gap-2 shadow-sm transition-standard disabled:opacity-60"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Complete Seller Registration</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-brand-border text-center">
          <p className="text-xs text-brand-muted">
            Already have a registered account?{' '}
            <Link
              to="/login"
              className="font-semibold text-brand-red hover:underline ml-1"
            >
              Sign In Instead
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
