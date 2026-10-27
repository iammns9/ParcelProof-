import React, { useState } from 'react';
import {
  RotateCcw,
  Clock,
  ArrowRight,
  ShieldCheck,
  SplitSquareVertical,
  CheckCircle2,
  AlertCircle,
  Package,
  FileText,
  Info,
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';

export const ReturnsPlanned = () => {
  const [activeTab, setActiveTab] = useState('comparison');

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Title & Planned Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold font-heading text-brand-text">
              Return Inspection & Comparison
            </h1>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-300">
              <Clock size={12} />
              Planned Feature
            </span>
          </div>
          <p className="text-xs sm:text-sm text-brand-muted mt-0.5">
            Audit returned customer consignments against original dispatch packing evidence.
          </p>
        </div>

        {/* Disabled Action with explanatory indicator */}
        <div className="relative group">
          <button
            disabled
            className="px-4 py-2.5 bg-gray-200 text-gray-500 text-xs sm:text-sm font-semibold rounded-lg cursor-not-allowed flex items-center gap-2 border border-gray-300"
            title="Feature Planned — Action currently unavailable"
          >
            <RotateCcw size={16} />
            <span>Initiate Return Audit</span>
          </button>
          <div className="absolute right-0 top-full mt-1.5 w-60 p-2.5 bg-[#17191D] text-white text-[11px] rounded-lg shadow-dropdown opacity-0 group-hover:opacity-100 pointer-events-none transition-standard z-20">
            Return audit persistence and submission workflows are planned for an upcoming release.
          </div>
        </div>
      </div>

      {/* Planned Feature Banner */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3">
        <Info size={18} className="text-slate-600 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-slate-700 leading-relaxed">
          <span className="font-bold">Interface Specification Preview:</span> This screen represents the planned user interface architecture for comparing customer returns with original packing proof. Interactive submissions and return databases are not active yet.
        </div>
      </div>

      {/* Layout Grid: Return Records & Comparison Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Intended Return Cases Queue */}
        <div className="bg-white border border-brand-border rounded-xl shadow-card overflow-hidden">
          <div className="p-4 border-b border-brand-border bg-gray-50/50 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-text font-heading">
              Return Cases Queue
            </h3>
            <span className="text-[11px] text-brand-muted font-medium">Preview Structure</span>
          </div>

          <div className="divide-y divide-gray-100 text-xs">
            {/* Demonstration Sample Item 1 */}
            <div className="p-4 bg-red-50/30 border-l-4 border-brand-red space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-brand-text">RET-2026-081</span>
                <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Pending Inspection
                </span>
              </div>
              <p className="text-xs text-brand-text font-medium">
                Parcel PRCL-TK8829 (Order #90214)
              </p>
              <div className="text-[11px] text-brand-muted">
                Reason: "Wrong item in box / Broken seal claim"
              </div>
              <div className="flex items-center justify-between text-[10px] text-brand-muted pt-1">
                <span>Carrier: Leopards</span>
                <span>Returned: 2 days ago</span>
              </div>
            </div>

            {/* Demonstration Sample Item 2 */}
            <div className="p-4 opacity-75 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-brand-text">RET-2026-079</span>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Verified Fraud
                </span>
              </div>
              <p className="text-xs text-brand-text font-medium">
                Parcel PRCL-KL4411 (Order #89301)
              </p>
              <div className="text-[11px] text-brand-muted">
                Reason: "Customer returned used damaged unit"
              </div>
            </div>
          </div>
        </div>

        {/* Center & Right (2 spans): Side-by-Side Comparison Workspace */}
        <div className="lg:col-span-2 bg-white border border-brand-border rounded-xl shadow-card overflow-hidden space-y-5 p-6">
          <div className="flex items-center justify-between border-b border-brand-border pb-4">
            <div>
              <span className="text-[11px] font-mono font-bold text-brand-red uppercase">
                Return Audit Workspace (Preview)
              </span>
              <h3 className="text-base font-bold font-heading text-brand-text mt-0.5">
                Comparison: PRCL-TK8829 vs. Returned Consignment
              </h3>
            </div>
            <span className="text-xs text-brand-muted font-mono">TCS CN #8849201</span>
          </div>

          {/* Side by Side Image Comparison Canvas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Original Dispatch Evidence */}
            <div className="border border-brand-border rounded-xl overflow-hidden bg-gray-50 flex flex-col justify-between">
              <div className="p-3 bg-gray-100 border-b border-gray-200 flex items-center justify-between text-xs">
                <span className="font-bold text-brand-text flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-brand-success" />
                  Original Dispatch Packing Evidence
                </span>
                <span className="text-[10px] font-mono bg-white px-1.5 py-0.5 rounded border border-gray-200">
                  SHA-256 Verified
                </span>
              </div>

              <div className="h-56 bg-[#17191D] flex flex-col items-center justify-center p-6 text-center text-gray-300">
                <Package size={36} className="text-gray-500 mb-2" />
                <span className="text-xs font-semibold text-white">
                  Original Sealed Dispatch Photo
                </span>
                <span className="text-[10px] text-gray-400 mt-1">
                  SHA-256: e3b0c44298fc1c149afbf4c8996fb92427ae41e...
                </span>
              </div>

              <div className="p-3 bg-white text-xs space-y-1">
                <div className="flex justify-between text-brand-muted text-[11px]">
                  <span>Product:</span>
                  <span className="font-medium text-brand-text">Wireless Headset (Sealed)</span>
                </div>
                <div className="flex justify-between text-brand-muted text-[11px]">
                  <span>Seal Serial:</span>
                  <span className="font-mono text-brand-text">PK-SEAL-88219</span>
                </div>
              </div>
            </div>

            {/* Returned Item Inspection Evidence */}
            <div className="border border-brand-border rounded-xl overflow-hidden bg-gray-50 flex flex-col justify-between">
              <div className="p-3 bg-gray-100 border-b border-gray-200 flex items-center justify-between text-xs">
                <span className="font-bold text-brand-text flex items-center gap-1.5">
                  <RotateCcw size={14} className="text-brand-red" />
                  Received Return Parcel Photo
                </span>
                <span className="text-[10px] font-mono bg-red-50 text-brand-red px-1.5 py-0.5 rounded border border-red-200">
                  Tampered Seal
                </span>
              </div>

              <div className="h-56 bg-[#17191D] flex flex-col items-center justify-center p-6 text-center text-gray-300">
                <SplitSquareVertical size={36} className="text-gray-500 mb-2" />
                <span className="text-xs font-semibold text-white">
                  Incoming Return Intake Photography
                </span>
                <span className="text-[10px] text-gray-400 mt-1">
                  Intake timestamp recorded at unboxing
                </span>
              </div>

              <div className="p-3 bg-white text-xs space-y-1">
                <div className="flex justify-between text-brand-muted text-[11px]">
                  <span>Returned Condition:</span>
                  <span className="font-medium text-brand-red">Seal Broken / Shell Scratched</span>
                </div>
                <div className="flex justify-between text-brand-muted text-[11px]">
                  <span>Received Serial:</span>
                  <span className="font-mono text-brand-text">NON-MATCHING</span>
                </div>
              </div>
            </div>
          </div>

          {/* Condition Inspection Checklist */}
          <div className="bg-[#F8F9FA] rounded-xl p-4 border border-brand-border space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-text font-heading">
              Return Condition Audit Criteria
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-200 opacity-60 cursor-not-allowed">
                <input type="checkbox" disabled checked readOnly className="rounded text-brand-red" />
                <span className="text-brand-text">Outer Box Intact</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-200 opacity-60 cursor-not-allowed">
                <input type="checkbox" disabled checked readOnly className="rounded text-brand-red" />
                <span className="text-brand-text">Security Tape Cut</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-200 opacity-60 cursor-not-allowed">
                <input type="checkbox" disabled className="rounded text-brand-red" />
                <span className="text-brand-text">Original Accessories Present</span>
              </div>
            </div>
          </div>

          {/* Bottom Actions Disabled */}
          <div className="flex items-center justify-between pt-2 border-t border-brand-border text-xs text-brand-muted">
            <span>Actions disabled in planned preview mode</span>
            <div className="flex gap-2">
              <button
                disabled
                className="px-4 py-2 border border-gray-300 text-gray-400 rounded-lg cursor-not-allowed text-xs font-semibold"
              >
                Mark Valid Return
              </button>
              <button
                disabled
                className="px-4 py-2 bg-gray-200 text-gray-500 rounded-lg cursor-not-allowed text-xs font-semibold"
              >
                Escalate to Dispute Dossier
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReturnsPlanned;
