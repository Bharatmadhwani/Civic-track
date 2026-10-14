import React from 'react';
import { Clock, AlertCircle, CheckCircle2 } from 'lucide-react';

export const StatusBadge = ({ status, size = 'sm' }) => {
  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1 gap-1.5',
    md: 'text-sm px-3 py-1.5 gap-2',
    lg: 'text-base px-4 py-2 gap-2.5 font-medium',
  };

  switch (status) {
    case 'Pending':
      return (
        <span
          className={`inline-flex items-center font-medium rounded-full bg-amber-50 text-amber-700 border border-amber-200/80 shadow-xs ${sizeClasses[size] || sizeClasses.sm}`}
        >
          <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
          Pending
        </span>
      );
    case 'In Progress':
      return (
        <span
          className={`inline-flex items-center font-medium rounded-full bg-sky-50 text-sky-700 border border-sky-200/80 shadow-xs ${sizeClasses[size] || sizeClasses.sm}`}
        >
          <AlertCircle className="w-3.5 h-3.5 text-sky-600" />
          In Progress
        </span>
      );
    case 'Resolved':
      return (
        <span
          className={`inline-flex items-center font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-xs ${sizeClasses[size] || sizeClasses.sm}`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          Resolved
        </span>
      );
    default:
      return (
        <span
          className={`inline-flex items-center font-medium rounded-full bg-slate-100 text-slate-700 border border-slate-200 ${sizeClasses[size] || sizeClasses.sm}`}
        >
          {status || 'Unknown'}
        </span>
      );
  }
};
