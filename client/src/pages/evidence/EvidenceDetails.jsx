import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ShieldCheck,
  Download,
  Copy,
  ExternalLink,
  FileText,
  Film,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Package,
} from 'lucide-react';
import evidenceService from '../../services/evidenceService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import IntegrityModal from '../../components/evidence/IntegrityModal';

export const EvidenceDetails = () => {
  const { id } = useParams();

  const [evidence, setEvidence] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Integrity modal
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [verifyData, setVerifyData] = useState(null);
  const [verifyLoading, setVerifyLoading] = useState(false);

  useEffect(() => {
    const fetchEvidence = async () => {
      try {
        setLoading(true);
        const res = await evidenceService.getEvidenceById(id);
        if (res.success && res.evidence) {
          setEvidence(res.evidence);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Evidence record not found.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvidence();
  }, [id]);

  const handleVerify = async () => {
    try {
      setVerifyModalOpen(true);
      setVerifyLoading(true);
      setVerifyData({
        originalFilename: evidence.originalFilename,
        category: evidence.evidenceType,
        parcelCode: evidence.parcelId?.parcelCode,
      });

      const res = await evidenceService.verifyIntegrity(evidence._id);
      if (res.success) {
        setVerifyData(res);
      }
    } catch (err) {
      console.error('Integrity check failed:', err);
    } finally {
      setVerifyLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullPage text="Retrieving evidence record and verification status..." />;
  }

  if (error || !evidence) {
    return (
      <div className="max-w-xl mx-auto py-12">
        <EmptyState
          title="Evidence Record Not Found"
          description={error || 'The requested evidence file could not be loaded.'}
          action={
            <Link
              to="/evidence"
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-red text-white text-xs font-semibold rounded-lg hover:bg-brand-red-hover"
            >
              <ArrowLeft size={14} />
              <span>Back to Evidence Library</span>
            </Link>
          }
        />
      </div>
    );
  }

  const mime = evidence.mimeType?.toLowerCase() || '';
  const isImage = mime.startsWith('image/');
  const isVideo = mime.startsWith('video/');
  const isPdf = mime === 'application/pdf';

  const previewUrl = evidenceService.getDirectUrl(evidence._id, true);
  const downloadUrl = evidenceService.getDirectUrl(evidence._id, false);

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/evidence"
            className="p-2 border border-brand-border rounded-lg bg-white text-brand-muted hover:text-brand-text hover:bg-gray-50 transition-standard"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-heading text-brand-text truncate max-w-lg">
              {evidence.originalFilename}
            </h1>
            <p className="text-xs sm:text-sm text-brand-muted mt-0.5">
              Category: {evidence.evidenceType} • Uploaded on{' '}
              {new Date(evidence.uploadedAt).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleVerify}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-brand-success border border-emerald-200 rounded-lg text-xs font-semibold hover:bg-emerald-100 transition-standard"
          >
            <ShieldCheck size={15} />
            <span>Verify Integrity</span>
          </button>
          <a
            href={downloadUrl}
            download={evidence.originalFilename}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#17191D] hover:bg-black text-white rounded-lg text-xs font-semibold transition-standard"
          >
            <Download size={15} />
            <span>Download</span>
          </a>
        </div>
      </div>

      {/* Media Preview Box */}
      <div className="bg-[#17191D] rounded-xl overflow-hidden flex items-center justify-center min-h-[350px] max-h-[550px] border border-gray-800 shadow-card">
        {isImage ? (
          <img
            src={previewUrl}
            alt={evidence.originalFilename}
            className="max-h-[550px] w-auto max-w-full object-contain mx-auto"
          />
        ) : isVideo ? (
          <video controls className="max-h-[550px] w-full" preload="metadata">
            <source src={previewUrl} type={evidence.mimeType} />
            Your browser does not support the video tag.
          </video>
        ) : isPdf ? (
          <div className="w-full h-[450px] flex flex-col items-center justify-center p-6 text-center text-white">
            <FileText size={64} className="text-red-400 mb-4" />
            <h4 className="text-base font-bold font-heading mb-1">
              PDF Dispatch Document
            </h4>
            <p className="text-xs text-gray-300 max-w-md mb-6">
              Stored securely in private backend storage.
            </p>
            <div className="flex gap-3">
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-brand-red text-white text-xs font-semibold rounded-lg hover:bg-brand-red-hover transition-standard"
              >
                <ExternalLink size={15} />
                Open PDF in New Tab
              </a>
              <a
                href={downloadUrl}
                download={evidence.originalFilename}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700 text-white text-xs font-semibold rounded-lg hover:bg-gray-600 transition-standard"
              >
                <Download size={15} />
                Download PDF
              </a>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-300">
            <FileText size={48} className="mx-auto mb-2 text-gray-500" />
            <p className="text-sm">Preview not available for this format.</p>
          </div>
        )}
      </div>

      {/* Metadata & Associated Parcel Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* File Technical Metadata */}
        <div className="bg-white border border-brand-border rounded-xl p-5 shadow-card space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-brand-text font-heading border-b border-brand-border pb-2.5">
            Cryptographic & Storage Metadata
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-gray-100">
              <span className="text-brand-muted">MIME Content Type:</span>
              <span className="font-mono font-medium text-brand-text">{evidence.mimeType}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-gray-100">
              <span className="text-brand-muted">File Size:</span>
              <span className="font-medium text-brand-text">{formatFileSize(evidence.fileSize)}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-gray-100">
              <span className="text-brand-muted">Upload Timestamp:</span>
              <span className="font-medium text-brand-text">
                {new Date(evidence.uploadedAt).toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-brand-muted block text-[11px] uppercase font-semibold mb-1">
                SHA-256 Digest Checksum
              </span>
              <div className="p-2.5 bg-[#17191D] text-emerald-400 font-mono text-[11px] rounded-lg break-all select-all border border-gray-700">
                {evidence.sha256Hash}
              </div>
            </div>
          </div>
        </div>

        {/* Associated Parcel Info */}
        <div className="bg-white border border-brand-border rounded-xl p-5 shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-brand-border pb-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-text font-heading">
              Associated Parcel Record
            </h3>
            {evidence.parcelId && (
              <Link
                to={`/parcels/${evidence.parcelId._id}`}
                className="text-xs font-semibold text-brand-red hover:underline flex items-center gap-1"
              >
                <span>View Full Record</span>
                <ExternalLink size={12} />
              </Link>
            )}
          </div>

          {evidence.parcelId ? (
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-gray-100">
                <span className="text-brand-muted">Parcel Code:</span>
                <span className="font-mono font-bold text-brand-text">
                  {evidence.parcelId.parcelCode}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-gray-100">
                <span className="text-brand-muted">Order ID:</span>
                <span className="font-medium text-brand-text">
                  {evidence.parcelId.orderId}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-gray-100">
                <span className="text-brand-muted">Customer Name:</span>
                <span className="font-medium text-brand-text">
                  {evidence.parcelId.customerName}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-gray-100">
                <span className="text-brand-muted">Courier / Tracking:</span>
                <span className="font-medium text-brand-text">
                  {evidence.parcelId.courierCompany} ({evidence.parcelId.trackingNumber})
                </span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-brand-muted py-4 text-center">
              No parcel linked to this evidence.
            </p>
          )}
        </div>
      </div>

      {/* SHA-256 Cryptographic Verification Modal */}
      <IntegrityModal
        isOpen={verifyModalOpen}
        onClose={() => setVerifyModalOpen(false)}
        data={verifyData}
        loading={verifyLoading}
      />
    </div>
  );
};

export default EvidenceDetails;
