import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Heart, MapPin, ExternalLink } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center text-white">
                <Shield className="w-4 h-4" />
              </div>
              <span className="font-display font-bold text-lg text-white">
                Civic<span className="text-teal-400">Track</span>
              </span>
            </div>
            <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
              Empowering citizens with a transparent, accountable platform to report potholes,
              broken streetlights, garbage dumps, and water infrastructure issues directly to local authorities.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <MapPin className="w-4 h-4 text-teal-400" />
              <span>Smart Community Governance &middot; Open Civic Tech</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/issues" className="hover:text-teal-400 transition">
                  Browse Community Feed
                </Link>
              </li>
              <li>
                <Link to="/report" className="hover:text-teal-400 transition">
                  Submit Issue Report
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-teal-400 transition">
                  Citizen Dashboard
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-teal-400 transition">
                  Administration Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Governance & Guidelines */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3">
              Transparency
            </h4>
            <ul className="space-y-2 text-sm">
              <li className="text-slate-400">
                Resolution Timeline Verification
              </li>
              <li className="text-slate-400">
                Community Upvoting Protocol
              </li>
              <li className="text-slate-400">
                Public Infrastructure Auditing
              </li>
              <li className="text-slate-400">
                Data Privacy & Security
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>&copy; {new Date().getFullYear()} CivicTrack Platform. Built for open community impact.</p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>for Modern Smart Communities</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
