import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Package,
  ArrowLeft,
  Edit2,
  RefreshCw,
  Upload,
  User,
  Phone,
  MapPin,
  Truck,
  ShieldCheck,
  Clock,
  Calendar,
  FileText,
  Film,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Eye,
  Download,
} from 'lucide-react';
import parcelService from '../../services/parcelService';
import evidenceService from '../../services/evidenceService';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import IntegrityModal from '../../components/evidence/IntegrityModal';
import FilePreviewModal from '../../components/evidence/FilePreviewModal';

export const ParcelDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [parcel, setParcel] = useState(null);
  const [evidenceList, setEvidenceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Status Update Modal
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [statusLoading, setStatusLoading] = useState(false);

  // Quick Upload Evidence Modal for this parcel
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [evidenceType, setEvidenceType] = useState('Packing Photo');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');

  // Integrity Check Modal
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [verifyData, setVerifyData] = useState(null);
  const [verifyLoading, setVerifyLoading] = useState(false);

  // File Preview Modal
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [selectedEvidence, setSelectedEvidence] = useState(null);

  const [copiedCode, setCopiedCode] = useState(false);

  const fetchParcelDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await parcelService.getParcelById(id);
      if (res.success) {
        setParcel(res.parcel);
        setEvidenceList(res.evidence || []);
        setNewStatus(res.parcel.shipmentStatus);
      }
    } catch (err) {
      console.error('Failed to load parcel details:', err);
      setError(err.response?.data?.message || 'Parcel record not found or access denied.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParcelDetails();
  }, [id]);

  const handleCopyCode = () => {
    if (parcel?.parcelCode) {
      navigator.clipboard.writeText(parcel.parcelCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    try {
      setStatusLoading(true);
      const res = await parcelService.updateStatus(id, {
        status: newStatus,
        note: statusNote,
      });

      if (res.success) {
        setStatusModalOpen(false);
        fetchParcelDetails();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    } finally {
      setStatusLoading(false);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      setUploadError('Please select a file to upload.');
      return;
    }

    try {
      setUploadLoading(true);
      setUploadError('');

      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('evidenceType', evidenceType);

      const res = await evidenceService.uploadParcelEvidence(
        id,
        formData,
        (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        }
      );

      if (res.success) {
        setUploadModalOpen(false);
        setUploadFile(null);
        setUploadProgress(0);
        fetchParcelDetails();
      }
    } catch (err) {
      setUploadError(
        err.response?.data?.message || 'Upload failed. Ensure file size and format comply with guidelines.'
      );
    } finally {
      setUploadLoading(false);
    }
  };

  const handleVerifyIntegrity = async (evidenceItem) => {
    try {
      setVerifyModalOpen(true);
      setVerifyLoading(true);
      setVerifyData({
        originalFilename: evidenceItem.originalFilename,
        category: evidenceItem.evidenceType,
        parcelCode: parcel?.parcelCode,
      });

      const res = await evidenceService.verifyIntegrity(evidenceItem._id);
      if (res.success) {
        setVerifyData(res);
      }
    } catch (err) {
      console.error('Integrity check failed:', err);
    } finally {
      setVerifyLoading(false);
    }
  };

  const handlePreview = (evidenceItem) => {
    setSelectedEvidence(evidenceItem);
    setPreviewModalOpen(true);
  };

  if (loading) {
    return <LoadingSpinner fullPage text="Retrieving parcel records & evidence dossiers..." />;
  }

  if (error || !parcel) {
    return (
      <div className="max-w-xl mx-auto py-12">
        <EmptyState
          title="Parcel Not Found"
          description={error || 'The requested parcel record could not be loaded.'}
          action={
            <Link
              to="/parcels"
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-red text-white text-xs font-semibold rounded-lg hover:bg-brand-red-hover"
            >
              <ArrowLeft size={14} />
              <span>Back to Parcels List</span>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header Card */}
      <div className="bg-white border border-brand-border rounded-xl p-6 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Link
              to="/parcels"
              className="text-xs text-brand-muted hover:text-brand-text flex items-center gap-1 transition-standard"
            >
              <ArrowLeft size={13} />
              <span>Parcels List</span>
            </Link>
            <span className="text-gray-300">•</span>
            <span className="text-xs font-mono text-brand-muted">
              Order #{parcel.orderId}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold font-heading font-mono text-brand-text">
              {parcel.parcelCode}
            </h1>
            <button
              onClick={handleCopyCode}
              className="p-1.5 text-brand-muted hover:text-brand-text rounded-md hover:bg-gray-100 transition-standard"
              title="Copy Parcel Code"
            >
              {copiedCode ? <Check size={14} className="text-brand-success" /> : <Copy size={14} />}
            </button>
            <StatusBadge status={parcel.shipmentStatus} size="sm" />
          </div>
          <p className="text-xs text-brand-muted mt-1">
            Registered on {new Date(parcel.createdAt).toLocaleString()} • Dispatch Date:{' '}
            {new Date(parcel.dispatchDate).toLocaleDateString()}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={() => setStatusModalOpen(true)}
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 border border-brand-border bg-white hover:bg-gray-50 text-brand-text text-xs font-semibold rounded-lg shadow-sm transition-standard"
          >
            <RefreshCw size={14} />
            <span>Update Status</span>
          </button>

          <Link
            to={`/parcels/${parcel._id}/edit`}
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 border border-brand-border bg-white hover:bg-gray-50 text-brand-text text-xs font-semibold rounded-lg shadow-sm transition-standard"
          >
            <Edit2 size={14} />
            <span>Edit Details</span>
          </Link>

          <button
            onClick={() => setUploadModalOpen(true)}
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-brand-red hover:bg-brand-red-hover text-white text-xs font-semibold rounded-lg shadow-sm transition-standard"
          >
            <Upload size={14} />
            <span>Attach Evidence</span>
          </button>
        </div>
      </div>

      {/* 3-Column Info Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Merchandise Card */}
        <div className="bg-white border border-brand-border rounded-xl p-5 shadow-card space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-brand-border text-brand-text font-bold text-xs uppercase tracking-wider font-heading">
            <Package size={16} className="text-brand-red" />
            <span>Merchandise Details</span>
          </div>
          <div className="space-y-2 text-xs">
            <div>
              <span className="text-brand-muted block text-[11px] uppercase font-semibold">
                Product Description
              </span>
              <span className="font-semibold text-brand-text text-sm">
                {parcel.productName}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <span className="text-brand-muted block text-[11px] uppercase font-semibold">
                  Quantity
                </span>
                <span className="font-bold text-brand-text">
                  {parcel.quantity} Unit(s)
                </span>
              </div>
              <div>
                <span className="text-brand-muted block text-[11px] uppercase font-semibold">
                  Declared Value
                </span>
                <span className="font-bold font-mono text-brand-red">
                  PKR {parcel.declaredValue?.toLocaleString()}
                </span>
              </div>
            </div>
            {parcel.notes && (
              <div className="pt-2 border-t border-gray-100">
                <span className="text-brand-muted block text-[11px] uppercase font-semibold">
                  Packaging Notes
                </span>
                <p className="text-brand-text italic mt-0.5">{parcel.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Customer / Consignee Card */}
        <div className="bg-white border border-brand-border rounded-xl p-5 shadow-card space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-brand-border text-brand-text font-bold text-xs uppercase tracking-wider font-heading">
            <User size={16} className="text-brand-red" />
            <span>Customer / Consignee</span>
          </div>
          <div className="space-y-2 text-xs">
            <div>
              <span className="text-brand-muted block text-[11px] uppercase font-semibold">
                Customer Name
              </span>
              <span className="font-semibold text-brand-text text-sm">
                {parcel.customerName}
              </span>
            </div>
            <div>
              <span className="text-brand-muted block text-[11px] uppercase font-semibold">
                Phone Number
              </span>
              <span className="font-mono text-brand-text">
                {parcel.customerPhone}
              </span>
            </div>
            <div>
              <span className="text-brand-muted block text-[11px] uppercase font-semibold">
                Shipping Destination
              </span>
              <p className="text-brand-text leading-relaxed">
                {parcel.shippingAddress}
              </p>
            </div>
          </div>
        </div>

        {/* Courier & Logistics Card */}
        <div className="bg-white border border-brand-border rounded-xl p-5 shadow-card space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-brand-border text-brand-text font-bold text-xs uppercase tracking-wider font-heading">
            <Truck size={16} className="text-brand-red" />
            <span>Courier & Tracking</span>
          </div>
          <div className="space-y-2 text-xs">
            <div>
              <span className="text-brand-muted block text-[11px] uppercase font-semibold">
                Carrier Company
              </span>
              <span className="font-bold text-brand-text text-sm">
                {parcel.courierCompany} Express
              </span>
            </div>
            <div>
              <span className="text-brand-muted block text-[11px] uppercase font-semibold">
                Consignment / Tracking #
              </span>
              <span className="font-mono font-bold text-brand-text bg-gray-100 px-2 py-0.5 rounded border border-gray-200 inline-block mt-0.5">
                {parcel.trackingNumber}
              </span>
            </div>
            <div className="pt-2 border-t border-gray-100">
              <span className="text-brand-muted block text-[11px] uppercase font-semibold">
                Dispatch Date
              </span>
              <span className="text-brand-text font-medium">
                {new Date(parcel.dispatchDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Related Evidence & Status Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Related Evidence Files */}
        <div className="lg:col-span-2 bg-white border border-brand-border rounded-xl shadow-card overflow-hidden">
          <div className="p-5 border-b border-brand-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-brand-red" />
              <div>
                <h3 className="text-sm font-bold font-heading text-brand-text">
                  Associated Packing Evidence Files ({evidenceList.length})
                </h3>
                <p className="text-xs text-brand-muted">
                  Cryptographically hashed digital artifacts for courier claims
                </p>
              </div>
            </div>

            <button
              onClick={() => setUploadModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-red hover:bg-brand-red-hover text-white text-xs font-semibold rounded-lg transition-standard"
            >
              <Upload size={13} />
              <span>Attach File</span>
            </button>
          </div>

          {evidenceList.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={ShieldCheck}
                title="No evidence attached yet"
                description="Upload packing photos, videos, shipping labels, or courier handoff receipts to establish verified dispatch proof."
                action={
                  <button
                    onClick={() => setUploadModalOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#17191D] hover:bg-black text-white text-xs font-semibold rounded-lg transition-standard"
                  >
                    <Upload size={14} />
                    <span>Upload First Evidence File</span>
                  </button>
                }
              />
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {evidenceList.map((item) => {
                const isVid = item.mimeType?.startsWith('video/');
                const isImg = item.mimeType?.startsWith('image/');
                const downloadUrl = evidenceService.getDirectUrl(item._id, false);

                return (
                  <div
                    key={item._id}
                    className="p-4 sm:p-5 hover:bg-gray-50/75 transition-standard space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2.5 rounded-xl bg-gray-100 text-brand-muted flex-shrink-0">
                          {isVid ? (
                            <Film size={20} />
                          ) : isImg ? (
                            <ImageIcon size={20} />
                          ) : (
                            <FileText size={20} />
                          )}
                        </div>
                        <div className="min-w-0">
                          <button
                            onClick={() => handlePreview(item)}
                            className="text-xs sm:text-sm font-bold text-brand-text hover:text-brand-red truncate block text-left transition-standard"
                          >
                            {item.originalFilename}
                          </button>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-brand-muted mt-0.5">
                            <span className="font-semibold text-brand-text">
                              {item.evidenceType}
                            </span>
                            <span>•</span>
                            <span>
                              {(item.fileSize / 1024 / 1024).toFixed(2)} MB
                            </span>
                            <span>•</span>
                            <span>
                              {new Date(item.uploadedAt).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Evidence Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => handlePreview(item)}
                          className="p-1.5 border border-brand-border rounded-lg text-brand-muted hover:text-brand-text hover:bg-gray-100 transition-standard"
                          title="Preview Media"
                        >
                          <Eye size={15} />
                        </button>
                        <a
                          href={downloadUrl}
                          download={item.originalFilename}
                          className="p-1.5 border border-brand-border rounded-lg text-brand-muted hover:text-brand-text hover:bg-gray-100 transition-standard"
                          title="Download Stored Original"
                        >
                          <Download size={15} />
                        </a>
                        <button
                          onClick={() => handleVerifyIntegrity(item)}
                          className="px-2.5 py-1.5 bg-emerald-50 text-brand-success border border-emerald-200 rounded-lg text-xs font-semibold hover:bg-emerald-100 transition-standard flex items-center gap-1.5"
                          title="Verify SHA-256 against server storage"
                        >
                          <ShieldCheck size={14} />
                          <span>Verify Integrity</span>
                        </button>
                      </div>
                    </div>

                    {/* Cryptographic SHA-256 Hash Display */}
                    <div className="bg-[#17191D] text-gray-300 p-2.5 rounded-lg border border-gray-700 flex items-center justify-between gap-2 text-[11px] font-mono">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[9px] uppercase font-bold text-gray-400 flex-shrink-0">
                          SHA-256:
                        </span>
                        <span className="truncate select-all text-emerald-400">
                          {item.sha256Hash}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(item.sha256Hash);
                          alert('SHA-256 signature copied to clipboard');
                        }}
                        className="text-gray-400 hover:text-white flex-shrink-0"
                        title="Copy Hash"
                      >
                        <Copy size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column (1 span): Status Timeline */}
        <div className="bg-white border border-brand-border rounded-xl shadow-card overflow-hidden">
          <div className="p-5 border-b border-brand-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-brand-red" />
              <h3 className="text-sm font-bold font-heading text-brand-text">
                Shipment Custody Timeline
              </h3>
            </div>
            <button
              onClick={() => setStatusModalOpen(true)}
              className="text-xs font-semibold text-brand-red hover:underline"
            >
              + Milestone
            </button>
          </div>

          <div className="p-5">
            {(!parcel.statusHistory || parcel.statusHistory.length === 0) ? (
              <p className="text-xs text-brand-muted text-center py-6">
                No status history events logged.
              </p>
            ) : (
              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
                {parcel.statusHistory
                  .slice()
                  .reverse()
                  .map((historyItem, index) => (
                    <div key={index} className="relative group">
                      {/* Timeline dot */}
                      <div
                        className={`absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 border-white ring-2 ${
                          index === 0
                            ? 'bg-brand-red ring-red-200'
                            : 'bg-gray-400 ring-gray-200'
                        }`}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={historyItem.newStatus} size="xs" />
                          <span className="text-[10px] text-brand-muted">
                            {new Date(historyItem.changedAt).toLocaleString()}
                          </span>
                        </div>
                        {historyItem.note && (
                          <p className="text-xs text-brand-text mt-1.5 bg-gray-50 p-2 rounded border border-gray-100">
                            {historyItem.note}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Status Update Modal */}
      <Modal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title={`Update Status: ${parcel.parcelCode}`}
        subtitle="Append a verified custody milestone into shipment history"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleUpdateStatus} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-brand-text mb-1">
              New Shipment Status *
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
              Milestone / Activity Note
            </label>
            <textarea
              rows={3}
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
              placeholder="e.g. Scanned at Karachi Central Hub or handed to courier delivery rider"
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
              disabled={statusLoading}
              className="px-4 py-2 text-xs font-semibold bg-brand-red hover:bg-brand-red-hover text-white rounded-lg disabled:opacity-60"
            >
              {statusLoading ? 'Saving...' : 'Update Status'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Quick Attach Evidence Modal */}
      <Modal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        title="Attach Evidence to Parcel"
        subtitle={`Linking media to custody record ${parcel.parcelCode}`}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          {uploadError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-xs text-brand-red">
              <AlertCircle size={15} className="mt-0.5 flex-shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-brand-text mb-1">
              Evidence Category *
            </label>
            <select
              value={evidenceType}
              onChange={(e) => setEvidenceType(e.target.value)}
              className="w-full h-11 px-3 text-sm bg-[#F5F6F8] border border-brand-border rounded-lg text-brand-text focus:outline-none focus:border-brand-red"
            >
              <option value="Packing Photo">Packing Photograph (JPG, PNG, WEBP)</option>
              <option value="Packing Video">Packing Video (MP4)</option>
              <option value="Shipping Label">Shipping Label</option>
              <option value="Courier Receipt">Courier Booking Receipt</option>
              <option value="PDF Document">PDF Document / Dispatch Invoice</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-brand-text mb-1">
              Select Evidence File *
            </label>
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.mp4,.pdf"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setUploadFile(e.target.files[0]);
                  setUploadError('');
                }
              }}
              className="w-full text-xs text-brand-muted file:mr-3 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-brand-text hover:file:bg-gray-200 cursor-pointer border border-brand-border rounded-lg p-2 bg-[#F5F6F8]"
            />
            <span className="text-[11px] text-brand-muted mt-1 block">
              Max: Images (10 MB), PDFs (10 MB), Videos (50 MB). SHA-256 fingerprint will be generated upon save.
            </span>
          </div>

          {uploadProgress > 0 && (
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-brand-red h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setUploadModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold border border-brand-border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploadLoading || !uploadFile}
              className="px-5 py-2 text-xs font-semibold bg-brand-red hover:bg-brand-red-hover text-white rounded-lg disabled:opacity-60"
            >
              {uploadLoading ? `Uploading (${uploadProgress}%)...` : 'Upload & Compute Hash'}
            </button>
          </div>
        </form>
      </Modal>

      {/* SHA-256 Cryptographic Verification Modal */}
      <IntegrityModal
        isOpen={verifyModalOpen}
        onClose={() => setVerifyModalOpen(false)}
        data={verifyData}
        loading={verifyLoading}
      />

      {/* File Preview Modal */}
      <FilePreviewModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        evidence={selectedEvidence}
      />
    </div>
  );
};

export default ParcelDetails;
