import React from 'react';
import { Download, ExternalLink, FileText, Film, Image as ImageIcon } from 'lucide-react';
import Modal from '../common/Modal';
import evidenceService from '../../services/evidenceService';

export const FilePreviewModal = ({ isOpen, onClose, evidence }) => {
  if (!isOpen || !evidence) return null;

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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={evidence.originalFilename}
      subtitle={`Category: ${evidence.evidenceType} • Size: ${formatFileSize(evidence.fileSize)}`}
      maxWidth="max-w-4xl"
    >
      <div className="space-y-4">
        {/* Media Preview Box */}
        <div className="bg-[#17191D] rounded-xl overflow-hidden flex items-center justify-center min-h-[320px] max-h-[500px] border border-gray-800">
          {isImage ? (
            <img
              src={previewUrl}
              alt={evidence.originalFilename}
              className="max-h-[500px] w-auto max-w-full object-contain mx-auto"
            />
          ) : isVideo ? (
            <video
              controls
              className="max-h-[500px] w-full"
              preload="metadata"
            >
              <source src={previewUrl} type={evidence.mimeType} />
              Your browser does not support the video tag.
            </video>
          ) : isPdf ? (
            <div className="w-full h-[450px] flex flex-col items-center justify-center p-6 text-center text-white">
              <FileText size={64} className="text-red-400 mb-4" />
              <h4 className="text-base font-bold font-heading mb-1">
                PDF Document File
              </h4>
              <p className="text-xs text-gray-300 max-w-md mb-6">
                PDF evidence files are securely stored in private repository storage.
              </p>
              <div className="flex gap-3">
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-brand-red text-white text-xs font-semibold rounded-lg hover:bg-brand-red-hover transition-standard"
                >
                  <ExternalLink size={15} />
                  Open in New Tab
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
              <p className="text-sm">Preview not directly supported for this format.</p>
            </div>
          )}
        </div>

        {/* File Metadata Details */}
        <div className="bg-[#F8F9FA] rounded-xl p-4 border border-brand-border grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-brand-muted block text-[11px] uppercase font-semibold">
              Category
            </span>
            <span className="font-medium text-brand-text block mt-0.5">
              {evidence.evidenceType}
            </span>
          </div>
          <div>
            <span className="text-brand-muted block text-[11px] uppercase font-semibold">
              MIME Format
            </span>
            <span className="font-mono text-brand-text block mt-0.5">
              {evidence.mimeType}
            </span>
          </div>
          <div>
            <span className="text-brand-muted block text-[11px] uppercase font-semibold">
              Uploaded On
            </span>
            <span className="font-medium text-brand-text block mt-0.5">
              {new Date(evidence.uploadedAt || evidence.createdAt).toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-brand-muted block text-[11px] uppercase font-semibold">
              File Size
            </span>
            <span className="font-medium text-brand-text block mt-0.5">
              {formatFileSize(evidence.fileSize)}
            </span>
          </div>
        </div>

        {/* SHA-256 Checksum Display */}
        <div>
          <span className="text-[11px] font-bold text-brand-muted uppercase tracking-wider block mb-1">
            SHA-256 Cryptographic Checksum
          </span>
          <div className="font-mono text-xs bg-[#17191D] text-gray-200 p-2.5 rounded-lg break-all select-all border border-gray-700">
            {evidence.sha256Hash}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-2 border-t border-brand-border">
          <span className="text-xs text-brand-muted">
            Stored in private server directory
          </span>
          <div className="flex gap-2">
            <a
              href={downloadUrl}
              download={evidence.originalFilename}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#17191D] text-white text-xs font-semibold rounded-lg hover:bg-black transition-standard"
            >
              <Download size={14} />
              <span>Download Original</span>
            </a>
            <button
              onClick={onClose}
              className="px-4 py-2 border border-brand-border text-brand-text text-xs font-semibold rounded-lg hover:bg-gray-100 transition-standard"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default FilePreviewModal;
