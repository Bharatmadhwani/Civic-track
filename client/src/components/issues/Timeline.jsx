import React from 'react';
import { Clock, CheckCircle2, AlertCircle, ShieldCheck, User } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';

export const Timeline = ({ history = [], currentStatus }) => {
  if (!history || history.length === 0) {
    return (
      <div className="text-center py-6 text-xs text-slate-400">
        No administrative history records found for this issue.
      </div>
    );
  }

  // Sort history chronologically (latest at top or bottom; usually top is clearest for latest status)
  const sortedHistory = [...history].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
      {sortedHistory.map((item, index) => {
        const isLatest = index === 0;
        const formattedDate = new Date(item.timestamp).toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });

        const iconBg = {
          Resolved: 'bg-emerald-500 text-white ring-4 ring-emerald-100',
          'In Progress': 'bg-sky-500 text-white ring-4 ring-sky-100',
          Pending: 'bg-amber-500 text-white ring-4 ring-amber-100',
        }[item.status] || 'bg-slate-400 text-white';

        return (
          <div key={item._id || index} className="relative group">
            {/* Dot / Pin */}
            <div
              className={`absolute -left-6 top-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${iconBg} transition-transform group-hover:scale-110`}
            >
              {item.status === 'Resolved' ? (
                <CheckCircle2 className="w-3 h-3" />
              ) : item.status === 'In Progress' ? (
                <AlertCircle className="w-3 h-3" />
              ) : (
                <Clock className="w-3 h-3" />
              )}
            </div>

            {/* Event Content Box */}
            <div
              className={`p-4 rounded-xl border transition ${
                isLatest
                  ? 'bg-white border-teal-200 shadow-sm'
                  : 'bg-slate-50/70 border-slate-200'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <StatusBadge status={item.status} size="sm" />
                  {isLatest && (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full">
                      Current State
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-400">{formattedDate}</span>
              </div>

              {/* Note / Action comment */}
              <p className="text-xs text-slate-700 font-medium leading-relaxed mt-1">
                {item.note || 'Status transitioned.'}
              </p>

              {/* Author Attribution */}
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-2.5 pt-2 border-t border-slate-100">
                <ShieldCheck className="w-3 h-3 text-teal-600" />
                <span>
                  Recorded by: <strong className="text-slate-600">{item.changedByName || 'System Officer'}</strong>
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
