import React from 'react';
import {
  Scale,
  Clock,
  AlertTriangle,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Building,
  Info,
} from 'lucide-react';

export const DisputesPlanned = () => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold font-heading text-brand-text">
              Dispute Case Management
            </h1>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-300">
              <Clock size={12} />
              Planned Feature
            </span>
          </div>
          <p className="text-xs sm:text-sm text-brand-muted mt-0.5">
            Assemble cryptographically signed evidence dossiers for courier shortfall and loss arbitration.
          </p>
        </div>

        {/* Disabled Action */}
        <div className="relative group">
          <button
            disabled
            className="px-4 py-2.5 bg-gray-200 text-gray-500 text-xs sm:text-sm font-semibold rounded-lg cursor-not-allowed flex items-center gap-2 border border-gray-300"
            title="Feature Planned — Action currently unavailable"
          >
            <Scale size={16} />
            <span>File New Dispute Case</span>
          </button>
          <div className="absolute right-0 top-full mt-1.5 w-60 p-2.5 bg-[#17191D] text-white text-[11px] rounded-lg shadow-dropdown opacity-0 group-hover:opacity-100 pointer-events-none transition-standard z-20">
            Dispute claims management and courier portal integrations are scheduled for a future update.
          </div>
        </div>
      </div>

      {/* Planned Notice */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3">
        <Info size={18} className="text-slate-600 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-slate-700 leading-relaxed">
          <span className="font-bold">Interface Specification Preview:</span> This section outlines the intended workflow for assembling courier claim dossiers, tracking arbitration statuses, and submitting SHA-256 evidence to Pakistani logistics providers.
        </div>
      </div>

      {/* Main Grid: Dispute List & Dossier Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (1 span): Active Dispute Cases List */}
        <div className="bg-white border border-brand-border rounded-xl shadow-card overflow-hidden">
          <div className="p-4 border-b border-brand-border bg-gray-50/50 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-text font-heading">
              Arbitration Cases
            </h3>
            <span className="text-[11px] text-brand-muted">Preview List</span>
          </div>

          <div className="divide-y divide-gray-100 text-xs">
            {/* Spec Demonstration Card 1 */}
            <div className="p-4 bg-amber-50/30 border-l-4 border-amber-500 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-brand-text">DSP-2026-004</span>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                  Under Courier Review
                </span>
              </div>
              <p className="font-semibold text-brand-text">
                TCS Shortage Claim: Missing Item
              </p>
              <div className="text-[11px] text-brand-muted">
                Consignment: CN #7739102 • Claim: PKR 14,500
              </div>
              <div className="text-[10px] text-gray-500 pt-1 flex justify-between">
                <span>Filed: Oct 2026</span>
                <span>Response Due: 3 days</span>
              </div>
            </div>

            {/* Spec Demonstration Card 2 */}
            <div className="p-4 opacity-75 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-brand-text">DSP-2026-002</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                  Claim Settled
                </span>
              </div>
              <p className="font-semibold text-brand-text">
                Leopards Transit Damage Reimbursement
              </p>
              <div className="text-[11px] text-brand-muted">
                Consignment: CN #551920 • Settled: PKR 9,200
              </div>
            </div>
          </div>
        </div>

        {/* Right (2 spans): Dispute Case Dossier Details */}
        <div className="lg:col-span-2 bg-white border border-brand-border rounded-xl shadow-card p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-brand-border pb-4">
            <div>
              <span className="text-[11px] font-mono font-bold text-amber-600 uppercase">
                Case Dossier: DSP-2026-004
              </span>
              <h2 className="text-base font-bold font-heading text-brand-text mt-0.5">
                Damaged Delivery & Seal Tampering Claim
              </h2>
            </div>
            <span className="px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-full text-xs font-semibold">
              Under Review by TCS Express
            </span>
          </div>

          {/* Dossier Meta Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-[#F8F9FA] rounded-xl border border-brand-border text-xs">
            <div>
              <span className="text-brand-muted block text-[11px] uppercase font-semibold">
                Courier Carrier
              </span>
              <span className="font-bold text-brand-text mt-0.5 block">
                TCS Express
              </span>
            </div>
            <div>
              <span className="text-brand-muted block text-[11px] uppercase font-semibold">
                Claim Amount
              </span>
              <span className="font-bold font-mono text-brand-red mt-0.5 block">
                PKR 14,500
              </span>
            </div>
            <div>
              <span className="text-brand-muted block text-[11px] uppercase font-semibold">
                Assigned Officer
              </span>
              <span className="font-medium text-brand-text mt-0.5 block">
                Claims Hub #4
              </span>
            </div>
            <div>
              <span className="text-brand-muted block text-[11px] uppercase font-semibold">
                Evidence Files Attached
              </span>
              <span className="font-bold text-brand-text mt-0.5 block">
                3 Certified Files
              </span>
            </div>
          </div>

          {/* Supporting Evidence Cryptographic Dossier */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-text font-heading">
              Certified Supporting Evidence Dossier
            </h4>
            <div className="space-y-2 text-xs">
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck size={16} className="text-brand-success" />
                  <div>
                    <span className="font-medium text-brand-text">
                      Pre-dispatch Packing Video (60s continuous packaging)
                    </span>
                    <span className="block font-mono text-[10px] text-gray-500">
                      SHA-256: 4a2b8e...3991
                    </span>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Integrity Verified
                </span>
              </div>

              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck size={16} className="text-brand-success" />
                  <div>
                    <span className="font-medium text-brand-text">
                      Courier Booking Rider Handover Slip
                    </span>
                    <span className="block font-mono text-[10px] text-gray-500">
                      SHA-256: 9f12c7...8810
                    </span>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Integrity Verified
                </span>
              </div>
            </div>
          </div>

          {/* Case Activity Timeline */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-text font-heading">
              Case Arbitration Timeline
            </h4>
            <div className="pl-4 border-l-2 border-gray-200 space-y-4 text-xs">
              <div className="relative">
                <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-brand-red" />
                <span className="font-bold text-brand-text">
                  Dossier Submitted to Courier Claims Dept
                </span>
                <span className="text-[11px] text-brand-muted block">
                  SHA-256 verification certificates bundled with manifest
                </span>
              </div>
              <div className="relative">
                <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-gray-400" />
                <span className="font-medium text-brand-text">
                  Customer Return Inspection Tamper Confirmed
                </span>
                <span className="text-[11px] text-brand-muted block">
                  Photographic evidence confirms unboxing discrepancy
                </span>
              </div>
            </div>
          </div>

          {/* Action Disabled Notice */}
          <div className="flex items-center justify-between pt-4 border-t border-brand-border text-xs text-brand-muted">
            <span>Actions disabled in planned preview mode</span>
            <div className="flex gap-2">
              <button
                disabled
                className="px-4 py-2 border border-gray-300 text-gray-400 rounded-lg cursor-not-allowed font-semibold"
              >
                Export Claim PDF
              </button>
              <button
                disabled
                className="px-4 py-2 bg-gray-200 text-gray-500 rounded-lg cursor-not-allowed font-semibold"
              >
                Submit Courier Rebuttal
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisputesPlanned;
