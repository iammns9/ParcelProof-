import React from 'react';
import {
  BarChart3,
  Clock,
  Download,
  Calendar,
  FileSpreadsheet,
  TrendingDown,
  TrendingUp,
  Package,
  ShieldCheck,
  AlertTriangle,
  Info,
} from 'lucide-react';

export const ReportsPlanned = () => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold font-heading text-brand-text">
              Reports & Analytics
            </h1>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-300">
              <Clock size={12} />
              Planned Feature
            </span>
          </div>
          <p className="text-xs sm:text-sm text-brand-muted mt-0.5">
            Courier delivery performance metrics, dispute resolution ratios, and audit logs.
          </p>
        </div>

        {/* Disabled Export Controls */}
        <div className="flex items-center gap-2">
          <div className="relative group">
            <button
              disabled
              className="px-3.5 py-2 bg-gray-200 text-gray-500 text-xs font-semibold rounded-lg cursor-not-allowed flex items-center gap-1.5 border border-gray-300"
              title="Report export is currently unavailable"
            >
              <FileSpreadsheet size={15} />
              <span>Export CSV Manifest</span>
            </button>
            <div className="absolute right-0 top-full mt-1.5 w-56 p-2 bg-[#17191D] text-white text-[11px] rounded-lg shadow-dropdown opacity-0 group-hover:opacity-100 pointer-events-none transition-standard z-20">
              Reporting exports and automated PDF generation are scheduled for a future version.
            </div>
          </div>

          <div className="relative group">
            <button
              disabled
              className="px-3.5 py-2 bg-gray-200 text-gray-500 text-xs font-semibold rounded-lg cursor-not-allowed flex items-center gap-1.5 border border-gray-300"
              title="PDF export is currently unavailable"
            >
              <Download size={15} />
              <span>Download PDF Audit</span>
            </button>
          </div>
        </div>
      </div>

      {/* Planned Notice */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3">
        <Info size={18} className="text-slate-600 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-slate-700 leading-relaxed">
          <span className="font-bold">Interface Specification Preview:</span> This section visualizes the planned metrics architecture for tracking courier performance, return dispute wins, and evidence coverage. Automated generation routines and export endpoints are currently disabled.
        </div>
      </div>

      {/* Report Controls Bar (Mock Form) */}
      <div className="bg-white border border-brand-border rounded-xl p-5 shadow-card space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-brand-text font-heading border-b border-brand-border pb-2.5">
          Report Filter Parameters (Preview)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block text-brand-muted font-semibold mb-1">
              Report Type
            </label>
            <select
              disabled
              className="w-full h-10 px-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
            >
              <option>Courier Success & Shortage Analysis</option>
              <option>Return Condition Audit Log</option>
              <option>Evidence Integrity Manifest</option>
            </select>
          </div>

          <div>
            <label className="block text-brand-muted font-semibold mb-1">
              Courier Filter
            </label>
            <select
              disabled
              className="w-full h-10 px-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
            >
              <option>All Pakistani Couriers (TCS, Leopards, M&P)</option>
            </select>
          </div>

          <div>
            <label className="block text-brand-muted font-semibold mb-1">
              Date Period
            </label>
            <select
              disabled
              className="w-full h-10 px-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
            >
              <option>Last 30 Calendar Days</option>
              <option>Current Fiscal Quarter</option>
              <option>Year to Date</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              disabled
              className="w-full h-10 bg-gray-200 text-gray-500 font-semibold rounded-lg cursor-not-allowed"
            >
              Generate Report View
            </button>
          </div>
        </div>
      </div>

      {/* Intended Metrics Wireframe / Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Metric 1 */}
        <div className="bg-white border border-brand-border rounded-xl p-5 shadow-card space-y-3">
          <div className="flex items-center justify-between text-xs text-brand-muted">
            <span className="font-bold uppercase tracking-wider">
              Evidence Protection Coverage
            </span>
            <ShieldCheck size={18} className="text-brand-success" />
          </div>
          <div className="text-2xl font-extrabold font-heading text-brand-text">
            94.8%
          </div>
          <p className="text-xs text-brand-muted">
            Of all dispatched parcels have cryptographically verified packing video or photos attached.
          </p>
          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
            <div className="bg-brand-success h-2 rounded-full w-[94.8%]" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-brand-border rounded-xl p-5 shadow-card space-y-3">
          <div className="flex items-center justify-between text-xs text-brand-muted">
            <span className="font-bold uppercase tracking-wider">
              Dispute Resolution Win Rate
            </span>
            <TrendingUp size={18} className="text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold font-heading text-brand-text">
            81.2%
          </div>
          <p className="text-xs text-brand-muted">
            Claims successfully recovered when supported by continuous packaging video files.
          </p>
          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-2 rounded-full w-[81.2%]" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-brand-border rounded-xl p-5 shadow-card space-y-3">
          <div className="flex items-center justify-between text-xs text-brand-muted">
            <span className="font-bold uppercase tracking-wider">
              Average Courier Shortage Rate
            </span>
            <AlertTriangle size={18} className="text-brand-red" />
          </div>
          <div className="text-2xl font-extrabold font-heading text-brand-text">
            1.8%
          </div>
          <p className="text-xs text-brand-muted">
            Consignments experiencing weight discrepancies or packaging tampering during transit.
          </p>
          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
            <div className="bg-brand-red h-2 rounded-full w-[1.8%]" />
          </div>
        </div>
      </div>

      {/* Courier Performance Comparison Breakdown Wireframe */}
      <div className="bg-white border border-brand-border rounded-xl p-6 shadow-card space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-brand-text font-heading border-b border-brand-border pb-3">
          Intended Carrier Performance Matrix (Layout Outline)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8F9FA] text-brand-muted font-semibold uppercase tracking-wider text-[11px] border-b border-brand-border">
              <tr>
                <th className="py-3 px-4">Courier Partner</th>
                <th className="py-3 px-4">Shipments Handled</th>
                <th className="py-3 px-4">On-Time Delivery Rate</th>
                <th className="py-3 px-4">Reported Damages</th>
                <th className="py-3 px-4">Dispute Settlement Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-500">
              <tr>
                <td className="py-3 px-4 font-bold text-brand-text">TCS Express</td>
                <td className="py-3 px-4">Sample Data</td>
                <td className="py-3 px-4">92.4%</td>
                <td className="py-3 px-4">0.8%</td>
                <td className="py-3 px-4">5 Business Days</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-brand-text">Leopards Courier</td>
                <td className="py-3 px-4">Sample Data</td>
                <td className="py-3 px-4">89.1%</td>
                <td className="py-3 px-4">1.4%</td>
                <td className="py-3 px-4">7 Business Days</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-brand-text">M&P Express</td>
                <td className="py-3 px-4">Sample Data</td>
                <td className="py-3 px-4">90.5%</td>
                <td className="py-3 px-4">1.1%</td>
                <td className="py-3 px-4">6 Business Days</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportsPlanned;
