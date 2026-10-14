import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Home, Compass } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="max-w-md mx-auto py-24 px-4 text-center space-y-6">
      <div className="w-16 h-16 mx-auto rounded-3xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shadow-xs">
        <ShieldAlert className="w-8 h-8 text-teal-600" />
      </div>
      <div>
        <span className="text-4xl font-extrabold font-display text-slate-900 block">404</span>
        <h1 className="text-xl font-bold font-display text-slate-800 mt-1">
          Page Not Found
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-xs mx-auto mt-2">
          The civic resource, tracking ID, or route you are looking for does not exist or has been relocated.
        </p>
      </div>

      <div className="flex items-center justify-center gap-3 pt-2">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl transition shadow-xs"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>
        <Link
          to="/issues"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Browse Issues</span>
        </Link>
      </div>
    </div>
  );
};
