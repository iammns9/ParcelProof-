import React from 'react';
import {
  Package,
  Truck,
  MapPin,
  CheckCircle2,
  RotateCcw,
  XCircle,
  Clock,
  Sparkles,
} from 'lucide-react';

const STATUS_CONFIGS = {
  Booked: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    icon: Package,
  },
  'In Transit': {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    icon: Truck,
  },
  'Out for Delivery': {
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    icon: MapPin,
  },
  Delivered: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    icon: CheckCircle2,
  },
  Returned: {
    bg: 'bg-red-50',
    text: 'text-brand-red',
    border: 'border-red-200',
    icon: RotateCcw,
  },
  Cancelled: {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    border: 'border-gray-200',
    icon: XCircle,
  },
  Planned: {
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    border: 'border-slate-300',
    icon: Clock,
  },
};

export const StatusBadge = ({ status, size = 'sm', showIcon = true, className = '' }) => {
  const config = STATUS_CONFIGS[status] || STATUS_CONFIGS.Booked;
  const Icon = config.icon;

  const sizeClasses = {
    xs: 'px-2 py-0.5 text-xs',
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
  };

  const iconSizes = {
    xs: 12,
    sm: 14,
    md: 16,
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${config.bg} ${config.text} ${config.border} ${sizeClasses[size] || sizeClasses.sm} ${className}`}
    >
      {showIcon && <Icon size={iconSizes[size] || 14} className="flex-shrink-0" />}
      <span>{status}</span>
    </span>
  );
};

export default StatusBadge;
