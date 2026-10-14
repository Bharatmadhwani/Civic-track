import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  ThumbsUp,
  Flame,
  ShieldAlert,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Share2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { issueService } from '../services/issueService';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { UrgencyBadge } from '../components/common/UrgencyBadge';
import { Timeline } from '../components/issues/Timeline';
import { StatusUpdateModal } from '../components/admin/StatusUpdateModal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const IssueDetailPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin } = useAuth();

  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(
    searchParams.get('newReport') ? 'Report successfully created and registered with the city!' : ''
  );

  useEffect(() => {
    const fetchIssue = async () => {
      setLoading(true);
      try {
        const data = await issueService.getIssueById(id);
        setIssue(data.issue);
      } catch (err) {
        console.error('Failed to load issue:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchIssue();
  }, [id]);

  const handleUpvote = async () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }
    if (voting) return;

    try {
      setVoting(true);
      const res = await issueService.toggleUpvote(issue._id);
      setIssue((prev) => ({
        ...prev,
        hasUpvoted: res.hasUpvoted,
        upvoteCount: res.upvoteCount,
        isCommunityPriority: res.upvoteCount >= 5 || prev.urgency === 'High',
      }));
    } catch (err) {
      console.error('Error toggling upvote:', err);
    } finally {
      setVoting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to remove this issue report? This action cannot be undone.')) {
      return;
    }

    try {
      await issueService.deleteIssue(issue._id);
      navigate('/issues');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete issue.');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Retrieving community report records..." size="lg" />;
  }

  if (!issue) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Report Not Found</h2>
        <p className="text-sm text-slate-500 mb-6">
          The requested tracking ID does not exist or may have been moderated.
        </p>
        <Link
          to="/issues"
          className="px-4 py-2 bg-teal-600 text-white rounded-xl text-sm font-semibold"
        >
          Return to Issues Feed
        </Link>
      </div>
    );
  }

  const isCreator = user && issue.creator && issue.creator._id === user.id;
  const canDelete = isAdmin || (isCreator && issue.status === 'Pending');

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-semibold">{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage('')}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Navigation & Header Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          to="/issues"
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Issues Feed</span>
        </Link>

        {/* Admin or Creator Actions */}
        <div className="flex items-center gap-2">
          {isAdmin && (
            <button
              onClick={() => setModalOpen(true)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition flex items-center gap-1.5 shadow-xs"
            >
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              Manage Status
            </button>
          )}

          {canDelete && (
            <button
              onClick={handleDelete}
              className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs rounded-xl border border-rose-200 transition flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Issue Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-subtle p-6 sm:p-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg border border-slate-200">
              {issue.issueId}
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 bg-teal-50 text-teal-700 rounded-lg border border-teal-200">
              {issue.category}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <UrgencyBadge urgency={issue.urgency} />
            <StatusBadge status={issue.status} size="md" />
          </div>
        </div>

        {/* Priority Banner if applicable */}
        {issue.isCommunityPriority && (
          <div className="p-3 rounded-2xl bg-gradient-to-r from-rose-50 to-amber-50 border border-rose-200 flex items-center gap-2.5 text-xs text-rose-800">
            <Flame className="w-5 h-5 text-rose-600 fill-rose-600 shrink-0" />
            <div>
              <strong className="font-bold">Community Priority Alert:</strong> This issue has received high civic upvotes and is highlighted for urgent municipal attention.
            </div>
          </div>
        )}

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 leading-tight">
          {issue.title}
        </h1>

        {/* Sub-meta: Location, Creator, Timestamp */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 pb-4 text-xs text-slate-500 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-teal-600 shrink-0" />
            <div>
              <span className="block font-semibold text-slate-800">Location</span>
              <span>{issue.location?.address}</span>
              {issue.location?.landmark && (
                <span className="block text-[11px] text-slate-400">({issue.location.landmark})</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-teal-600 shrink-0" />
            <div>
              <span className="block font-semibold text-slate-800">Date Reported</span>
              <span>
                {new Date(issue.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-teal-600 shrink-0" />
            <div>
              <span className="block font-semibold text-slate-800">Reported By</span>
              <span>{issue.creator?.name || 'Citizen'}</span>
            </div>
          </div>
        </div>

        {/* Photo Evidence */}
        {issue.photoUrl && (
          <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 flex items-center justify-center max-h-[460px]">
            <img
              src={issue.photoUrl}
              alt={issue.title}
              className="w-full h-full object-contain max-h-[460px]"
            />
          </div>
        )}

        {/* Detailed Description */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
            Citizen Description
          </h3>
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80">
            {issue.description}
          </p>
        </div>

        {/* Upvote Interaction CTA */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleUpvote}
              disabled={voting}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm border transition-smooth ${
                issue.hasUpvoted
                  ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              <ThumbsUp className={`w-4 h-4 ${issue.hasUpvoted ? 'fill-white' : ''}`} />
              <span>{issue.hasUpvoted ? 'Upvoted' : 'Upvote Issue'}</span>
              <span className="px-2 py-0.5 rounded-full bg-black/10 text-xs">
                {issue.upvoteCount}
              </span>
            </button>
            <span className="text-xs text-slate-400 hidden sm:inline">
              Upvotes raise awareness and prioritize municipal scheduling.
            </span>
          </div>
        </div>
      </div>

      {/* Official Resolution Card (if Resolved) */}
      {issue.status === 'Resolved' && (
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl border border-emerald-200 p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2 text-emerald-800">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            <h3 className="text-lg font-bold font-display">
              Official Resolution Completed
            </h3>
          </div>

          <p className="text-sm text-slate-700 leading-relaxed">
            {issue.resolutionNote || 'The municipal response unit has completed repairs on this reported site.'}
          </p>

          {issue.resolutionProof && (
            <div className="pt-2">
              <span className="text-xs font-semibold text-slate-600 block mb-2">
                Resolution Proof Photo:
              </span>
              <img
                src={issue.resolutionProof}
                alt="Resolution proof"
                className="rounded-2xl max-h-64 object-cover border border-emerald-300 shadow-xs"
              />
            </div>
          )}
        </div>
      )}

      {/* Transparent Resolution History Timeline */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-subtle p-6 sm:p-8 space-y-6">
        <div>
          <h3 className="text-lg font-bold font-display text-slate-900">
            Transparent Resolution Timeline
          </h3>
          <p className="text-xs text-slate-500">
            Chronological audit of status changes and official field updates.
          </p>
        </div>

        <Timeline history={issue.statusHistory} currentStatus={issue.status} />
      </div>

      {/* Status Update Modal for Admins */}
      {isAdmin && (
        <StatusUpdateModal
          issue={issue}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSuccess={(updated) => setIssue(updated)}
        />
      )}
    </div>
  );
};
