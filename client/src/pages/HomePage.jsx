import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  PlusCircle,
  Compass,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Users,
  MapPin,
  TrendingUp,
  FileText,
  Flame,
} from 'lucide-react';
import { dashboardService } from '../services/dashboardService';
import { issueService } from '../services/issueService';
import { StatCard } from '../components/common/StatCard';
import { IssueCard } from '../components/issues/IssueCard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const HomePage = () => {
  const [stats, setStats] = useState(null);
  const [recentIssues, setRecentIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashData, issuesData] = await Promise.all([
          dashboardService.getStats(),
          issueService.getIssues({ limit: 6, sort: 'newest' }),
        ]);
        setStats(dashData.stats);
        setRecentIssues(issuesData.issues || []);
      } catch (err) {
        console.error('Error fetching landing page data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8 rounded-b-[2.5rem] shadow-xl">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-teal-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-300 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Smart Community Issue Reporting Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-display tracking-tight leading-tight">
            Empower Your Neighborhood. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-teal-200 to-cyan-400">
              Track Real Resolution.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-slate-300 text-base sm:text-lg leading-relaxed">
            Report potholes, broken streetlights, garbage dumps, and water leaks directly to local authorities.
            Community upvoting guarantees collective priorities are resolved transparently.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              to="/report"
              className="px-6 py-3.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm transition-smooth shadow-lg shadow-teal-500/20 flex items-center gap-2 group"
            >
              <PlusCircle className="w-5 h-5 text-slate-950 group-hover:rotate-90 transition-transform duration-300" />
              Report an Issue Now
            </Link>

            <Link
              to="/issues"
              className="px-6 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-white font-semibold text-sm transition-smooth border border-slate-700/80 backdrop-blur-md flex items-center gap-2"
            >
              <Compass className="w-5 h-5 text-teal-400" />
              Explore Community Feed
            </Link>
          </div>

          {/* Quick Demo Credentials Banner for Judges */}
          <div className="pt-6 max-w-xl mx-auto">
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 text-xs text-slate-400 flex flex-wrap items-center justify-center gap-3">
              <span className="font-semibold text-teal-400">⚡ Hackathon Demo Access:</span>
              <span>Admin: <code className="text-white bg-slate-900 px-1.5 py-0.5 rounded">admin@civictrack.org</code> / <code className="text-white bg-slate-900 px-1.5 py-0.5 rounded">Admin@12345</code></span>
            </div>
          </div>
        </div>
      </section>

      {/* Real-time Community Stats Counter */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={FileText}
            title="Total Reported Issues"
            value={stats ? stats.total : '—'}
            subtitle="Verified citizen complaints"
            iconBg="bg-blue-50 text-blue-600"
          />
          <StatCard
            icon={Clock}
            title="Pending Assessment"
            value={stats ? stats.pending : '—'}
            subtitle="Awaiting municipal review"
            iconBg="bg-amber-50 text-amber-600"
            badgeText="In Queue"
            badgeColor="bg-amber-100 text-amber-800"
          />
          <StatCard
            icon={AlertCircle}
            title="Under Field Repair"
            value={stats ? stats.inProgress : '—'}
            subtitle="Crews actively working"
            iconBg="bg-sky-50 text-sky-600"
            badgeText="Active"
            badgeColor="bg-sky-100 text-sky-800"
          />
          <StatCard
            icon={CheckCircle2}
            title="Successfully Resolved"
            value={stats ? stats.resolved : '—'}
            subtitle={stats ? `${stats.resolutionRate}% resolution rate` : 'Verified fixes'}
            iconBg="bg-emerald-50 text-emerald-600"
            badgeText="Verified"
            badgeColor="bg-emerald-100 text-emerald-800"
          />
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 mb-3">
            How CivicTrack Restores Public Trust
          </h2>
          <p className="text-slate-600 text-sm">
            A transparent 3-step loop linking citizen vigilance with accountable government resolution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-subtle text-center space-y-3 relative">
            <div className="w-12 h-12 mx-auto rounded-xl bg-teal-50 text-teal-600 font-bold font-display text-lg flex items-center justify-center border border-teal-100">
              1
            </div>
            <h3 className="text-base font-bold text-slate-900">1. Citizen Submission</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Pinpoint the issue location, select category, attach photo evidence, and receive a permanent tracking ID.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-subtle text-center space-y-3 relative">
            <div className="w-12 h-12 mx-auto rounded-xl bg-blue-50 text-blue-600 font-bold font-display text-lg flex items-center justify-center border border-blue-100">
              2
            </div>
            <h3 className="text-base font-bold text-slate-900">2. Community Upvotes</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Neighbors vote for critical infrastructure flaws. High-upvote issues earn Community Priority status.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-subtle text-center space-y-3 relative">
            <div className="w-12 h-12 mx-auto rounded-xl bg-emerald-50 text-emerald-600 font-bold font-display text-lg flex items-center justify-center border border-emerald-100">
              3
            </div>
            <h3 className="text-base font-bold text-slate-900">3. Verified Resolution</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Public works teams publish real-time audit updates, completion notes, and photographic proof of resolution.
            </p>
          </div>
        </div>
      </section>

      {/* Recent Community Issues Feed */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold font-display text-slate-900">
              Recent Community Reports
            </h2>
            <p className="text-sm text-slate-500">
              Real-time issues submitted by verified neighborhood residents.
            </p>
          </div>
          <Link
            to="/issues"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 hover:text-teal-800 transition"
          >
            <span>View All Reports</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading live issues feed..." />
        ) : recentIssues.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentIssues.map((issue) => (
              <IssueCard key={issue._id} issue={issue} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
            <p className="text-sm text-slate-500">No community issues reported yet.</p>
          </div>
        )}
      </section>

      {/* Call to Action Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-teal-700 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <h3 className="text-2xl sm:text-3xl font-bold font-display">
              Notice a hazard in your street?
            </h3>
            <p className="text-slate-200 text-sm leading-relaxed">
              It takes less than 60 seconds to file a report. Join your fellow citizens in holding municipal governance accountable.
            </p>
          </div>
          <Link
            to="/report"
            className="shrink-0 px-6 py-3.5 bg-white text-slate-900 hover:bg-teal-50 font-bold text-sm rounded-xl transition shadow-md"
          >
            Submit an Issue Now &rarr;
          </Link>
        </div>
      </section>
    </div>
  );
};
