import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  FileText,
  Clock,
  AlertCircle,
  CheckCircle2,
  Flame,
  Search,
  Filter,
  Eye,
  Trash2,
  Activity,
  BarChart3,
  ExternalLink,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { dashboardService } from '../services/dashboardService';
import { issueService } from '../services/issueService';
import { StatCard } from '../components/common/StatCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { UrgencyBadge } from '../components/common/UrgencyBadge';
import { StatusUpdateModal } from '../components/admin/StatusUpdateModal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

const CHART_COLORS = [
  '#0d9488', // teal
  '#0284c7', // sky
  '#f59e0b', // amber
  '#10b981', // emerald
  '#6366f1', // indigo
  '#f43f5e', // rose
  '#64748b', // slate
];

export const AdminDashboardPage = () => {
  const { user, isAdmin } = useAuth();

  const [stats, setStats] = useState(null);
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters for the admin issues table
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('All');

  // Modal State
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const [dashData, issuesData] = await Promise.all([
        dashboardService.getStats(),
        issueService.getIssues({ limit: 50, sort: 'priority' }),
      ]);

      setStats(dashData.stats);
      setCategoryBreakdown(dashData.categoryBreakdown || []);
      setRecentActivity(dashData.recentActivity || []);
      setIssues(issuesData.issues || []);
    } catch (err) {
      console.error('Failed to load admin metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchDashboardData();
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center">
        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-card space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold font-display text-slate-900">
            Administrative Access Restricted
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            You are logged in as a standard citizen. Only authorized municipal officers can access the administration dashboard.
          </p>
          <div className="pt-2">
            <Link
              to="/login"
              className="inline-block px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold"
            >
              Log In as Administrator
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleStatusModalOpen = (issue) => {
    setSelectedIssue(issue);
    setModalOpen(true);
  };

  const handleStatusUpdated = (updated) => {
    setIssues((prev) =>
      prev.map((i) => (i._id === updated._id ? { ...i, ...updated } : i))
    );
    fetchDashboardData();
  };

  const handleDeleteIssue = async (issueId) => {
    if (!window.confirm('Are you sure you want to delete or moderate this issue?')) {
      return;
    }

    try {
      await issueService.deleteIssue(issueId);
      setIssues((prev) => prev.filter((i) => i._id !== issueId));
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete issue');
    }
  };

  // Filtered issues for the table
  const filteredIssues = issues.filter((i) => {
    const matchesSearch =
      !search ||
      i.title.toLowerCase().includes(search.toLowerCase()) ||
      i.issueId.toLowerCase().includes(search.toLowerCase()) ||
      i.location?.address.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = category === 'All' || i.category === category;
    const matchesStatus = status === 'All' || i.status === status;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full">
              Municipal Officer Control
            </span>
            <span className="text-xs text-slate-400">CivicTrack GovTech</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display">
            Administrative Operation Console
          </h1>
          <p className="text-xs text-slate-300">
            Monitor incoming citizen issues, dispatch field teams, and update verifiable resolution progress.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto text-xs text-slate-300 bg-slate-800/80 px-4 py-2.5 rounded-xl border border-slate-700">
          <span>Active Officer:</span>
          <strong className="text-white">{user?.name}</strong>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Calculating database analytics..." />
      ) : (
        <>
          {/* Summary KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard
              icon={FileText}
              title="Total Complaints"
              value={stats?.total || 0}
              subtitle="All reported issues"
              iconBg="bg-slate-100 text-slate-700"
            />
            <StatCard
              icon={Clock}
              title="Pending Review"
              value={stats?.pending || 0}
              subtitle="Requires assessment"
              iconBg="bg-amber-50 text-amber-600"
              badgeText="Action"
              badgeColor="bg-amber-100 text-amber-800"
            />
            <StatCard
              icon={AlertCircle}
              title="In Progress"
              value={stats?.inProgress || 0}
              subtitle="Field crews deployed"
              iconBg="bg-sky-50 text-sky-600"
            />
            <StatCard
              icon={CheckCircle2}
              title="Resolved"
              value={stats?.resolved || 0}
              subtitle={`${stats?.resolutionRate || 0}% completion`}
              iconBg="bg-emerald-50 text-emerald-600"
            />
            <StatCard
              icon={Flame}
              title="High Priority"
              value={stats?.communityPriority || 0}
              subtitle="&ge;5 votes or High Urgency"
              iconBg="bg-rose-50 text-rose-600"
              badgeText="Priority"
              badgeColor="bg-rose-100 text-rose-800"
            />
          </div>

          {/* Analytics Chart & Live Audit Stream */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Category Breakdown BarChart */}
            <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 shadow-subtle p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-teal-600" />
                  <h3 className="text-base font-bold font-display text-slate-900">
                    Complaints by Infrastructure Category
                  </h3>
                </div>
                <span className="text-xs text-slate-400">Live Database Distribution</span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      interval={0}
                      angle={-20}
                      textAnchor="end"
                    />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        border: 'none',
                        borderRadius: '0.75rem',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {categoryBreakdown.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Live Administrative Audit Stream */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-subtle p-6 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Activity className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-bold font-display text-slate-900">
                  Live Audit Activity
                </h3>
              </div>

              <div className="space-y-3 overflow-y-auto max-h-64 pr-1">
                {recentActivity.length > 0 ? (
                  recentActivity.map((act, i) => (
                    <div
                      key={act.id || i}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-[10px] text-teal-700">
                          {act.issueId}
                        </span>
                        <StatusBadge status={act.status} size="sm" />
                      </div>
                      <p className="text-slate-700 font-medium truncate">{act.issueTitle}</p>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                        <span>By: {act.changedByName}</span>
                        <span>
                          {new Date(act.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 text-center py-8">
                    No recent audit activity recorded yet.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Issue Management Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-subtle p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold font-display text-slate-900">
                  Community Issue Registry
                </h3>
                <p className="text-xs text-slate-500">
                  Full control over citizen reports, status transitions, and resolution records.
                </p>
              </div>

              {/* Table search & category filter */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search issues..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700"
                >
                  <option value="All">All Categories</option>
                  <option value="Roads">Roads</option>
                  <option value="Streetlights">Streetlights</option>
                  <option value="Garbage">Garbage</option>
                  <option value="Water Supply">Water Supply</option>
                  <option value="Drainage">Drainage</option>
                  <option value="Public Safety">Public Safety</option>
                  <option value="Other">Other</option>
                </select>

                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700"
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-y border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Tracking ID & Category</th>
                    <th className="py-3 px-4">Issue Title & Location</th>
                    <th className="py-3 px-4">Priority & Upvotes</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Reporter</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredIssues.map((issue) => (
                    <tr key={issue._id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-slate-900 block">
                          {issue.issueId}
                        </span>
                        <span className="text-[11px] text-teal-700 font-medium">
                          {issue.category}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <Link
                          to={`/issues/${issue._id}`}
                          className="font-semibold text-slate-800 hover:text-teal-700 line-clamp-1"
                        >
                          {issue.title}
                        </Link>
                        <span className="text-[11px] text-slate-400 block truncate">
                          {issue.location?.address}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <UrgencyBadge urgency={issue.urgency} />
                          {issue.upvoteCount >= 5 && (
                            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 flex items-center gap-0.5">
                              <Flame className="w-3 h-3 fill-rose-500" />
                              {issue.upvoteCount}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <StatusBadge status={issue.status} size="sm" />
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-medium text-slate-700 block">
                          {issue.creator?.name || 'Citizen'}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(issue.createdAt).toLocaleDateString()}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleStatusModalOpen(issue)}
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition shadow-xs"
                          >
                            Update
                          </button>
                          <Link
                            to={`/issues/${issue._id}`}
                            className="p-1 text-slate-400 hover:text-teal-600 rounded-lg hover:bg-slate-100 transition"
                            title="View report"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDeleteIssue(issue._id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                            title="Moderate / Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredIssues.length === 0 && (
                <div className="text-center py-10 text-xs text-slate-400">
                  No issues found matching the selected filters.
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Admin Status Transition Modal */}
      {selectedIssue && (
        <StatusUpdateModal
          issue={selectedIssue}
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedIssue(null);
          }}
          onSuccess={handleStatusUpdated}
        />
      )}
    </div>
  );
};
