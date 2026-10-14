import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  PlusCircle,
  FileText,
  ThumbsUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Compass,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { issueService } from '../services/issueService';
import { IssueCard } from '../components/issues/IssueCard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { StatCard } from '../components/common/StatCard';

export const CitizenDashboardPage = () => {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState('reported'); // 'reported' or 'upvoted'
  const [myIssues, setMyIssues] = useState([]);
  const [upvotedIssues, setUpvotedIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        await refreshUser();
        const [reportedRes, upvotedRes] = await Promise.all([
          issueService.getIssues({ myIssues: 'true', limit: 20 }),
          issueService.getIssues({ myUpvotes: 'true', limit: 20 }),
        ]);

        setMyIssues(reportedRes.issues || []);
        setUpvotedIssues(upvotedRes.issues || []);
      } catch (err) {
        console.error('Failed to load user dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const pendingCount = myIssues.filter((i) => i.status === 'Pending').length;
  const inProgressCount = myIssues.filter((i) => i.status === 'In Progress').length;
  const resolvedCount = myIssues.filter((i) => i.status === 'Resolved').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Profile Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-subtle p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center font-bold text-2xl shadow-xs">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold font-display text-slate-900">
                {user?.name}
              </h1>
              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                Citizen Contributor
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">{user?.email}</p>
          </div>
        </div>

        <Link
          to="/report"
          className="inline-flex items-center gap-2 px-5 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-xs"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Report New Issue</span>
        </Link>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={FileText}
          title="Issues Reported"
          value={myIssues.length}
          subtitle="Submitted by you"
          iconBg="bg-teal-50 text-teal-600"
        />
        <StatCard
          icon={ThumbsUp}
          title="Issues Upvoted"
          value={upvotedIssues.length}
          subtitle="Supported by you"
          iconBg="bg-blue-50 text-blue-600"
        />
        <StatCard
          icon={AlertCircle}
          title="Active Repairs"
          value={inProgressCount}
          subtitle="Work in progress"
          iconBg="bg-sky-50 text-sky-600"
        />
        <StatCard
          icon={CheckCircle2}
          title="Resolved Cases"
          value={resolvedCount}
          subtitle="Successfully fixed"
          iconBg="bg-emerald-50 text-emerald-600"
        />
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-4">
        <button
          onClick={() => setActiveTab('reported')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 transition border-b-2 -mb-px ${
            activeTab === 'reported'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>My Reported Issues ({myIssues.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('upvoted')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 transition border-b-2 -mb-px ${
            activeTab === 'upvoted'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ThumbsUp className="w-4 h-4" />
          <span>Issues I Upvoted ({upvotedIssues.length})</span>
        </button>
      </div>

      {/* Tab Content */}
      {loading ? (
        <LoadingSpinner message="Loading your civic portfolio..." />
      ) : activeTab === 'reported' ? (
        myIssues.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myIssues.map((issue) => (
              <IssueCard key={issue._id} issue={issue} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={FileText}
            title="You haven't reported any issues yet"
            description="Notice a pothole, broken streetlight, or garbage dump? Submit a report now."
            actionText="Report an Issue"
            actionLink="/report"
          />
        )
      ) : upvotedIssues.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {upvotedIssues.map((issue) => (
            <IssueCard key={issue._id} issue={issue} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Compass}
          title="No upvoted issues yet"
          description="Browse community reports and upvote issues in your area to raise municipal priority."
          actionText="Browse Community Issues"
          actionLink="/issues"
        />
      )}
    </div>
  );
};
