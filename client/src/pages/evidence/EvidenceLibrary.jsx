import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ShieldCheck,
  Upload,
  Search,
  Filter,
  Eye,
  Download,
  Copy,
  FileText,
  Film,
  Image as ImageIcon,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import evidenceService from '../../services/evidenceService';
import parcelService from '../../services/parcelService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import IntegrityModal from '../../components/evidence/IntegrityModal';
import FilePreviewModal from '../../components/evidence/FilePreviewModal';

export const EvidenceLibrary = () => {
  const [searchParams] = useSearchParams();

  const [evidenceList, setEvidenceList] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('type') || 'All');
  const [selectedParcelId, setSelectedParcelId] = useState(searchParams.get('parcelId') || '');
  const [parcels, setParcels] = useState([]);

  // Modals
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [verifyData, setVerifyData] = useState(null);
  const [verifyLoading, setVerifyLoading] = useState(false);

  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [selectedEvidence, setSelectedEvidence] = useState(null);

  // Load seller parcels for filter dropdown
  useEffect(() => {
    const fetchParcels = async () => {
      try {
        const res = await parcelService.getParcels({ limit: 100 });
        if (res.success) {
          setParcels(res.parcels);
        }
      } catch (err) {
        console.error('Failed to load parcels for filter:', err);
      }
    };
    fetchParcels();
  }, []);

  const fetchEvidence = async () => {
    try {
      setLoading(true);
      const res = await evidenceService.getAllEvidence({
        search: searchTerm,
        evidenceType: selectedCategory,
        parcelId: selectedParcelId,
        page: currentPage,
        limit: 12,
      });

      if (res.success) {
        setEvidenceList(res.evidence);
        setTotal(res.total);
        setTotalPages(res.totalPages);
      }
    } catch (err) {
      console.error('Failed to load evidence library:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvidence();
  }, [currentPage, selectedCategory, selectedParcelId]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchEvidence();
  };

  const handleVerify = async (item) => {
    try {
      setVerifyModalOpen(true);
      setVerifyLoading(true);
      setVerifyData({
        originalFilename: item.originalFilename,
        category: item.evidenceType,
        parcelCode: item.parcelId?.parcelCode || 'N/A',
      });

      const res = await evidenceService.verifyIntegrity(item._id);
      if (res.success) {
        setVerifyData(res);
      }
    } catch (err) {
      console.error('Verification failed:', err);
    } finally {
      setVerifyLoading(false);
    }
  };

  const handlePreview = (item) => {
    setSelectedEvidence(item);
    setPreviewModalOpen(true);
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-heading text-brand-text">
            Packing Evidence Library
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted mt-0.5">
            Cryptographic storage repository with real-time SHA-256 verification.
          </p>
        </div>

        <Link
          to="/evidence/upload"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-red hover:bg-brand-red-hover text-white text-xs sm:text-sm font-semibold rounded-lg shadow-sm transition-standard"
        >
          <Upload size={16} />
          <span>Upload Packing Evidence</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-brand-border rounded-xl p-4 shadow-card">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search evidence files by original filename..."
              className="w-full h-10 pl-10 pr-4 text-xs sm:text-sm bg-[#F5F6F8] border border-brand-border rounded-lg text-brand-text placeholder-brand-muted focus:outline-none focus:border-brand-red focus:bg-white"
            />
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none"
            />
          </div>

          <div className="flex flex-wrap sm:flex-nowrap gap-2.5">
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="h-10 px-3 text-xs bg-white border border-brand-border rounded-lg text-brand-text focus:outline-none focus:border-brand-red"
            >
              <option value="All">All Categories</option>
              <option value="Packing Photo">Packing Photo</option>
              <option value="Packing Video">Packing Video</option>
              <option value="Shipping Label">Shipping Label</option>
              <option value="Courier Receipt">Courier Receipt</option>
              <option value="PDF Document">PDF Document</option>
            </select>

            {/* Parcel Filter */}
            <select
              value={selectedParcelId}
              onChange={(e) => {
                setSelectedParcelId(e.target.value);
                setCurrentPage(1);
              }}
              className="h-10 px-3 text-xs bg-white border border-brand-border rounded-lg text-brand-text focus:outline-none focus:border-brand-red max-w-[200px]"
            >
              <option value="">All Parcels</option>
              {parcels.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.parcelCode} ({p.customerName})
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="px-4 h-10 bg-[#17191D] hover:bg-black text-white text-xs font-semibold rounded-lg transition-standard"
            >
              Filter
            </button>
          </div>
        </form>
      </div>

      {/* Evidence Files Cards Grid */}
      {loading ? (
        <LoadingSpinner size="md" text="Loading cryptographic evidence files..." />
      ) : evidenceList.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="No evidence records found"
          description={
            searchTerm || selectedCategory !== 'All' || selectedParcelId
              ? 'No evidence files match your search query or active filter. Try resetting.'
              : 'You have not uploaded any digital packing evidence yet. Protect your first parcel by uploading packing photos or video.'
          }
          action={
            <Link
              to="/evidence/upload"
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-red hover:bg-brand-red-hover text-white text-xs font-semibold rounded-lg shadow-sm transition-standard"
            >
              <Upload size={14} />
              <span>Upload Packing Evidence</span>
            </Link>
          }
        />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {evidenceList.map((item) => {
              const isVid = item.mimeType?.startsWith('video/');
              const isImg = item.mimeType?.startsWith('image/');
              const isPdf = item.mimeType === 'application/pdf';
              const downloadUrl = evidenceService.getDirectUrl(item._id, false);
              const previewUrl = evidenceService.getDirectUrl(item._id, true);

              return (
                <div
                  key={item._id}
                  className="bg-white border border-brand-border rounded-xl shadow-card overflow-hidden flex flex-col justify-between hover:border-gray-300 transition-standard"
                >
                  {/* Card Thumbnail / Preview Banner */}
                  <div
                    onClick={() => handlePreview(item)}
                    className="h-44 bg-[#17191D] relative cursor-pointer group flex items-center justify-center overflow-hidden"
                  >
                    {isImg ? (
                      <img
                        src={previewUrl}
                        alt={item.originalFilename}
                        className="w-full h-full object-cover group-hover:scale-105 transition-standard"
                        loading="lazy"
                      />
                    ) : isVid ? (
                      <div className="flex flex-col items-center justify-center text-white p-4">
                        <div className="w-12 h-12 rounded-full bg-white/10 group-hover:bg-brand-red flex items-center justify-center transition-standard mb-2">
                          <Film size={22} />
                        </div>
                        <span className="text-xs font-medium text-gray-300">
                          Click to Play Video
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-white p-4">
                        <div className="w-12 h-12 rounded-full bg-white/10 group-hover:bg-brand-red flex items-center justify-center transition-standard mb-2">
                          <FileText size={22} />
                        </div>
                        <span className="text-xs font-medium text-gray-300">
                          PDF Document
                        </span>
                      </div>
                    )}

                    {/* Category Tag Overlay */}
                    <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-none px-2.5 py-1 rounded-md text-[10px] font-semibold text-white tracking-wide border border-white/20">
                      {item.evidenceType}
                    </div>

                    {/* Size Overlay */}
                    <div className="absolute bottom-3 right-3 bg-black/70 px-2 py-0.5 rounded text-[10px] font-mono text-gray-300">
                      {formatFileSize(item.fileSize)}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <button
                          onClick={() => handlePreview(item)}
                          className="text-xs sm:text-sm font-bold text-brand-text hover:text-brand-red truncate block text-left transition-standard"
                          title={item.originalFilename}
                        >
                          {item.originalFilename}
                        </button>
                      </div>

                      {/* Associated Parcel Info */}
                      <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                        <span className="text-brand-muted text-[11px]">Parcel:</span>
                        {item.parcelId ? (
                          <Link
                            to={`/parcels/${item.parcelId._id}`}
                            className="font-mono font-semibold text-brand-red hover:underline"
                          >
                            {item.parcelId.parcelCode}
                          </Link>
                        ) : (
                          <span className="text-gray-400">Unlinked</span>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-brand-muted mt-1">
                        <span>Uploaded</span>
                        <span>{new Date(item.uploadedAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* SHA-256 Signature Box */}
                    <div className="space-y-1.5 pt-2">
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-brand-muted">
                        <span>SHA-256 Checksum</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(item.sha256Hash);
                            alert('SHA-256 hash copied to clipboard');
                          }}
                          className="hover:text-brand-text flex items-center gap-1"
                        >
                          <Copy size={11} />
                          <span>Copy</span>
                        </button>
                      </div>
                      <div className="p-2 rounded bg-[#17191D] text-emerald-400 font-mono text-[10px] truncate select-all border border-gray-700">
                        {item.sha256Hash}
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="pt-3 border-t border-brand-border flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleVerify(item)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-3 bg-emerald-50 text-brand-success border border-emerald-200 rounded-lg text-xs font-semibold hover:bg-emerald-100 transition-standard"
                      >
                        <ShieldCheck size={14} />
                        <span>Verify Integrity</span>
                      </button>

                      <a
                        href={downloadUrl}
                        download={item.originalFilename}
                        className="p-1.5 border border-brand-border rounded-lg text-brand-muted hover:text-brand-text hover:bg-gray-100 transition-standard"
                        title="Download Original File"
                      >
                        <Download size={15} />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          <div className="bg-white border border-brand-border rounded-xl px-5 py-4 flex items-center justify-between text-xs text-brand-muted shadow-card">
            <div>
              Showing {(currentPage - 1) * 12 + 1} to{' '}
              {Math.min(currentPage * 12, total)} of {total} evidence files
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

      {/* SHA-256 Cryptographic Verification Modal */}
      <IntegrityModal
        isOpen={verifyModalOpen}
        onClose={() => setVerifyModalOpen(false)}
        data={verifyData}
        loading={verifyLoading}
      />

      {/* Media Preview Modal */}
      <FilePreviewModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        evidence={selectedEvidence}
      />
    </div>
  );
};

export default EvidenceLibrary;
