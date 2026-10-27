import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Package,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit2,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import parcelService from '../../services/parcelService';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';

export const ParcelList = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [parcels, setParcels] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters & State
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'All');
  const [courierFilter, setCourierFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Quick Status Update Modal state
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedParcel, setSelectedParcel] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);

  const fetchParcels = async () => {
    try {
      setLoading(true);
      const res = await parcelService.getParcels({
        search: searchTerm,
        status: statusFilter,
        courier: courierFilter,
        page: currentPage,
        limit: 10,
        sortBy,
        order: sortOrder,
      });

      if (res.success) {
        setParcels(res.parcels);
        setTotal(res.total);
        setTotalPages(res.totalPages);
      }
    } catch (err) {
      console.error('Failed to fetch parcels:', err);
    } finally {
      setLoading(false);
    }
  };

  // Sync search param changes
  useEffect(() => {
    const querySearch = searchParams.get('search');
    if (querySearch !== null && querySearch !== searchTerm) {
      setSearchTerm(querySearch);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchParcels();
  }, [currentPage, statusFilter, courierFilter, sortBy, sortOrder]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchParcels();
  };

  const handleOpenStatusModal = (parcel) => {
    setSelectedParcel(parcel);
    setNewStatus(parcel.shipmentStatus);
    setStatusNote('');
    setStatusModalOpen(true);
  };

  const handleSaveStatus = async (e) => {
    e.preventDefault();
    if (!selectedParcel || !newStatus) return;

    try {
      setStatusUpdateLoading(true);
      const res = await parcelService.updateStatus(selectedParcel._id, {
        status: newStatus,
        note: statusNote,
      });

      if (res.success) {
        setStatusModalOpen(false);
        fetchParcels();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-heading text-brand-text">
            Parcel & Shipment Management
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted mt-0.5">
            Maintain custody records, track dispatches, and attach packing proof dossiers.
          </p>
        </div>

        <Link
          to="/parcels/create"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-red hover:bg-brand-red-hover text-white text-xs sm:text-sm font-semibold rounded-lg shadow-sm transition-standard"
        >
          <Plus size={16} />
          <span>Add New Parcel</span>
        </Link>
      </div>

      {/* Filter and Search Controls Bar */}
      <div className="bg-white border border-brand-border rounded-xl p-4 shadow-card space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          {/* Search Field */}
          <div className="relative flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by code, order ID, customer name, tracking #, product..."
              className="w-full h-10 pl-10 pr-4 text-xs sm:text-sm bg-[#F5F6F8] border border-brand-border rounded-lg text-brand-text placeholder-brand-muted focus:outline-none focus:border-brand-red focus:bg-white transition-standard"
            />
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none"
            />
          </div>

          <div className="flex flex-wrap sm:flex-nowrap gap-2.5">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-10 px-3 text-xs bg-white border border-brand-border rounded-lg text-brand-text focus:outline-none focus:border-brand-red"
            >
              <option value="All">All Statuses</option>
              <option value="Booked">Booked</option>
              <option value="In Transit">In Transit</option>
              <option value="Out for Delivery">Out for Delivery</option>
              <option value="Delivered">Delivered</option>
              <option value="Returned">Returned</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            {/* Courier Filter */}
            <select
              value={courierFilter}
              onChange={(e) => {
                setCourierFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-10 px-3 text-xs bg-white border border-brand-border rounded-lg text-brand-text focus:outline-none focus:border-brand-red"
            >
              <option value="All">All Couriers</option>
              <option value="TCS">TCS</option>
              <option value="Leopards">Leopards</option>
              <option value="M&P">M&P</option>
              <option value="Pakistan Post">Pakistan Post</option>
              <option value="Other">Other</option>
            </select>

            {/* Sort Order */}
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split('-');
                setSortBy(sb);
                setSortOrder(so);
                setCurrentPage(1);
              }}
              className="h-10 px-3 text-xs bg-white border border-brand-border rounded-lg text-brand-text focus:outline-none focus:border-brand-red"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="declaredValue-desc">Highest Value</option>
              <option value="dispatchDate-desc">Dispatch Date</option>
            </select>

            <button
              type="submit"
              className="px-4 h-10 bg-[#17191D] hover:bg-black text-white text-xs font-semibold rounded-lg transition-standard"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Main Parcels Table Card */}
      <div className="bg-white border border-brand-border rounded-xl shadow-card overflow-hidden">
        {loading ? (
          <LoadingSpinner size="md" text="Loading parcel records..." />
        ) : parcels.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No parcels found"
              description={
                searchTerm || statusFilter !== 'All'
                  ? 'No parcels match your search query or filter criteria. Try resetting your filters.'
                  : 'Your inventory has no parcels registered yet. Create your first parcel to begin maintaining custody evidence.'
              }
              action={
                <Link
                  to="/parcels/create"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-brand-red hover:bg-brand-red-hover text-white text-xs font-semibold rounded-lg shadow-sm transition-standard"
                >
                  <Plus size={14} />
                  <span>Create Parcel</span>
                </Link>
              }
            />
          </div>
        ) : (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8F9FA] text-brand-muted border-b border-brand-border font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Parcel Code</th>
                    <th className="py-3 px-4">Order ID</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Courier & Tracking</th>
                    <th className="py-3 px-4">Value (PKR)</th>
                    <th className="py-3 px-4">Shipment Status</th>
                    <th className="py-3 px-4">Dispatch Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {parcels.map((parcel) => (
                    <tr
                      key={parcel._id}
                      className="hover:bg-gray-50/75 transition-standard"
                    >
                      <td className="py-3.5 px-4 font-mono font-semibold text-brand-text">
                        <Link
                          to={`/parcels/${parcel._id}`}
                          className="hover:text-brand-red transition-standard"
                        >
                          {parcel.parcelCode}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 text-brand-text font-medium">
                        {parcel.orderId}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-brand-text">
                          {parcel.customerName}
                        </div>
                        <div className="text-[11px] text-brand-muted">
                          {parcel.customerPhone}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-brand-text">
                        <span className="font-semibold text-brand-text">
                          {parcel.courierCompany}
                        </span>
                        <div className="text-[11px] font-mono text-brand-muted">
                          {parcel.trackingNumber}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-brand-text">
                        Rs. {parcel.declaredValue.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={parcel.shipmentStatus} size="xs" />
                      </td>
                      <td className="py-3.5 px-4 text-brand-muted">
                        {new Date(parcel.dispatchDate || parcel.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Inspect Details */}
                          <Link
                            to={`/parcels/${parcel._id}`}
                            className="p-1.5 text-brand-muted hover:text-brand-text hover:bg-gray-100 rounded-lg transition-standard"
                            title="Inspect Parcel & Evidence"
                          >
                            <Eye size={15} />
                          </Link>

                          {/* Edit Details */}
                          <Link
                            to={`/parcels/${parcel._id}/edit`}
                            className="p-1.5 text-brand-muted hover:text-brand-text hover:bg-gray-100 rounded-lg transition-standard"
                            title="Edit Parcel Details"
                          >
                            <Edit2 size={15} />
                          </Link>

                          {/* Quick Status Update */}
                          <button
                            onClick={() => handleOpenStatusModal(parcel)}
                            className="p-1.5 text-brand-muted hover:text-brand-red hover:bg-red-50 rounded-lg transition-standard"
                            title="Update Shipment Status"
                          >
                            <RefreshCw size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="px-5 py-4 border-t border-brand-border flex items-center justify-between text-xs text-brand-muted">
              <div>
                Showing {(currentPage - 1) * 10 + 1} to{' '}
                {Math.min(currentPage * 10, total)} of {total} parcels
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="p-1.5 border border-brand-border rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="px-2 font-medium text-brand-text">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="p-1.5 border border-brand-border rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Status Update Modal */}
      {selectedParcel && (
        <Modal
          isOpen={statusModalOpen}
          onClose={() => setStatusModalOpen(false)}
          title={`Update Status: ${selectedParcel.parcelCode}`}
          subtitle="Record status change into the immutable custody timeline"
          maxWidth="max-w-md"
        >
          <form onSubmit={handleSaveStatus} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-text mb-1">
                New Shipment Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full h-11 px-3 text-sm bg-[#F5F6F8] border border-brand-border rounded-lg text-brand-text focus:outline-none focus:border-brand-red"
              >
                <option value="Booked">Booked</option>
                <option value="In Transit">In Transit</option>
                <option value="Out for Delivery">Out for Delivery</option>
                <option value="Delivered">Delivered</option>
                <option value="Returned">Returned</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-text mb-1">
                Status Note / Milestone Description
              </label>
              <textarea
                rows={3}
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                placeholder="e.g. Courier hub handoff, rider dispatched, or delivery signature collected"
                className="w-full p-3 text-xs sm:text-sm bg-[#F5F6F8] border border-brand-border rounded-lg text-brand-text focus:outline-none focus:border-brand-red"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStatusModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold border border-brand-border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={statusUpdateLoading}
                className="px-4 py-2 text-xs font-semibold bg-brand-red hover:bg-brand-red-hover text-white rounded-lg disabled:opacity-60"
              >
                {statusUpdateLoading ? 'Saving...' : 'Update Status'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default ParcelList;
