import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Package,
  ArrowLeft,
  Save,
  AlertCircle,
  Truck,
  User,
  MapPin,
  FileText,
  DollarSign,
  Info,
} from 'lucide-react';
import parcelService from '../../services/parcelService';

export const CreateParcel = () => {
  const navigate = useNavigate();

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
    dispatchDate: new Date().toISOString().split('T')[0],
    shipmentStatus: 'Booked',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errorMessage) setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.orderId ||
      !formData.productName ||
      !formData.customerName ||
      !formData.customerPhone ||
      !formData.shippingAddress ||
      !formData.trackingNumber ||
      !formData.declaredValue
    ) {
      setErrorMessage('Please fill in all mandatory shipment fields.');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage('');

      const res = await parcelService.createParcel({
        ...formData,
        quantity: Number(formData.quantity) || 1,
        declaredValue: Number(formData.declaredValue) || 0,
      });

      if (res.success && res.parcel) {
        navigate(`/parcels/${res.parcel._id}`);
      }
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || 'Failed to create parcel record. Please check the inputs.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Navigation & Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/parcels"
            className="p-2 border border-brand-border rounded-lg bg-white text-brand-muted hover:text-brand-text hover:bg-gray-50 transition-standard"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-heading text-brand-text">
              Create New Parcel Record
            </h1>
            <p className="text-xs sm:text-sm text-brand-muted mt-0.5">
              Register a shipment before courier dispatch to prepare custody evidence.
            </p>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-xs text-brand-red">
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Order & Product Details */}
        <div className="bg-white border border-brand-border rounded-xl shadow-card overflow-hidden">
          <div className="p-5 border-b border-brand-border bg-gray-50/50 flex items-center gap-2.5">
            <Package size={18} className="text-brand-red" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-text font-heading">
              1. Shipment & Merchandise Identification
            </h2>
          </div>

          <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="parcelCode"
                className="block text-xs font-semibold uppercase tracking-wider text-brand-text mb-1"
              >
                Parcel Code (Optional)
              </label>
              <input
                id="parcelCode"
                name="parcelCode"
                type="text"
                value={formData.parcelCode}
                onChange={handleChange}
                placeholder="Auto-generated if empty (PRCL-XXXX)"
                className="w-full h-11 px-3.5 text-xs sm:text-sm bg-[#F5F6F8] border border-brand-border rounded-lg text-brand-text font-mono uppercase focus:outline-none focus:border-brand-red focus:bg-white"
              />
              <span className="text-[10px] text-brand-muted mt-1 block">
                Leave blank to auto-generate standard parcel ID.
              </span>
            </div>

            <div>
              <label
                htmlFor="orderId"
                className="block text-xs font-semibold uppercase tracking-wider text-brand-text mb-1"
              >
                E-Commerce Order ID *
              </label>
              <input
                id="orderId"
                name="orderId"
                type="text"
                required
                value={formData.orderId}
                onChange={handleChange}
                placeholder="e.g. ORD-98231 or Daraz/Shopify #"
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
                placeholder="e.g. Wireless ANC Headphones (Black)"
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
                placeholder="e.g. 8500"
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

        {/* Section 2: Pakistani Courier Selection */}
        <div className="bg-white border border-brand-border rounded-xl shadow-card overflow-hidden">
          <div className="p-5 border-b border-brand-border bg-gray-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Truck size={18} className="text-brand-red" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-brand-text font-heading">
                2. Pakistani Courier & Consignment Information
              </h2>
            </div>
            <span className="text-[11px] text-brand-muted hidden sm:inline">
              Manual tracking reference
            </span>
          </div>

          <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="courierCompany"
                className="block text-xs font-semibold uppercase tracking-wider text-brand-text mb-1"
              >
                Courier Company *
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
                placeholder="e.g. 7739102941"
                className="w-full h-11 px-3.5 text-xs sm:text-sm bg-[#F5F6F8] border border-brand-border rounded-lg text-brand-text font-mono focus:outline-none focus:border-brand-red focus:bg-white"
              />
            </div>

            <div>
              <label
                htmlFor="shipmentStatus"
                className="block text-xs font-semibold uppercase tracking-wider text-brand-text mb-1"
              >
                Initial Shipment Status *
              </label>
              <select
                id="shipmentStatus"
                name="shipmentStatus"
                required
                value={formData.shipmentStatus}
                onChange={handleChange}
                className="w-full h-11 px-3 text-xs sm:text-sm bg-[#F5F6F8] border border-brand-border rounded-lg text-brand-text focus:outline-none focus:border-brand-red focus:bg-white"
              >
                <option value="Booked">Booked</option>
                <option value="In Transit">In Transit</option>
                <option value="Out for Delivery">Out for Delivery</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>
          </div>

          <div className="px-6 pb-4">
            <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-lg flex items-start gap-2 text-[11px] text-amber-800">
              <Info size={15} className="mt-0.5 flex-shrink-0" />
              <span>
                Courier tracking records in ParcelProof are manually maintained seller custody references. Live third-party API integration is not simulated.
              </span>
            </div>
          </div>
        </div>

        {/* Section 3: Customer & Destination Address */}
        <div className="bg-white border border-brand-border rounded-xl shadow-card overflow-hidden">
          <div className="p-5 border-b border-brand-border bg-gray-50/50 flex items-center gap-2.5">
            <User size={18} className="text-brand-red" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-text font-heading">
              3. Consignee / Customer Details
            </h2>
          </div>

          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="customerName"
                className="block text-xs font-semibold uppercase tracking-wider text-brand-text mb-1"
              >
                Customer Full Name *
              </label>
              <input
                id="customerName"
                name="customerName"
                type="text"
                required
                value={formData.customerName}
                onChange={handleChange}
                placeholder="e.g. Asad Ali Khan"
                className="w-full h-11 px-3.5 text-xs sm:text-sm bg-[#F5F6F8] border border-brand-border rounded-lg text-brand-text focus:outline-none focus:border-brand-red focus:bg-white"
              />
            </div>

            <div>
              <label
                htmlFor="customerPhone"
                className="block text-xs font-semibold uppercase tracking-wider text-brand-text mb-1"
              >
                Customer Contact Phone *
              </label>
              <input
                id="customerPhone"
                name="customerPhone"
                type="text"
                required
                value={formData.customerPhone}
                onChange={handleChange}
                placeholder="0312-9876543"
                className="w-full h-11 px-3.5 text-xs sm:text-sm bg-[#F5F6F8] border border-brand-border rounded-lg text-brand-text focus:outline-none focus:border-brand-red focus:bg-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="shippingAddress"
                className="block text-xs font-semibold uppercase tracking-wider text-brand-text mb-1"
              >
                Complete Delivery Address *
              </label>
              <textarea
                id="shippingAddress"
                name="shippingAddress"
                rows={2}
                required
                value={formData.shippingAddress}
                onChange={handleChange}
                placeholder="House #, Street #, Sector/Area, City (e.g. House 42, Street 7, F-8/2, Islamabad)"
                className="w-full p-3 text-xs sm:text-sm bg-[#F5F6F8] border border-brand-border rounded-lg text-brand-text focus:outline-none focus:border-brand-red focus:bg-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="notes"
                className="block text-xs font-semibold uppercase tracking-wider text-brand-text mb-1"
              >
                Dispatch Remarks / Packaging Instructions
              </label>
              <input
                id="notes"
                name="notes"
                type="text"
                value={formData.notes}
                onChange={handleChange}
                placeholder="e.g. Fragile glass packaging, double sealed with branded security tape"
                className="w-full h-11 px-3.5 text-xs sm:text-sm bg-[#F5F6F8] border border-brand-border rounded-lg text-brand-text focus:outline-none focus:border-brand-red focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            to="/parcels"
            className="px-5 h-11 border border-brand-border bg-white text-brand-text text-xs sm:text-sm font-semibold rounded-lg hover:bg-gray-50 flex items-center justify-center transition-standard"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-7 h-11 bg-brand-red hover:bg-brand-red-hover text-white text-xs sm:text-sm font-semibold rounded-lg flex items-center justify-center gap-2 shadow-sm transition-standard disabled:opacity-60"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Save size={16} />
                <span>Save Parcel & Proceed</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateParcel;
