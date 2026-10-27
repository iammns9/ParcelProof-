import React from 'react';
import { PackageOpen } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = PackageOpen,
  title = 'No records found',
  description = 'There are currently no items matching your criteria.',
  action = null,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-12 text-center bg-white border border-brand-border rounded-lg shadow-card ${className}`}
    >
      <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center text-brand-red mb-4">
        <Icon size={26} strokeWidth={1.75} />
      </div>
      <h3 className="text-base font-semibold text-brand-text mb-1.5 font-heading">
        {title}
      </h3>
      <p className="text-sm text-brand-muted max-w-md mb-6">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;
