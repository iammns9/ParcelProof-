import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package,
  Truck,
  CheckCircle2,
  ShieldCheck,
  Plus,
  Upload,
  ArrowRight,
  Clock,
  ExternalLink,
  FileText,
  Film,
  Image as ImageIcon,
  Banknote,
  Search,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import dashboardService from '../../services/dashboardService';
import evidenceService from '../../services/evidenceService';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import IntegrityModal from '../../components/evidence/IntegrityModal';
import FilePreviewModal from '../../components/evidence/FilePreviewModal';

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    stats: {
      totalParcels: 0,
      deliveredParcels: 0,
      inTransitParcels: 0,
      totalEvidence: 0,
      totalDeclaredValue: 0,
      statusDistribution: {},
    },
    recentParcels: [],
    recentEvidence: [],
  });
  const [error, setError] = useState(null);

  // Integrity modal state
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [verifyData, setVerifyData] = useState(null);
  const [verifyLoading, setVerifyLoading] = useState(false);

  // Preview modal state
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [selectedEvidence, setSelectedEvidence] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await dashboardService.getSummary();
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      console.error('Failed to load dashboard statistics:', err);
      setError('Could not retrieve dashboard summary metrics from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleVerifyIntegrity = async (evidenceItem) => {
    try {
      setVerifyModalOpen(true);
      setVerifyLoading(true);
      setVerifyData({
        originalFilename: evidenceItem.originalFilename,
        category: evidenceItem.evidenceType,
        parcelCode: evidenceItem.parcelId?.parcelCode || 'N/A',
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
    return <LoadingSpinner fullPage text="Gathering real-time shipment & evidence metrics..." />;
  }

  const { stats, recentParcels, recentEvidence } = data;

  const statCards = [
    {
      title: 'Total Parcels',
      value: stats.totalParcels.toLocaleString(),
      subtext: `PKR ${stats.totalDeclaredValue.toLocaleString()} declared value`,
      icon: Package,
      color: 'text-brand-text',
      bg: 'bg-white',
      border: 'border-brand-border',
    },
    {
      title: 'In Transit',
      value: stats.inTransitParcels.toLocaleString(),
      subtext: 'Active courier shipments',
      icon: Truck,
      color: 'text-amber-600',
      bg: 'bg-white',
      border: 'border-brand-border',
    },
    {
      title: 'Delivered',
      value: stats.deliveredParcels.toLocaleString(),
      subtext: stats.totalParcels > 0
        ? `${Math.round((stats.deliveredParcels / stats.totalParcels) * 100)}% delivery completion`
        : '0% completed',
      icon: CheckCircle2,
      color: 'text-brand-success',
      bg: 'bg-white',
      border: 'border-brand-border',
    },
    {
      title: 'Total Evidence Files',
      value: stats.totalEvidence.toLocaleString(),
      subtext: 'SHA-256 verified records',
      icon: ShieldCheck,
      color: 'text-brand-red',
      bg: 'bg-white',
      border: 'border-brand-border',
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner / Welcome Header */}
      <div className="bg-white border border-brand-border rounded-xl p-6 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-red">
              Courier Evidence Dashboard
            </span>
            <span className="text-gray-300">•</span>
            <span className="text-xs font-semibold text-brand-muted">
              {user?.shopName}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-heading text-brand-text mt-1">
            Welcome back, {user?.fullName}
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted mt-0.5">
            Monitor real-time dispatch progress, maintain packing evidence, and audit dispute readiness.
          </p>
        </div>

        {/* Working Quick Actions */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <Link
            to="/parcels/create"
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-red hover:bg-brand-red-hover text-white text-xs sm:text-sm font-semibold rounded-lg shadow-sm transition-standard"
          >
            <Plus size={16} />
            <span>Add Parcel</span>
          </Link>
          <Link
            to="/evidence/upload"
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#17191D] hover:bg-black text-white text-xs sm:text-sm font-semibold rounded-lg shadow-sm transition-standard"
          >
            <Upload size={16} />
            <span>Upload Evidence</span>
          </Link>
          <Link
            to="/parcels"
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-brand-border hover:bg-gray-50 text-brand-text text-xs sm:text-sm font-semibold rounded-lg transition-standard"
          >
            <span>View Parcels</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className={`p-5 rounded-xl border ${card.border} ${card.bg} shadow-card flex flex-col justify-between`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-muted">
                  {card.title}
                </span>
                <div className={`p-2 rounded-lg bg-gray-50 ${card.color}`}>
                  <Icon size={18} />
                </div>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-extrabold font-heading text-brand-text">
                  {card.value}
                </span>
                <p className="text-xs text-brand-muted mt-1 truncate">
                  {card.subtext}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Shipment Status Distribution Bar */}
      {stats.totalParcels > 0 && (
        <div className="bg-white border border-brand-border rounded-xl p-5 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-text font-heading">
              Shipment Status Breakdown
            </h3>
            <span className="text-xs text-brand-muted">
              {stats.totalParcels} total registered parcels
            </span>
          </div>

          {/* Visual Percentage Distribution Strip */}
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden flex mb-4">
            {stats.statusDistribution.Delivered > 0 && (
              <div
                style={{
                  width: `${(stats.statusDistribution.Delivered / stats.totalParcels) * 100}%`,
                }}
                className="bg-emerald-500 h-full"
                title={`Delivered: ${stats.statusDistribution.Delivered}`}
              />
            )}
            {stats.statusDistribution['In Transit'] > 0 && (
              <div
                style={{
                  width: `${(stats.statusDistribution['In Transit'] / stats.totalParcels) * 100}%`,
                }}
                className="bg-amber-500 h-full"
                title={`In Transit: ${stats.statusDistribution['In Transit']}`}
              />
            )}
            {stats.statusDistribution['Out for Delivery'] > 0 && (
              <div
                style={{
                  width: `${(stats.statusDistribution['Out for Delivery'] / stats.totalParcels) * 100}%`,
                }}
                className="bg-purple-500 h-full"
                title={`Out for Delivery: ${stats.statusDistribution['Out for Delivery']}`}
              />
            )}
            {stats.statusDistribution.Booked > 0 && (
              <div
                style={{
                  width: `${(stats.statusDistribution.Booked / stats.totalParcels) * 100}%`,
                }}
                className="bg-blue-500 h-full"
                title={`Booked: ${stats.statusDistribution.Booked}`}
              />
            )}
            {stats.statusDistribution.Returned > 0 && (
              <div
                style={{
                  width: `${(stats.statusDistribution.Returned / stats.totalParcels) * 100}%`,
                }}
                className="bg-brand-red h-full"
                title={`Returned: ${stats.statusDistribution.Returned}`}
              />
            )}
            {stats.statusDistribution.Cancelled > 0 && (
              <div
                style={{
                  width: `${(stats.statusDistribution.Cancelled / stats.totalParcels) * 100}%`,
                }}
                className="bg-gray-400 h-full"
                title={`Cancelled: ${stats.statusDistribution.Cancelled}`}
              />
            )}
          </div>

          {/* Status Badges Row */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            {Object.entries(stats.statusDistribution).map(([status, count]) => (
              <div
                key={status}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-50 border border-gray-200"
              >
                <StatusBadge status={status} size="xs" showIcon={false} />
                <span className="font-bold text-brand-text">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Two Column Layout: Recent Parcels & Recent Evidence */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Recent Parcels Table */}
        <div className="lg:col-span-2 bg-white border border-brand-border rounded-xl shadow-card overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-5 border-b border-brand-border flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold font-heading text-brand-text">
                  Recent Dispatch Records
                </h3>
                <p className="text-xs text-brand-muted mt-0.5">
                  Latest parcels logged into the ParcelProof custody system
                </p>
              </div>
              <Link
                to="/parcels"
                className="text-xs font-semibold text-brand-red hover:underline flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {recentParcels.length === 0 ? (
              <div className="p-8 text-center">
                <EmptyState
                  title="No parcels registered yet"
                  description="Begin logging your Pakistani courier shipments to attach cryptographic evidence."
                  action={
                    <Link
                      to="/parcels/create"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-red text-white text-xs font-semibold rounded-lg hover:bg-brand-red-hover transition-standard"
                    >
                      <Plus size={14} />
                      <span>Create First Parcel</span>
                    </Link>
                  }
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8F9FA] text-brand-muted border-b border-brand-border font-semibold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3 px-4">Parcel Code</th>
                      <th className="py-3 px-4">Order ID</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Courier</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentParcels.map((parcel) => (
                      <tr
                        key={parcel._id}
                        className="hover:bg-gray-50/75 transition-standard"
                      >
                        <td className="py-3.5 px-4 font-mono font-semibold text-brand-text">
                          {parcel.parcelCode}
                        </td>
                        <td className="py-3.5 px-4 text-brand-text">
                          {parcel.orderId}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-brand-text">
                          {parcel.customerName}
                        </td>
                        <td className="py-3.5 px-4 text-brand-muted">
                          <span className="font-medium text-brand-text">
                            {parcel.courierCompany}
                          </span>
                          <span className="block text-[10px] font-mono text-brand-muted">
                            {parcel.trackingNumber}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusBadge status={parcel.shipmentStatus} size="xs" />
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Link
                            to={`/parcels/${parcel._id}`}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-brand-red hover:underline"
                          >
                            <span>Inspect</span>
                            <ArrowRight size={13} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 span): Recent Evidence Uploads */}
        <div className="bg-white border border-brand-border rounded-xl shadow-card overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-5 border-b border-brand-border flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold font-heading text-brand-text">
                  Recent Packing Evidence
                </h3>
                <p className="text-xs text-brand-muted mt-0.5">
                  Latest files with computed SHA-256
                </p>
              </div>
              <Link
                to="/evidence"
                className="text-xs font-semibold text-brand-red hover:underline flex items-center gap-1"
              >
                <span>Library</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {recentEvidence.length === 0 ? (
              <div className="p-6 text-center">
                <EmptyState
                  title="No evidence uploaded"
                  description="Upload packing photos, videos, or receipts to generate proof."
                  action={
                    <Link
                      to="/evidence/upload"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#17191D] text-white text-xs font-semibold rounded-lg hover:bg-black transition-standard"
                    >
                      <Upload size={14} />
                      <span>Upload Evidence</span>
                    </Link>
                  }
                />
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentEvidence.map((item) => {
                  const isVid = item.mimeType?.startsWith('video/');
                  const isImg = item.mimeType?.startsWith('image/');

                  return (
                    <div
                      key={item._id}
                      className="p-4 hover:bg-gray-50/75 transition-standard space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="p-2 rounded-lg bg-gray-100 text-brand-muted flex-shrink-0">
                            {isVid ? (
                              <Film size={16} />
                            ) : isImg ? (
                              <ImageIcon size={16} />
                            ) : (
                              <FileText size={16} />
                            )}
                          </div>
                          <div className="min-w-0">
                            <button
                              onClick={() => handlePreview(item)}
                              className="text-xs font-semibold text-brand-text hover:text-brand-red truncate block text-left transition-standard"
                            >
                              {item.originalFilename}
                            </button>
                            <span className="text-[11px] text-brand-muted block">
                              {item.evidenceType} • Parcel{' '}
                              <span className="font-mono font-medium text-brand-text">
                                {item.parcelId?.parcelCode || 'N/A'}
                              </span>
                            </span>
                          </div>
                        </div>

                        {/* Verify Integrity Button */}
                        <button
                          onClick={() => handleVerifyIntegrity(item)}
                          className="px-2 py-1 bg-emerald-50 text-brand-success border border-emerald-200 rounded text-[11px] font-semibold hover:bg-emerald-100 transition-standard flex items-center gap-1 flex-shrink-0"
                          title="Run SHA-256 verification against server file"
                        >
                          <ShieldCheck size={12} />
                          <span>Verify</span>
                        </button>
                      </div>

                      {/* Truncated Hash */}
                      <div className="flex items-center gap-2 text-[10px] font-mono text-gray-500 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                        <span className="text-[9px] font-bold text-gray-400 uppercase">
                          SHA-256:
                        </span>
                        <span className="truncate">{item.sha256Hash}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cryptographic Verification Modal */}
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

export default Dashboard;
