import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  ThumbsUp,
  Flame,
  ArrowRight,
  Image as ImageIcon,
  User,
} from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import { UrgencyBadge } from '../common/UrgencyBadge';
import { issueService } from '../../services/issueService';
import { useAuth } from '../../context/AuthContext';

export const IssueCard = ({ issue, onUpvoteToggle }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [upvoted, setUpvoted] = useState(issue.hasUpvoted || false);
  const [voteCount, setVoteCount] = useState(issue.upvoteCount || 0);
  const [voting, setVoting] = useState(false);

  const handleUpvote = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }

    if (voting) return;

    try {
      setVoting(true);
      const res = await issueService.toggleUpvote(issue._id);
      setUpvoted(res.hasUpvoted);
      setVoteCount(res.upvoteCount);
      if (onUpvoteToggle) {
        onUpvoteToggle(issue._id, res.hasUpvoted, res.upvoteCount);
      }
    } catch (err) {
      console.error('Failed to toggle upvote:', err);
    } finally {
      setVoting(false);
    }
  };

  const isPriority = voteCount >= 5 || issue.urgency === 'High';

  const categoryColor = {
    Roads: 'bg-amber-100 text-amber-800',
    Streetlights: 'bg-yellow-100 text-yellow-800',
    Garbage: 'bg-emerald-100 text-emerald-800',
    'Water Supply': 'bg-cyan-100 text-cyan-800',
    Drainage: 'bg-blue-100 text-blue-800',
    'Public Safety': 'bg-rose-100 text-rose-800',
    Other: 'bg-slate-100 text-slate-800',
  }[issue.category] || 'bg-slate-100 text-slate-800';

  const formattedDate = new Date(issue.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 shadow-subtle hover:shadow-card hover:border-slate-300 transition-smooth flex flex-col overflow-hidden">
      {/* Top Media / Thumbnail */}
      <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
        {issue.photoUrl ? (
          <img
            src={issue.photoUrl}
            alt={issue.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-smooth duration-300"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=800&q=80';
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-gradient-to-br from-slate-100 to-slate-200">
            <ImageIcon className="w-8 h-8 mb-1 text-slate-300" />
            <span className="text-xs font-medium">No photo evidence</span>
          </div>
        )}

        {/* Priority Badge Overlay */}
        {isPriority && (
          <div className="absolute top-3 left-3 bg-rose-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
            <Flame className="w-3.5 h-3.5 fill-current" />
            <span>Community Priority</span>
          </div>
        )}

        {/* Urgency Badge */}
        <div className="absolute top-3 right-3">
          <UrgencyBadge urgency={issue.urgency} />
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Category & Status Row */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${categoryColor}`}>
            {issue.category}
          </span>
          <StatusBadge status={issue.status} size="sm" />
        </div>

        {/* Title */}
        <Link
          to={`/issues/${issue._id}`}
          className="text-base font-bold text-slate-900 group-hover:text-teal-700 transition line-clamp-1 mb-1.5"
        >
          {issue.title}
        </Link>

        {/* Description snippet */}
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
          {issue.description}
        </p>

        {/* Location snippet */}
        <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-3 mt-auto">
          <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
          <span className="truncate">{issue.location?.address}</span>
        </div>

        {/* Bottom bar: Reporter & Upvote CTA */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
            <Calendar className="w-3 h-3 text-slate-500" />
            <span>{formattedDate}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleUpvote}
              disabled={voting}
              aria-label="Upvote this community issue"
              className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-xl border transition-smooth ${
                upvoted
                  ? 'bg-teal-50 border-teal-300 text-teal-700'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
              }`}
            >
              <ThumbsUp
                className={`w-3.5 h-3.5 ${upvoted ? 'fill-teal-600 text-teal-600' : 'text-slate-400'}`}
              />
              <span>{voteCount}</span>
            </button>

            <Link
              to={`/issues/${issue._id}`}
              className="p-1.5 text-slate-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition"
              title="View full report details"
            >
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
