import React from 'react';

export const StatCard = ({
  icon: Icon,
  title,
  value,
  subtitle,
  badgeText,
  badgeColor = 'bg-teal-50 text-teal-700',
  iconBg = 'bg-teal-50 text-teal-600',
}) => {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-subtle hover:shadow-card transition-smooth relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconBg}`}>
          <Icon className="w-6 h-6" />
        </div>
        {badgeText && (
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${badgeColor}`}>
            {badgeText}
          </span>
        )}
      </div>
      <div>
        <h4 className="text-sm font-medium text-slate-500 mb-1">{title}</h4>
        <div className="text-3xl font-bold font-display text-slate-900 tracking-tight">
          {value}
        </div>
        {subtitle && (
          <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};
