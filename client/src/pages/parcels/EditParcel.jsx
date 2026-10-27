import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle, Package, Truck, User } from 'lucide-react';
import parcelService from '../../services/parcelService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export const EditParcel = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    parcelCode: '',
    orderId: '',
    productName: '',
    quantity: 1,
    declaredValue: '',
    customerName: '',
    customerPhone: '',
    shippingAddress: '',
    courierCompany: 'TCS',
    trackingNumber: '',
    dispatchDate: '',
    notes: '',
  });

  useEffect(() => {
    const fetchParcel = async () => {
      try {
        setLoading(true);
        const res = await parcelService.getParcelById(id);
        if (res.success && res.parcel) {
          const p = res.parcel;
          setFormData({
            parcelCode: p.parcelCode || '',
            orderId: p.orderId || '',
            productName: p.productName || '',
            quantity: p.quantity || 1,
            declaredValue: p.declaredValue || '',
            customerName: p.customerName || '',
            customerPhone: p.customerPhone || '',
            shippingAddress: p.shippingAddress || '',
            courierCompany: p.courierCompany || 'TCS',
            trackingNumber: p.trackingNumber || '',
            dispatchDate: p.dispatchDate
              ? new Date(p.dispatchDate).toISOString().split('T')[0]
              : '',
            notes: p.notes || '',
          });
        }
      } catch (err) {
        setErrorMessage('Failed to load parcel data.');
      } finally {
        setLoading(false);
      }
    };

    fetchParcel();
  }, [id]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errorMessage) setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setErrorMessage('');

      const res = await parcelService.updateParcel(id, {
        ...formData,
        quantity: Number(formData.quantity) || 1,
        declaredValue: Number(formData.declaredValue) || 0,
      });

      if (res.success) {
        navigate(`/parcels/${id}`);
      }
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || 'Failed to update parcel. Please review your entries.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullPage text="Loading parcel details for editing..." />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center gap-3">
        <Link
          to={`/parcels/${id}`}
          className="p-2 border border-brand-border rounded-lg bg-white text-brand-muted hover:text-brand-text hover:bg-gray-50 transition-standard"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-heading text-brand-text">
            Edit Parcel: <span className="font-mono text-brand-red">{formData.parcelCode}</span>
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted mt-0.5">
            Modify consignment metadata and customer destination information.
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-xs text-brand-red">
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Merchandise Section */}
        <div className="bg-white border border-brand-border rounded-xl shadow-card overflow-hidden">
          <div className="p-5 border-b border-brand-border bg-gray-50/50 flex items-center gap-2.5">
            <Package size={18} className="text-brand-red" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-text font-heading">
              Merchandise Details
            </h2>
          </div>

          <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="orderId"
                className="block text-xs font-semibold uppercase tracking-wider text-brand-text mb-1"
              >
                Order ID *
              </label>
              <input
                id="orderId"
                name="orderId"
                type="text"
                required
                value={formData.orderId}
                onChange={handleChange}
                className="w-full h-11 px-3.5 text-xs sm:text-sm bg-[#F5F6F8] border border-brand-border rounded-lg text-brand-text focus:outline-none focus:border-brand-red focus:bg-white"
              />
            </div>

            <div>
              <label
                htmlFor="productName"
                className="block text-xs font-semibold uppercase tracking-wider text-brand-text mb-1"
              >
                Product Description *
              </label>
              <input
                id="productName"
                name="productName"
                type="text"
                required
                value={formData.productName}
                onChange={handleChange}
                className="w-full h-11 px-3.5 text-xs sm:text-sm bg-[#F5F6F8] border border-brand-border rounded-lg text-brand-text focus:outline-none focus:border-brand-red focus:bg-white"
              />
            </div>

            <div>
              <label
                htmlFor="quantity"
                className="block text-xs font-semibold uppercase tracking-wider text-brand-text mb-1"
              >
                Quantity Units *
              </label>
              <input
                id="quantity"
                name="quantity"
                type="number"
                min="1"
                required
                value={formData.quantity}
                onChange={handleChange}
                className="w-full h-11 px-3.5 text-xs sm:text-sm bg-[#F5F6F8] border border-brand-border rounded-lg text-brand-text focus:outline-none focus:border-brand-red focus:bg-white"
              />
            </div>

            <div>
              <label
                htmlFor="declaredValue"
                className="block text-xs font-semibold uppercase tracking-wider text-brand-text mb-1"
              >
                Declared Value (PKR) *
              </label>
              <input
                id="declaredValue"
                name="declaredValue"
                type="number"
                min="0"
                required
                value={formData.declaredValue}
                onChange={handleChange}
                className="w-full h-11 px-3.5 text-xs sm:text-sm bg-[#F5F6F8] border border-brand-border rounded-lg text-brand-text font-mono focus:outline-none focus:border-brand-red focus:bg-white"
              />
            </div>

            <div>
              <label
                htmlFor="dispatchDate"
                className="block text-xs font-semibold uppercase tracking-wider text-brand-text mb-1"
              >
                Dispatch Date *
              </label>
              <input
                id="dispatchDate"
                name="dispatchDate"
                type="date"
                required
                value={formData.dispatchDate}
                onChange={handleChange}
                className="w-full h-11 px-3.5 text-xs sm:text-sm bg-[#F5F6F8] border border-brand-border rounded-lg text-brand-text focus:outline-none focus:border-brand-red focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Courier Section */}
        <div className="bg-white border border-brand-border rounded-xl shadow-card overflow-hidden">
          <div className="p-5 border-b border-brand-border bg-gray-50/50 flex items-center gap-2.5">
            <Truck size={18} className="text-brand-red" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-text font-heading">
              Courier Logistics
            </h2>
          </div>

          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="courierCompany"
                className="block text-xs font-semibold uppercase tracking-wider text-brand-text mb-1"
              >
                Courier Carrier *
              </label>
              <select
                id="courierCompany"
                name="courierCompany"
                required
                value={formData.courierCompany}
                onChange={handleChange}
                className="w-full h-11 px-3 text-xs sm:text-sm bg-[#F5F6F8] border border-brand-border rounded-lg text-brand-text focus:outline-none focus:border-brand-red focus:bg-white"
              >
                <option value="TCS">TCS Express</option>
                <option value="Leopards">Leopards Courier</option>
                <option value="M&P">M&P Express Logistics</option>
                <option value="Pakistan Post">Pakistan Post</option>
                <option value="Other">Other Pakistani Carrier</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="trackingNumber"
                className="block text-xs font-semibold uppercase tracking-wider text-brand-text mb-1"
              >
                Tracking / CN Number *
              </label>
              <input
                id="trackingNumber"
                name="trackingNumber"
                type="text"
                required
                value={formData.trackingNumber}
                onChange={handleChange}
                className="w-full h-11 px-3.5 text-xs sm:text-sm bg-[#F5F6F8] border border-brand-border rounded-lg text-brand-text font-mono focus:outline-none focus:border-brand-red focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Customer Destination Section */}
        <div className="bg-white border border-brand-border rounded-xl shadow-card overflow-hidden">
          <div className="p-5 border-b border-brand-border bg-gray-50/50 flex items-center gap-2.5">
            <User size={18} className="text-brand-red" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-text font-heading">
              Customer Details
            </h2>
          </div>

          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="customerName"
                className="block text-xs font-semibold uppercase tracking-wider text-brand-text mb-1"
              >
                Customer Name *
              </label>
              <input
                id="customerName"
                name="customerName"
                type="text"
                required
                value={formData.customerName}
                onChange={handleChange}
                className="w-full h-11 px-3.5 text-xs sm:text-sm bg-[#F5F6F8] border border-brand-border rounded-lg text-brand-text focus:outline-none focus:border-brand-red focus:bg-white"
              />
            </div>

            <div>
              <label
                htmlFor="customerPhone"
                className="block text-xs font-semibold uppercase tracking-wider text-brand-text mb-1"
              >
                Customer Phone *
              </label>
              <input
                id="customerPhone"
                name="customerPhone"
                type="text"
                required
                value={formData.customerPhone}
                onChange={handleChange}
                className="w-full h-11 px-3.5 text-xs sm:text-sm bg-[#F5F6F8] border border-brand-border rounded-lg text-brand-text focus:outline-none focus:border-brand-red focus:bg-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="shippingAddress"
                className="block text-xs font-semibold uppercase tracking-wider text-brand-text mb-1"
              >
                Shipping Address *
              </label>
              <textarea
                id="shippingAddress"
                name="shippingAddress"
                rows={2}
                required
                value={formData.shippingAddress}
                onChange={handleChange}
                className="w-full p-3 text-xs sm:text-sm bg-[#F5F6F8] border border-brand-border rounded-lg text-brand-text focus:outline-none focus:border-brand-red focus:bg-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="notes"
                className="block text-xs font-semibold uppercase tracking-wider text-brand-text mb-1"
              >
                Remarks / Packaging Instructions
              </label>
              <input
                id="notes"
                name="notes"
                type="text"
                value={formData.notes}
                onChange={handleChange}
                className="w-full h-11 px-3.5 text-xs sm:text-sm bg-[#F5F6F8] border border-brand-border rounded-lg text-brand-text focus:outline-none focus:border-brand-red focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            to={`/parcels/${id}`}
            className="px-5 h-11 border border-brand-border bg-white text-brand-text text-xs sm:text-sm font-semibold rounded-lg hover:bg-gray-50 flex items-center justify-center transition-standard"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-7 h-11 bg-brand-red hover:bg-brand-red-hover text-white text-xs sm:text-sm font-semibold rounded-lg flex items-center justify-center gap-2 shadow-sm transition-standard disabled:opacity-60"
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Save size={16} />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditParcel;
