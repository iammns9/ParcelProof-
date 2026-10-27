import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Upload,
  ArrowLeft,
  FileCheck,
  ShieldCheck,
  AlertCircle,
  FileText,
  Film,
  Image as ImageIcon,
  CheckCircle2,
  Copy,
  Info,
} from 'lucide-react';
import evidenceService from '../../services/evidenceService';
import parcelService from '../../services/parcelService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export const UploadEvidence = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedParcelId = searchParams.get('parcelId') || '';

  const [parcels, setParcels] = useState([]);
  const [parcelsLoading, setParcelsLoading] = useState(true);

  const [selectedParcelId, setSelectedParcelId] = useState(preselectedParcelId);
  const [evidenceType, setEvidenceType] = useState('Packing Photo');
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [uploadedResult, setUploadedResult] = useState(null);

  const fileInputRef = useRef(null);

  // Load parcels for dropdown
  useEffect(() => {
    const fetchParcels = async () => {
      try {
        setParcelsLoading(true);
        const res = await parcelService.getParcels({ limit: 100 });
        if (res.success) {
          setParcels(res.parcels);
          if (!selectedParcelId && res.parcels.length > 0) {
            setSelectedParcelId(res.parcels[0]._id);
          }
        }
      } catch (err) {
        console.error('Failed to load parcels:', err);
      } finally {
        setParcelsLoading(false);
      }
    };
    fetchParcels();
  }, []);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    setErrorMessage('');
    if (!selectedFile) return;

    const ext = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();
    const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.mp4', '.pdf'];

    if (!allowed.includes(ext)) {
      setErrorMessage(
        `Invalid file type (${ext}). Only JPG, PNG, WEBP, MP4, and PDF documents are supported.`
      );
      return;
    }

    const isVideo = ext === '.mp4';
    const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;

    if (selectedFile.size > maxSize) {
      setErrorMessage(
        `File is too large (${(selectedFile.size / 1024 / 1024).toFixed(1)} MB). Maximum limit is ${
          isVideo ? '50 MB for MP4 videos' : '10 MB for images & PDFs'
        }.`
      );
      return;
    }

    setFile(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedParcelId) {
      setErrorMessage('Please select an associated parcel.');
      return;
    }

    if (!file) {
      setErrorMessage('Please select or drop an evidence file to upload.');
      return;
    }

    try {
      setUploading(true);
      setErrorMessage('');

      const formData = new FormData();
      formData.append('file', file);
      formData.append('parcelId', selectedParcelId);
      formData.append('evidenceType', evidenceType);

      const res = await evidenceService.uploadEvidence(formData, (progressEvent) => {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(percent);
      });

      if (res.success && res.evidence) {
        setUploadedResult(res.evidence);
      }
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || 'File upload failed. Please verify format and size restrictions.'
      );
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setUploadProgress(0);
    setUploadedResult(null);
    setErrorMessage('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/evidence"
          className="p-2 border border-brand-border rounded-lg bg-white text-brand-muted hover:text-brand-text hover:bg-gray-50 transition-standard"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-heading text-brand-text">
            Upload Packing Evidence
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted mt-0.5">
            Store photos, videos, and courier slips with cryptographically hashed fingerprints.
          </p>
        </div>
      </div>

      {/* Success View */}
      {uploadedResult ? (
        <div className="bg-white border border-brand-border rounded-xl p-8 shadow-card text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-brand-success flex items-center justify-center mx-auto">
            <CheckCircle2 size={36} />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-success">
              Cryptographic Checksum Stored
            </span>
            <h2 className="text-xl font-bold font-heading text-brand-text mt-1">
              Evidence Uploaded & Verified Successfully
            </h2>
            <p className="text-xs text-brand-muted max-w-md mx-auto mt-1">
              File <span className="font-semibold text-brand-text">{uploadedResult.originalFilename}</span> was saved in secure storage with SHA-256 fingerprint generation.
            </p>
          </div>

          {/* Stored Hash Display Card */}
          <div className="max-w-2xl mx-auto bg-[#17191D] p-4 rounded-xl text-left border border-gray-700 space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span className="font-bold uppercase tracking-wider text-[10px]">
                Computed SHA-256 Digest
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(uploadedResult.sha256Hash);
                  alert('SHA-256 hash copied to clipboard');
                }}
                className="text-emerald-400 hover:underline flex items-center gap-1 text-[11px]"
              >
                <Copy size={12} />
                <span>Copy Hash</span>
              </button>
            </div>
            <div className="font-mono text-xs text-emerald-400 break-all select-all">
              {uploadedResult.sha256Hash}
            </div>
          </div>

          {/* Action Links */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              onClick={handleReset}
              className="px-5 py-2.5 border border-brand-border rounded-lg text-xs font-semibold text-brand-text hover:bg-gray-50 transition-standard"
            >
              Upload Another Evidence File
            </button>
            <Link
              to={`/parcels/${selectedParcelId}`}
              className="px-6 py-2.5 bg-brand-red hover:bg-brand-red-hover text-white text-xs font-semibold rounded-lg shadow-sm transition-standard"
            >
              View Associated Parcel
            </Link>
            <Link
              to="/evidence"
              className="px-5 py-2.5 bg-[#17191D] hover:bg-black text-white text-xs font-semibold rounded-lg transition-standard"
            >
              Go to Evidence Library
            </Link>
          </div>
        </div>
      ) : (
        /* Upload Form */
        <form onSubmit={handleSubmit} className="space-y-6">
          {errorMessage && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-xs text-brand-red">
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form Configuration Card */}
          <div className="bg-white border border-brand-border rounded-xl p-6 shadow-card space-y-5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-text font-heading border-b border-brand-border pb-3">
              1. Associate Parcel & Evidence Type
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Parcel Selector */}
              <div>
                <label
                  htmlFor="parcelId"
                  className="block text-xs font-semibold uppercase tracking-wider text-brand-text mb-1.5"
                >
                  Select Target Parcel *
                </label>
                {parcelsLoading ? (
                  <div className="h-11 flex items-center text-xs text-brand-muted">
                    Loading registered parcels...
                  </div>
                ) : parcels.length === 0 ? (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                    No parcels found. Please{' '}
                    <Link to="/parcels/create" className="font-bold underline">
                      create a parcel
                    </Link>{' '}
                    first.
                  </div>
                ) : (
                  <select
                    id="parcelId"
                    value={selectedParcelId}
                    onChange={(e) => setSelectedParcelId(e.target.value)}
                    required
                    className="w-full h-11 px-3 text-xs sm:text-sm bg-[#F5F6F8] border border-brand-border rounded-lg text-brand-text focus:outline-none focus:border-brand-red focus:bg-white"
                  >
                    {parcels.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.parcelCode} — {p.customerName} ({p.courierCompany}: {p.trackingNumber})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Category Selector */}
              <div>
                <label
                  htmlFor="evidenceType"
                  className="block text-xs font-semibold uppercase tracking-wider text-brand-text mb-1.5"
                >
                  Evidence Category *
                </label>
                <select
                  id="evidenceType"
                  value={evidenceType}
                  onChange={(e) => setEvidenceType(e.target.value)}
                  required
                  className="w-full h-11 px-3 text-xs sm:text-sm bg-[#F5F6F8] border border-brand-border rounded-lg text-brand-text focus:outline-none focus:border-brand-red focus:bg-white"
                >
                  <option value="Packing Photo">Packing Photograph (JPG, PNG, WEBP)</option>
                  <option value="Packing Video">Packing Video (MP4)</option>
                  <option value="Shipping Label">Shipping Label</option>
                  <option value="Courier Receipt">Courier Booking Receipt</option>
                  <option value="PDF Document">PDF Document / Dispatch Invoice</option>
                </select>
              </div>
            </div>
          </div>

          {/* Drag & Drop File Zone */}
          <div className="bg-white border border-brand-border rounded-xl p-6 shadow-card space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-text font-heading border-b border-brand-border pb-3">
              2. Upload Digital Media File
            </h2>

            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-standard flex flex-col items-center justify-center ${
                dragActive
                  ? 'border-brand-red bg-red-50/50'
                  : file
                  ? 'border-emerald-400 bg-emerald-50/20'
                  : 'border-gray-300 hover:border-brand-red hover:bg-gray-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.mp4,.pdf"
                onChange={handleFileInputChange}
                className="hidden"
              />

              {file ? (
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-brand-success flex items-center justify-center mb-3">
                    <FileCheck size={28} />
                  </div>
                  <h3 className="text-sm font-bold font-heading text-brand-text">
                    {file.name}
                  </h3>
                  <p className="text-xs text-brand-muted mt-0.5">
                    {(file.size / 1024 / 1024).toFixed(2)} MB • Ready for cryptographic hashing
                  </p>
                  <span className="text-[11px] text-brand-red underline mt-3">
                    Click or drop another file to change
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 rounded-full bg-red-50 text-brand-red flex items-center justify-center mb-3">
                    <Upload size={26} />
                  </div>
                  <h3 className="text-sm font-bold font-heading text-brand-text">
                    Drag and drop your evidence file here
                  </h3>
                  <p className="text-xs text-brand-muted mt-1 max-w-sm">
                    Supports JPG, PNG, WEBP, MP4, and PDF documents.
                  </p>
                  <button
                    type="button"
                    className="mt-4 px-4 py-2 bg-white border border-brand-border hover:bg-gray-50 text-brand-text text-xs font-semibold rounded-lg shadow-sm transition-standard"
                  >
                    Browse Local Storage
                  </button>
                </div>
              )}
            </div>

            {/* Size & Privacy Notice */}
            <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-lg flex items-start gap-2.5 text-[11px] text-brand-muted">
              <Info size={15} className="mt-0.5 flex-shrink-0 text-brand-muted" />
              <span>
                Files are stored privately in non-public repository storage and streamed only upon authenticated seller authorization. Size limits: Images & PDFs max 10 MB, Videos max 50 MB.
              </span>
            </div>

            {/* Progress Bar */}
            {uploading && (
              <div className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between text-xs text-brand-text">
                  <span>Uploading to private storage & computing SHA-256...</span>
                  <span className="font-mono font-bold">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-brand-red h-2 rounded-full transition-all duration-200"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3">
            <Link
              to="/evidence"
              className="px-5 h-11 border border-brand-border bg-white text-brand-text text-xs sm:text-sm font-semibold rounded-lg hover:bg-gray-50 flex items-center justify-center transition-standard"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={uploading || !file || !selectedParcelId}
              className="px-7 h-11 bg-brand-red hover:bg-brand-red-hover text-white text-xs sm:text-sm font-semibold rounded-lg flex items-center justify-center gap-2 shadow-sm transition-standard disabled:opacity-60"
            >
              {uploading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <ShieldCheck size={16} />
                  <span>Upload & Compute SHA-256</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default UploadEvidence;
