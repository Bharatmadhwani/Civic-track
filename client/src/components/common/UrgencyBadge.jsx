import React from 'react';
import { AlertTriangle, AlertCircle, ShieldAlert } from 'lucide-react';

export const UrgencyBadge = ({ urgency }) => {
  switch (urgency) {
    case 'High':
      return (
        <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 gap-1">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
          </span>
          High Priority
        </span>
      );
    case 'Medium':
      return (
        <span className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 gap-1">
          <AlertCircle className="w-3 h-3 text-amber-500" />
          Medium
        </span>
      );
    case 'Low':
    default:
      return (
        <span className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
          Low
        </span>
      );
  }
};
