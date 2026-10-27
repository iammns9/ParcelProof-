import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Store, Phone, MapPin, Mail, CheckCircle2, AlertCircle, Save } from 'lucide-react';

export const SellerProfile = () => {
  const { user, updateProfile } = useAuth();

  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    shopName: user?.shopName || '',
    phone: user?.phone || '',
    shopAddress: user?.shopAddress || '',
  });

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (successMessage) setSuccessMessage('');
    if (errorMessage) setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setSuccessMessage('');
      setErrorMessage('');

      const res = await updateProfile({
        fullName: formData.fullName,
        shopName: formData.shopName,
        phone: formData.phone,
        shopAddress: formData.shopAddress,
      });

      if (res.success) {
        setSuccessMessage('Seller profile details updated successfully.');
      }
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || 'Failed to update profile. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold font-heading text-brand-text">
          Seller Profile
        </h1>
        <p className="text-xs sm:text-sm text-brand-muted mt-1">
          Manage your verified store details and primary business contact information.
        </p>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-xs text-emerald-800">
          <CheckCircle2 size={16} className="text-brand-success flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-xs text-brand-red">
          <AlertCircle size={16} className="flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Form Card */}
      <div className="bg-white border border-brand-border rounded-xl shadow-card overflow-hidden">
        <div className="p-6 border-b border-brand-border bg-gray-50/50">
          <h2 className="text-sm font-bold font-heading text-brand-text uppercase tracking-wider">
            Business & Seller Identity
          </h2>
          <p className="text-xs text-brand-muted mt-0.5">
            These details appear on your packing evidence records and generated dispute summaries.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Full Name */}
            <div>
              <label
                htmlFor="fullName"
                className="block text-xs font-semibold uppercase tracking-wider text-brand-text mb-1.5"
              >
                Full Name
              </label>
              <div className="relative">
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full h-11 pl-10 pr-3.5 text-sm bg-[#F5F6F8] border border-brand-border rounded-lg text-brand-text focus:outline-none focus:border-brand-red focus:bg-white transition-standard"
                />
                <User
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none"
                />
              </div>
            </div>

            {/* Email (Read-Only) */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold uppercase tracking-wider text-brand-text mb-1.5"
              >
                Registered Email (Read-Only)
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full h-11 pl-10 pr-3.5 text-sm bg-gray-100 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed select-none"
                />
                <Mail
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Shop Name */}
            <div>
              <label
                htmlFor="shopName"
                className="block text-xs font-semibold uppercase tracking-wider text-brand-text mb-1.5"
              >
                Shop / Store Name
              </label>
              <div className="relative">
                <input
                  id="shopName"
                  name="shopName"
                  type="text"
                  required
                  value={formData.shopName}
                  onChange={handleChange}
                  className="w-full h-11 pl-10 pr-3.5 text-sm bg-[#F5F6F8] border border-brand-border rounded-lg text-brand-text focus:outline-none focus:border-brand-red focus:bg-white transition-standard"
                />
                <Store
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label
                htmlFor="phone"
                className="block text-xs font-semibold uppercase tracking-wider text-brand-text mb-1.5"
              >
                Official Phone Number
              </label>
              <div className="relative">
                <input
                  id="phone"
                  name="phone"
                  type="text"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full h-11 pl-10 pr-3.5 text-sm bg-[#F5F6F8] border border-brand-border rounded-lg text-brand-text focus:outline-none focus:border-brand-red focus:bg-white transition-standard"
                />
                <Phone
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none"
                />
              </div>
            </div>
          </div>

          {/* Shop Address */}
          <div>
            <label
              htmlFor="shopAddress"
              className="block text-xs font-semibold uppercase tracking-wider text-brand-text mb-1.5"
            >
              Shop / Warehouse Address
            </label>
            <div className="relative">
              <textarea
                id="shopAddress"
                name="shopAddress"
                rows={3}
                value={formData.shopAddress}
                onChange={handleChange}
                placeholder="Warehouse or shop physical address in Pakistan"
                className="w-full p-3.5 pl-10 text-sm bg-[#F5F6F8] border border-brand-border rounded-lg text-brand-text focus:outline-none focus:border-brand-red focus:bg-white transition-standard"
              />
              <MapPin
                size={16}
                className="absolute left-3.5 top-4 text-brand-muted pointer-events-none"
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 h-11 bg-brand-red hover:bg-brand-red-hover text-white text-xs sm:text-sm font-semibold rounded-lg flex items-center gap-2 shadow-sm transition-standard disabled:opacity-60"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save size={16} />
                  <span>Save Profile Updates</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SellerProfile;
