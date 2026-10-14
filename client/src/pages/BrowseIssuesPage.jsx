import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { PlusCircle, Compass, ChevronLeft, ChevronRight } from 'lucide-react';
import { issueService } from '../services/issueService';
import { IssueCard } from '../components/issues/IssueCard';
import { IssueFilters } from '../components/issues/IssueFilters';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';

export const BrowseIssuesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [status, setStatus] = useState(searchParams.get('status') || 'All');
  const [urgency, setUrgency] = useState(searchParams.get('urgency') || 'All');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [page, setPage] = useState(parseInt(searchParams.get('page'), 10) || 1);

  const [issues, setIssues] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Sync state to query params and fetch
  useEffect(() => {
    const fetchIssues = async () => {
      setLoading(true);
      try {
        const params = {
          page,
          limit: 9,
          sort,
        };
        if (search) params.search = search;
        if (category !== 'All') params.category = category;
        if (status !== 'All') params.status = status;
        if (urgency !== 'All') params.urgency = urgency;

        const data = await issueService.getIssues(params);
        setIssues(data.issues || []);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.total || 0);
      } catch (err) {
        console.error('Failed to load issues:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();
  }, [search, category, status, urgency, sort, page]);

  const handleReset = () => {
    setSearch('');
    setCategory('All');
    setStatus('All');
    setUrgency('All');
    setSort('newest');
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900">
            Explore Community Issues
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Browse public infrastructure complaints reported by local residents across all categories.
          </p>
        </div>

        <Link
          to="/report"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm rounded-xl transition shadow-xs self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Report an Issue</span>
        </Link>
      </div>

      {/* Filter Component */}
      <IssueFilters
        search={search}
        setSearch={(val) => {
          setSearch(val);
          setPage(1);
        }}
        category={category}
        setCategory={(val) => {
          setCategory(val);
          setPage(1);
        }}
        status={status}
        setStatus={(val) => {
          setStatus(val);
          setPage(1);
        }}
        urgency={urgency}
        setUrgency={(val) => {
          setUrgency(val);
          setPage(1);
        }}
        sort={sort}
        setSort={(val) => {
          setSort(val);
          setPage(1);
        }}
        onReset={handleReset}
      />

      {/* Summary Count Bar */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Showing <strong>{issues.length}</strong> of <strong>{totalCount}</strong> community reports
        </span>
        {totalPages > 1 && (
          <span>
            Page <strong>{page}</strong> of <strong>{totalPages}</strong>
          </span>
        )}
      </div>

      {/* Issues Grid / Loading / Empty State */}
      {loading ? (
        <LoadingSpinner message="Searching verified issue records..." />
      ) : issues.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {issues.map((issue) => (
            <IssueCard key={issue._id} issue={issue} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Compass}
          title="No issues match your criteria"
          description="Try broadening your search keywords or switching filters to 'All'."
          actionText="Reset Filters"
          onAction={handleReset}
        />
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && !loading && (
        <div className="flex items-center justify-center gap-3 pt-6 border-t border-slate-200">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <span className="text-xs font-medium text-slate-600 px-2">
            Page {page} of {totalPages}
          </span>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
