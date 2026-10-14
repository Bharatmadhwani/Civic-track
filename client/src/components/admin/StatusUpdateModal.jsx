import React, { useState } from 'react';
import { X, CheckCircle, Upload, AlertCircle, ShieldAlert } from 'lucide-react';
import { issueService } from '../../services/issueService';

export const StatusUpdateModal = ({ issue, isOpen, onClose, onSuccess }) => {
  if (!isOpen || !issue) return null;

  const [status, setStatus] = useState(issue.status || 'Pending');
  const [note, setNote] = useState('');
  const [resolutionNote, setResolutionNote] = useState(issue.resolutionNote || '');
  const [proofFile, setProofFile] = useState(null);
  const [proofUrl, setProofUrl] = useState(issue.resolutionProof || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('status', status);
      formData.append('note', note.trim() || `Status updated to ${status} by administrator.`);

      if (status === 'Resolved') {
        if (resolutionNote.trim()) {
          formData.append('resolutionNote', resolutionNote.trim());
        }
        if (proofFile) {
          formData.append('resolutionProof', proofFile);
        } else if (proofUrl.trim()) {
          formData.append('resolutionProof', proofUrl.trim());
        }
      }

      const res = await issueService.updateStatus(issue._id, formData);
      if (res.success) {
        onSuccess(res.issue);
        onClose();
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to update issue status. Please verify permissions and try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold font-display">
              Administrative Status Transition
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Issue Tracking ID
            </span>
            <p className="text-sm font-bold text-slate-800">{issue.issueId} &mdash; {issue.title}</p>
          </div>

          {/* Status Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Select New Official Status <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { val: 'Pending', label: 'Pending', color: 'border-amber-300 text-amber-800 bg-amber-50' },
                { val: 'In Progress', label: 'In Progress', color: 'border-sky-300 text-sky-800 bg-sky-50' },
                { val: 'Resolved', label: 'Resolved', color: 'border-emerald-300 text-emerald-800 bg-emerald-50' },
              ].map((opt) => (
                <button
                  type="button"
                  key={opt.val}
                  onClick={() => setStatus(opt.val)}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border text-center transition-all ${
                    status === opt.val
                      ? `${opt.color} ring-2 ring-teal-500/50 shadow-xs`
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Internal Audit Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Audit Note / Action Taken
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Field inspection completed, contractor dispatched ticket #P-402..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800"
            />
            <p className="text-[11px] text-slate-600 mt-1">
              This note will be permanently logged in the community resolution timeline.
            </p>
          </div>

          {/* Resolution Specific Fields */}
          {status === 'Resolved' && (
            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Resolution Documentation</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Public Resolution Summary
                </label>
                <textarea
                  rows={2}
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  placeholder="Describe the final repair work completed for citizens to see..."
                  className="w-full px-3 py-2 text-xs bg-white border border-emerald-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Attach Resolution Proof (Photo or URL)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setProofFile(e.target.files[0] || null)}
                  className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700"
                />
                <input
                  type="url"
                  placeholder="Or paste external photo proof URL..."
                  value={proofUrl}
                  onChange={(e) => setProofUrl(e.target.value)}
                  className="w-full mt-2 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800"
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition shadow-xs flex items-center gap-1.5"
            >
              {submitting ? 'Updating...' : 'Commit Status Change'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
