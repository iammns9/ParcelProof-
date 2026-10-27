import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  Copy,
  Check,
  FileText,
  Clock,
  Info,
} from 'lucide-react';
import Modal from '../common/Modal';

export const IntegrityModal = ({ isOpen, onClose, data, loading }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const verification = data?.verification;
  const isMatch = verification?.isValid;

  const handleCopyHash = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="SHA-256 Cryptographic Verification"
      subtitle="Server-side byte-level integrity audit against recorded baseline"
      maxWidth="max-w-2xl"
    >
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-full border-4 border-brand-red border-t-transparent animate-spin mb-4"></div>
          <p className="text-sm font-semibold text-brand-text">
            Recalculating SHA-256 Checksum on Server Storage...
          </p>
          <p className="text-xs text-brand-muted mt-1">
            Streaming stored file bytes through Node crypto engine.
          </p>
        </div>
      ) : verification ? (
        <div className="space-y-5">
          {/* Status Banner */}
          <div
            className={`p-4 rounded-xl border flex items-start gap-3.5 ${
              isMatch
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-red-50 border-red-200 text-red-900'
            }`}
          >
            {isMatch ? (
              <ShieldCheck className="w-7 h-7 text-brand-success flex-shrink-0 mt-0.5" />
            ) : (
              <ShieldAlert className="w-7 h-7 text-brand-red flex-shrink-0 mt-0.5" />
            )}
            <div>
              <h4 className="text-sm font-bold font-heading">
                {isMatch ? 'Cryptographic Hash Match: 100% Unaltered' : 'Integrity Mismatch Detected'}
              </h4>
              <p className="text-xs mt-1 leading-relaxed opacity-90">
                {verification.explanation}
              </p>
            </div>
          </div>

          {/* Evidence Meta Card */}
          <div className="bg-[#F8F9FA] rounded-xl p-4 border border-brand-border grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-brand-muted block text-[11px] uppercase font-semibold">
                File Name
              </span>
              <span className="font-medium text-brand-text truncate block mt-0.5">
                {data.originalFilename}
              </span>
            </div>
            <div>
              <span className="text-brand-muted block text-[11px] uppercase font-semibold">
                Category
              </span>
              <span className="font-medium text-brand-text block mt-0.5">
                {data.category}
              </span>
            </div>
            <div>
              <span className="text-brand-muted block text-[11px] uppercase font-semibold">
                Associated Parcel
              </span>
              <span className="font-mono font-medium text-brand-text block mt-0.5">
                {data.parcelCode || 'N/A'}
              </span>
            </div>
          </div>

          {/* Hashes Comparison Table */}
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-brand-text mb-1">
                <span>Stored Database SHA-256 Signature (Recorded at Upload)</span>
                <button
                  type="button"
                  onClick={() => handleCopyHash(verification.expectedHash)}
                  className="text-brand-red hover:underline flex items-center gap-1 text-[11px]"
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="font-mono text-[11px] bg-[#17191D] text-gray-200 p-2.5 rounded-lg break-all select-all border border-gray-700">
                {verification.expectedHash}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-brand-text mb-1">
                <span>Recalculated SHA-256 Checksum (Computed from Disk Storage Just Now)</span>
              </div>
              <div
                className={`font-mono text-[11px] p-2.5 rounded-lg break-all select-all border ${
                  isMatch
                    ? 'bg-[#17191D] text-emerald-400 border-emerald-800'
                    : 'bg-red-950 text-red-300 border-red-800'
                }`}
              >
                {verification.computedHash}
              </div>
            </div>
          </div>

          {/* Legal / Technical Disclaimer Notice */}
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-start gap-2.5 text-[11px] text-brand-muted">
            <Info size={16} className="text-brand-muted mt-0.5 flex-shrink-0" />
            <p className="leading-normal">
              {verification.disclaimer ||
                'SHA-256 comparison detects changes relative to the stored hash; it does not independently prove when the parcel was packed or what was physically shipped.'}
            </p>
          </div>

          {/* Footer Action */}
          <div className="flex justify-end pt-2">
            <button
              onClick={onClose}
              className="px-5 py-2 text-xs font-semibold bg-[#17191D] text-white rounded-lg hover:bg-black transition-standard"
            >
              Close Verification Audit
            </button>
          </div>
        </div>
      ) : null}
    </Modal>
  );
};

export default IntegrityModal;
