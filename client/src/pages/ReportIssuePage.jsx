import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Upload,
  AlertCircle,
  CheckCircle2,
  MapPin,
  Camera,
  X,
  ShieldAlert,
  LogIn,
} from 'lucide-react';
import { issueService } from '../services/issueService';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = [
  'Roads',
  'Streetlights',
  'Garbage',
  'Water Supply',
  'Drainage',
  'Public Safety',
  'Other',
];

export const ReportIssuePage = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    category: 'Roads',
    urgency: 'Medium',
    locationAddress: '',
    locationLandmark: '',
    locationCity: 'Metro District',
    description: '',
    photoUrl: '',
  });

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file must be smaller than 5MB.');
        return;
      }
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    setFormData((prev) => ({ ...prev, photoUrl: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim() || formData.title.trim().length < 5) {
      setError('Please provide a descriptive title (at least 5 characters).');
      return;
    }

    if (!formData.locationAddress.trim()) {
      setError('Please specify the location or street address.');
      return;
    }

    if (!formData.description.trim() || formData.description.trim().length < 15) {
      setError('Please provide a detailed description (at least 15 characters) so crews understand the hazard.');
      return;
    }

    try {
      setLoading(true);
      const data = new FormData();
      data.append('title', formData.title.trim());
      data.append('category', formData.category);
      data.append('urgency', formData.urgency);
      data.append('locationAddress', formData.locationAddress.trim());
      data.append('locationLandmark', formData.locationLandmark.trim());
      data.append('locationCity', formData.locationCity.trim());
      data.append('description', formData.description.trim());

      if (photoFile) {
        data.append('photo', photoFile);
      } else if (formData.photoUrl.trim()) {
        data.append('photoUrl', formData.photoUrl.trim());
      }

      const res = await issueService.createIssue(data);
      if (res.success && res.issue) {
        navigate(`/issues/${res.issue._id}?newReport=true`);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to submit report. Please check your network and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // If not logged in, prompt user
  if (!isAuthenticated) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-card space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <LogIn className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold font-display text-slate-900">
            Sign In to File a Report
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed max-w-sm mx-auto">
            To prevent spam and allow you to track your report's resolution timeline, you must be logged into a citizen account.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/login?redirect=/report"
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm rounded-xl transition shadow-xs"
            >
              Sign In
            </Link>
            <Link
              to="/register?redirect=/report"
              className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Title */}
      <div className="text-center space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
          Official Community Reporting Form
        </span>
        <h1 className="text-3xl font-extrabold font-display text-slate-900">
          Report a Public Issue
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
          Help municipal field teams identify and resolve community infrastructure defects. Every report receives an official tracking ID.
        </p>
      </div>

      {/* Main Form Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card p-6 sm:p-10">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Issue Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Issue Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Hazardous deep pothole in westbound bus lane"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 transition"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Be concise and clear so repair crews immediately understand the problem.
            </span>
          </div>

          {/* Category & Urgency Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 transition"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Urgency Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['Low', 'Medium', 'High'].map((urg) => (
                  <button
                    type="button"
                    key={urg}
                    onClick={() => setFormData({ ...formData, urgency: urg })}
                    className={`py-3 text-xs font-bold rounded-xl border text-center transition-all ${
                      formData.urgency === urg
                        ? urg === 'High'
                          ? 'bg-rose-50 border-rose-300 text-rose-700 ring-2 ring-rose-400/40'
                          : urg === 'Medium'
                          ? 'bg-amber-50 border-amber-300 text-amber-700 ring-2 ring-amber-400/40'
                          : 'bg-sky-50 border-sky-300 text-sky-700 ring-2 ring-sky-400/40'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {urg}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Location Fields */}
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-4">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
              <MapPin className="w-4 h-4 text-teal-600" />
              <span>Location Details</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Street Address / Exact Spot <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 1420 Greenfield Parkway"
                  value={formData.locationAddress}
                  onChange={(e) => setFormData({ ...formData, locationAddress: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nearby Landmark (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Opposite Shell Gas Station"
                  value={formData.locationLandmark}
                  onChange={(e) => setFormData({ ...formData, locationLandmark: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  City / Zone
                </label>
                <input
                  type="text"
                  placeholder="Metro District"
                  value={formData.locationCity}
                  onChange={(e) => setFormData({ ...formData, locationCity: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Detailed Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              placeholder="Describe the severity of the damage, how long it has been present, and whether it poses safety hazards to pedestrians or motorists..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 transition"
            />
          </div>

          {/* Photo Evidence Upload */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Photo Evidence (Optional but Highly Recommended)
            </label>

            {photoPreview ? (
              <div className="relative rounded-2xl overflow-hidden border border-teal-300 max-h-64 w-full bg-slate-900 flex items-center justify-center">
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="object-contain max-h-64 w-full"
                />
                <button
                  type="button"
                  onClick={removePhoto}
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-rose-600 text-white hover:bg-rose-700 transition shadow-md"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-slate-300 hover:border-teal-500 rounded-2xl p-6 text-center bg-slate-50 transition cursor-pointer relative">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <Camera className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700">
                  Click or drag and drop photo evidence here
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Supports JPEG, PNG, WebP up to 5MB
                </p>
              </div>
            )}

            {/* Optional URL input if user has online image */}
            <div className="mt-3">
              <input
                type="url"
                placeholder="Or paste an external photo URL (e.g. Unsplash, imgur)..."
                value={formData.photoUrl}
                onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Submit CTA */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Reporting as: <strong className="text-slate-700">{user?.name}</strong>
            </span>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl transition shadow-md disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? 'Submitting Report...' : 'Publish Issue Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
