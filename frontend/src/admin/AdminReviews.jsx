import React, { useState, useEffect } from 'react';
import {
  Star,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  Filter,
  ShieldCheck,
  Eye,
  MessageSquare,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import reviewService from '../services/reviewService';
import { getSocket } from '../services/socket';
import RatingStars from '../components/reviews/RatingStars';

export const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({
    totalReviews: 0,
    approvedReviews: 0,
    pendingReviews: 0,
    rejectedReviews: 0,
    reportedReviews: 0,
    verifiedPurchases: 0,
    averageRating: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ pages: 1, total: 0 });
  const [isUpdating, setIsUpdating] = useState(null);
  const [viewingReview, setViewingReview] = useState(null);

  useEffect(() => {
    fetchAdminReviews();

    // Listen to real-time review events
    const socket = getSocket();
    if (socket) {
      const handleReviewCreated = (data) => {
        if (data?.review) {
          setReviews((prev) => [data.review, ...prev]);
          setStats((prev) => ({
            ...prev,
            totalReviews: prev.totalReviews + 1,
            approvedReviews:
              data.review.status === 'APPROVED'
                ? prev.approvedReviews + 1
                : prev.approvedReviews,
          }));
        }
      };

      const handleReviewUpdated = (data) => {
        if (data?.review) {
          setReviews((prev) =>
            prev.map((r) => (r._id === data.review._id ? data.review : r))
          );
        }
      };

      const handleReviewDeleted = (data) => {
        if (data?.reviewId) {
          setReviews((prev) => prev.filter((r) => r._id !== data.reviewId));
          setStats((prev) => ({
            ...prev,
            totalReviews: Math.max(0, prev.totalReviews - 1),
          }));
        }
      };

      socket.on('review:created', handleReviewCreated);
      socket.on('review:updated', handleReviewUpdated);
      socket.on('review:deleted', handleReviewDeleted);

      return () => {
        socket.off('review:created', handleReviewCreated);
        socket.off('review:updated', handleReviewUpdated);
        socket.off('review:deleted', handleReviewDeleted);
      };
    }
  }, [page, ratingFilter, statusFilter]);

  const fetchAdminReviews = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 15,
      };
      if (ratingFilter) params.rating = ratingFilter;
      if (statusFilter) params.status = statusFilter;
      if (search.trim()) params.search = search.trim();

      const data = await reviewService.getAdminReviews(params);
      if (data) {
        setReviews(data.reviews || []);
        if (data.stats) setStats(data.stats);
        if (data.pagination) setPagination(data.pagination);
      }
    } catch (err) {
      console.error('Failed to load admin reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchAdminReviews();
  };

  const handleStatusChange = async (reviewId, newStatus) => {
    setIsUpdating(reviewId);
    try {
      let res;
      if (newStatus === 'APPROVED') {
        res = await reviewService.approveReview(reviewId);
      } else if (newStatus === 'REJECTED') {
        res = await reviewService.rejectReview(reviewId);
      } else {
        res = await reviewService.moderateReview(reviewId, newStatus);
      }
      const updated = res?.review;
      if (updated) {
        setReviews((prev) =>
          prev.map((r) => (r._id === reviewId ? { ...r, status: newStatus } : r))
        );
        if (viewingReview && viewingReview._id === reviewId) {
          setViewingReview((prev) => ({ ...prev, status: newStatus }));
        }
      }
      fetchAdminReviews();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update review status');
    } finally {
      setIsUpdating(null);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm('Are you sure you want to permanently delete this customer review?')) {
      try {
        await reviewService.deleteReview(reviewId);
        setReviews(reviews.filter((r) => r._id !== reviewId));
        fetchAdminReviews();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete review');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E9E1D6] pb-6">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#C5A059] font-semibold">
            Atelier Reputation & Sentiment
          </span>
          <h1 className="font-serif-luxury text-3xl text-[#14110C] mt-1">
            Customer Reviews Management
          </h1>
        </div>

        <button
          onClick={fetchAdminReviews}
          className="px-4 py-2 bg-white border border-[#E9E1D6] hover:border-[#C5A059] text-xs uppercase tracking-wider font-semibold text-gray-700 flex items-center space-x-2 transition shadow-2xs rounded-lg"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Feed</span>
        </button>
      </div>

      {/* Metric Cards Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Reviews */}
        <div className="bg-white border border-[#E9E1D6] rounded-2xl p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-[#C5A059]">
            <MessageSquare size={20} />
            <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Total</span>
          </div>
          <span className="text-3xl font-bold text-[#14110C] block leading-none">
            {stats.totalReviews.toLocaleString()}
          </span>
          <span className="text-xs text-gray-500 font-medium block">Lifetime Patron Impressions</span>
        </div>

        {/* Average Rating */}
        <div className="bg-white border border-[#E9E1D6] rounded-2xl p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-[#C5A059]">
            <Star size={20} fill="#C5A059" />
            <span className="text-[10px] uppercase tracking-wider text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">Score</span>
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-3xl font-bold text-[#14110C] leading-none">
              {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '5.0'}
            </span>
            <span className="text-xs text-gray-400 font-medium">/ 5.0</span>
          </div>
          <span className="text-xs text-gray-500 font-medium block">Catalog Average Score</span>
        </div>

        {/* Approved Reviews */}
        <div className="bg-white border border-[#E9E1D6] rounded-2xl p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-emerald-600">
            <CheckCircle2 size={20} />
            <span className="text-[10px] uppercase tracking-wider text-emerald-700 font-bold">Published</span>
          </div>
          <span className="text-3xl font-bold text-emerald-700 block leading-none">
            {stats.approvedReviews.toLocaleString()}
          </span>
          <span className="text-xs text-gray-500 font-medium block">Contributing to Rating</span>
        </div>

        {/* Verified Purchases Ratio */}
        <div className="bg-white border border-[#E9E1D6] rounded-2xl p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-[#14110C]">
            <ShieldCheck size={20} className="text-[#C5A059]" />
            <span className="text-[10px] uppercase tracking-wider text-[#A68B66] font-bold">Verified</span>
          </div>
          <span className="text-3xl font-bold text-[#14110C] block leading-none">
            {stats.verifiedPurchases.toLocaleString()}
          </span>
          <span className="text-xs text-gray-500 font-medium block">Delivered Buyer Proof</span>
        </div>
      </div>

      {/* Quick Navigation Tabs */}
      <div className="flex border-b border-[#E9E1D6] space-x-6 text-xs font-semibold overflow-x-auto no-scrollbar">
        {[
          { label: 'All Reviews', value: '', count: stats.totalReviews },
          { label: 'Pending Reviews', value: 'PENDING', count: stats.pendingReviews },
          { label: 'Approved Reviews', value: 'APPROVED', count: stats.approvedReviews },
          { label: 'Rejected Reviews', value: 'REJECTED', count: stats.rejectedReviews },
          { label: 'Reported Content', value: 'REPORTED', count: stats.reportedReviews || 0 },
        ].map((tab) => (
          <button
            key={tab.label}
            onClick={() => {
              setStatusFilter(tab.value);
              setPage(1);
            }}
            className={`pb-3 relative transition flex items-center space-x-1.5 whitespace-nowrap ${
              statusFilter === tab.value
                ? 'text-[#14110C] font-bold border-b-2 border-[#C5A059]'
                : 'text-gray-400 hover:text-black'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                statusFilter === tab.value
                  ? 'bg-[#14110C] text-white'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-[#E9E1D6] rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xs">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search size={14} className="absolute left-3.5 top-3 text-[#C5A059]" />
          <input
            type="text"
            placeholder="Search by customer, email or piece..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF9F6] border border-[#E9E1D6] rounded-lg focus:outline-none focus:border-[#C5A059]"
          />
        </form>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Rating Filter */}
          <select
            value={ratingFilter}
            onChange={(e) => {
              setRatingFilter(e.target.value);
              setPage(1);
            }}
            className="text-xs bg-[#FAF9F6] border border-[#E9E1D6] rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:border-[#C5A059]"
          >
            <option value="">All Star Ratings</option>
            <option value="5">5 Stars Only</option>
            <option value="4">4 Stars Only</option>
            <option value="3">3 Stars Only</option>
            <option value="2">2 Stars Only</option>
            <option value="1">1 Star Only</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="text-xs bg-[#FAF9F6] border border-[#E9E1D6] rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:border-[#C5A059]"
          >
            <option value="">All Statuses</option>
            <option value="APPROVED">Published (Approved)</option>
            <option value="PENDING">Pending Review</option>
            <option value="REJECTED">Hidden / Rejected</option>
          </select>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-white border border-[#E9E1D6] rounded-2xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#FAF9F6] text-gray-500 uppercase tracking-wider border-b border-[#E9E1D6]">
              <tr>
                <th className="py-3.5 px-4">Patron & Date</th>
                <th className="py-3.5 px-4">Silhouette Piece</th>
                <th className="py-3.5 px-4">Rating</th>
                <th className="py-3.5 px-4 max-w-sm">Impression Commentary</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#FAF9F6]">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-gray-400">
                    <RefreshCw size={20} className="animate-spin mx-auto text-[#C5A059] mb-2" />
                    <span>Loading patron impressions...</span>
                  </td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-16 text-center text-gray-400">
                    <MessageSquare size={32} className="mx-auto text-gray-300 mb-2" />
                    <p className="font-semibold text-gray-600">No customer reviews found.</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">Reviews submitted by patrons will automatically display here in real time.</p>
                  </td>
                </tr>
              ) : (
                reviews.map((r) => {
                  const statusColors = {
                    APPROVED: 'bg-emerald-50 text-emerald-800 border-emerald-200',
                    PENDING: 'bg-amber-50 text-amber-800 border-amber-200',
                    REJECTED: 'bg-rose-50 text-rose-800 border-rose-200',
                  };

                  const formattedDate = r.createdAt
                    ? new Date(r.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'Recent';

                  return (
                    <tr key={r._id} className="hover:bg-[#FAF9F6]/60 transition">
                      {/* Patron info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={
                              r.user?.avatar ||
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
                            }
                            alt=""
                            referrerPolicy="no-referrer"
                            className="w-9 h-9 rounded-full object-cover border border-[#E9E1D6]"
                          />
                          <div>
                            <p className="font-bold text-[#14110C] leading-tight">
                              {r.user?.name || 'Valued Patron'}
                            </p>
                            <p className="text-[10px] text-gray-400">{r.user?.email || 'Patron'}</p>
                            <span className="text-[9.5px] text-gray-400 block mt-0.5">{formattedDate}</span>
                          </div>
                        </div>
                      </td>

                      {/* Product piece */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2.5 max-w-[200px]">
                          <img
                            src={r.product?.images?.[0] || 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=400&q=80'}
                            alt=""
                            referrerPolicy="no-referrer"
                            className="w-8 h-10 object-cover object-top rounded border border-[#E9E1D6] shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-semibold text-[#14110C] truncate text-xs">
                              {r.product?.title || 'Atelier Piece'}
                            </p>
                            <span className="text-[10px] text-gray-400 block">
                              {r.product?.category || 'Apparel'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Rating + Verified Badge */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <RatingStars rating={r.rating} size="sm" />
                          {r.isVerifiedPurchase && (
                            <span className="inline-flex items-center gap-1 text-[9.5px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              <CheckCircle2 size={10} /> Verified
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Review Commentary & Images */}
                      <td className="py-3.5 px-4 max-w-sm">
                        {r.reviewTitle && (
                          <h6 className="font-bold text-[#14110C] text-xs mb-0.5 truncate">
                            {r.reviewTitle}
                          </h6>
                        )}
                        <p className="text-gray-700 leading-relaxed line-clamp-2">
                          "{r.reviewText}"
                        </p>
                        {r.reviewImages && r.reviewImages.length > 0 && (
                          <div className="flex gap-1.5 mt-2">
                            {r.reviewImages.map((img, i) => (
                              <img
                                key={i}
                                src={img}
                                alt=""
                                referrerPolicy="no-referrer"
                                className="w-7 h-9 object-cover rounded border border-[#E9E1D6]"
                              />
                            ))}
                            <span className="text-[10px] text-[#C5A059] self-center ml-1">
                              ({r.reviewImages.length} photo{r.reviewImages.length > 1 ? 's' : ''})
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            statusColors[r.status] || 'bg-gray-50 text-gray-700'
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => setViewingReview(r)}
                            className="p-1.5 text-gray-400 hover:text-[#C5A059] hover:bg-[#FAF9F6] rounded transition"
                            title="View full review details"
                          >
                            <Eye size={14} />
                          </button>

                          {r.status !== 'APPROVED' && (
                            <button
                              onClick={() => handleStatusChange(r._id, 'APPROVED')}
                              disabled={isUpdating === r._id}
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 text-[10px] font-bold rounded border border-emerald-200 transition"
                              title="Publish / Approve review"
                            >
                              Approve
                            </button>
                          )}

                          {r.status !== 'REJECTED' && (
                            <button
                              onClick={() => handleStatusChange(r._id, 'REJECTED')}
                              disabled={isUpdating === r._id}
                              className="px-2.5 py-1 bg-amber-50 hover:bg-amber-600 hover:text-white text-amber-700 text-[10px] font-bold rounded border border-amber-200 transition"
                              title="Hide / Reject review"
                            >
                              Hide
                            </button>
                          )}

                          <button
                            onClick={() => handleDeleteReview(r._id)}
                            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                            title="Delete permanently"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="p-4 bg-[#FAF9F6] border-t border-[#E9E1D6] flex items-center justify-between text-xs text-gray-500">
            <span>
              Showing page <strong>{page}</strong> of <strong>{pagination.pages}</strong> ({pagination.total} total)
            </span>
            <div className="flex space-x-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1 bg-white border border-[#E9E1D6] rounded disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={page >= pagination.pages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1 bg-white border border-[#E9E1D6] rounded disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View Full Review Details Modal */}
      {viewingReview && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setViewingReview(null)}
        >
          <div
            className="bg-white border border-[#E9E1D6] max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl rounded-2xl relative my-8 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#F2ECE1] pb-4">
              <div>
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#C5A059] font-cinzel font-semibold block">
                  Review Inspection
                </span>
                <h3 className="font-serif-luxury text-xl font-bold text-[#14110C] mt-0.5">
                  Patron Impression Details
                </h3>
              </div>
              <button
                onClick={() => setViewingReview(null)}
                className="p-1.5 text-gray-400 hover:text-black transition rounded-full hover:bg-gray-100"
              >
                <XCircle size={20} />
              </button>
            </div>

            {/* Patron & Product Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-[#FAF9F6] border border-[#E9E1D6] rounded-xl text-xs">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold block mb-1">
                  Patron
                </span>
                <p className="font-bold text-[#14110C]">{viewingReview.user?.name || 'Valued Patron'}</p>
                <p className="text-gray-500">{viewingReview.user?.email || 'Patron'}</p>
                {viewingReview.isVerifiedPurchase && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 mt-2">
                    <CheckCircle2 size={11} /> Verified Buyer
                  </span>
                )}
              </div>

              <div>
                <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold block mb-1">
                  Silhouette Piece
                </span>
                <p className="font-bold text-[#14110C] truncate">
                  {viewingReview.product?.title || 'Atelier Creation'}
                </p>
                <p className="text-gray-500">{viewingReview.product?.category || 'Collection'}</p>
                <p className="text-[10px] text-gray-400 mt-1">
                  Submitted:{' '}
                  {viewingReview.createdAt
                    ? new Date(viewingReview.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'Recent'}
                </p>
              </div>
            </div>

            {/* Rating & Title */}
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <RatingStars rating={viewingReview.rating} size="lg" />
                <span className="font-mono text-sm font-bold text-[#14110C]">
                  {viewingReview.rating} / 5 Stars
                </span>
              </div>
              {viewingReview.reviewTitle && (
                <h4 className="font-serif-luxury text-base font-bold text-[#14110C]">
                  {viewingReview.reviewTitle}
                </h4>
              )}
            </div>

            {/* Full Commentary */}
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold block">
                Commentary
              </span>
              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed bg-[#FAF9F6] p-4 rounded-xl border border-[#E9E1D6]">
                "{viewingReview.reviewText}"
              </p>
            </div>

            {/* Photos */}
            {viewingReview.reviewImages && viewingReview.reviewImages.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold block">
                  Uploaded Photos ({viewingReview.reviewImages.length})
                </span>
                <div className="flex flex-wrap gap-2.5">
                  {viewingReview.reviewImages.map((img, idx) => (
                    <a
                      key={idx}
                      href={img}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-20 h-28 rounded-lg overflow-hidden border border-[#E9E1D6] hover:border-[#C5A059] transition shadow-2xs"
                    >
                      <img
                        src={img}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover object-top"
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Current Status and Moderation Actions */}
            <div className="flex items-center justify-between border-t border-[#F2ECE1] pt-4">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">Current Status:</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    viewingReview.status === 'APPROVED'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : viewingReview.status === 'PENDING'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-rose-50 text-rose-800 border-rose-200'
                  }`}
                >
                  {viewingReview.status}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                {viewingReview.status !== 'APPROVED' && (
                  <button
                    onClick={() => handleStatusChange(viewingReview._id, 'APPROVED')}
                    disabled={isUpdating === viewingReview._id}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition"
                  >
                    Approve Review
                  </button>
                )}

                {viewingReview.status !== 'REJECTED' && (
                  <button
                    onClick={() => handleStatusChange(viewingReview._id, 'REJECTED')}
                    disabled={isUpdating === viewingReview._id}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition"
                  >
                    Reject Review
                  </button>
                )}

                <button
                  onClick={() => {
                    handleDeleteReview(viewingReview._id);
                    setViewingReview(null);
                  }}
                  className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  title="Delete permanently"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReviews;
