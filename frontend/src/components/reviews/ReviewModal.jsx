import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Upload,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Image as ImageIcon,
  Star,
  PenLine,
  MessageCircle,
  Info,
  Send,
} from 'lucide-react';
import RatingStars from './RatingStars';
import uploadService, { formatFileSize } from '../../services/uploadService';

export const ReviewModal = ({
  isOpen,
  onClose,
  onSubmit,
  existingReview = null,
  productTitle = 'Atelier Creation',
  isVerifiedBuyer = false,
}) => {
  const [rating, setRating] = useState(existingReview?.rating || 5);
  const [reviewTitle, setReviewTitle] = useState(existingReview?.reviewTitle || '');
  const [reviewText, setReviewText] = useState(existingReview?.reviewText || '');
  const [images, setImages] = useState(existingReview?.reviewImages || []);

  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating || 5);
      setReviewTitle(existingReview.reviewTitle || '');
      setReviewText(existingReview.reviewText || '');
      setImages(existingReview.reviewImages || []);
    } else {
      setRating(5);
      setReviewTitle('');
      setReviewText('');
      setImages([]);
    }
  }, [existingReview, isOpen]);

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const ratingDescriptions = {
    5: 'Pure Sovereign Perfection — Flawless drape, stitching & texture',
    4: 'Exceptional Luxury Quality — Exceeded expectations',
    3: 'Graceful Silhouette — Good fit & appearance',
    2: 'Fair Experience — Needs slight refinement',
    1: 'Not as Anticipated — Does not meet expectations',
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError('');

    // Pre-validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const ext = file.name.split('.').pop()?.toLowerCase();
    const validExts = ['jpg', 'jpeg', 'png', 'webp'];

    if (!validTypes.includes(file.type.toLowerCase()) && !validExts.includes(ext)) {
      setUploadError('Only JPG, JPEG, PNG, and WEBP formats are supported.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // 50 MB check
    if (file.size > 50 * 1024 * 1024) {
      setUploadError('Image size must not exceed 50 MB.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setSelectedFile(file);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const result = await uploadService.uploadImage(file, (pct) => {
        setUploadProgress(pct);
      });

      if (result && result.url) {
        setImages((prev) => [...prev, result.url]);
        setSelectedFile(null);
        setUploadProgress(100);
      }
    } catch (err) {
      console.error('Upload failed:', err);
      setUploadError(err.message || 'Image upload failed. Existing photos preserved.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setImages(images.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!rating || rating < 1 || rating > 5) {
      setFormError('Please select a star rating between 1 and 5.');
      return;
    }

    if (!reviewText.trim()) {
      setFormError('Please share your thoughts on the silhouette.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        rating,
        reviewTitle: reviewTitle.trim(),
        reviewText: reviewText.trim(),
        reviewImages: images,
      });
      onClose();
    } catch (err) {
      console.error('Submit review error:', err);
      setFormError(err.response?.data?.message || err.message || 'Failed to submit review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative max-w-lg w-full bg-[#FCFAF7] border border-[#F0E8DC] rounded-[28px] sm:rounded-3xl p-6 sm:p-7 shadow-2xl my-6 max-h-[92vh] overflow-y-auto no-scrollbar space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top-Right Decorative 3D Gold Star Trophy Pedestal Artwork */}
        <div className="absolute -top-3 -right-3 w-36 h-36 pointer-events-none select-none hidden sm:block opacity-95">
          <div className="absolute inset-0 bg-radial from-amber-200/50 via-amber-100/10 to-transparent blur-xl" />
          <svg viewBox="0 0 160 160" className="w-full h-full drop-shadow-sm" fill="none">
            {/* Pedestal Bottom Base */}
            <ellipse cx="106" cy="122" rx="34" ry="11" fill="url(#pedestal-base)" />
            <path
              d="M74 110 C74 110 74 122 106 122 C138 122 138 110 138 110 L138 100 C138 100 138 112 106 112 C74 112 74 100 74 100 Z"
              fill="url(#pedestal-mid)"
            />
            {/* Pedestal Top Tier */}
            <ellipse cx="106" cy="100" rx="28" ry="8.5" fill="url(#pedestal-top)" />
            <ellipse cx="106" cy="92" rx="22" ry="6.5" fill="url(#pedestal-plate)" />

            {/* Sparkle Left */}
            <path d="M52 64 Q55 60 58 64 Q55 68 52 64 Z" fill="#F59E0B" />
            <path d="M55 58 L55 70" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M49 64 L61 64" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" />

            {/* Sparkle Right */}
            <path d="M142 66 Q144 63 146 66 Q144 69 142 66 Z" fill="#F59E0B" />
            <path d="M144 61 L144 71" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M139 66 L149 66" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" />

            {/* 3D Gold Star on Pedestal */}
            <g transform="translate(106, 62) scale(1.15)">
              <path
                d="M0 -30 L8 -10 L30 -8 L14 7 L19 28 L0 17 L-19 28 L-14 7 L-30 -8 L-8 -10 Z"
                fill="url(#gold-star-gradient)"
                stroke="#D97706"
                strokeWidth="1.2"
                strokeLinejoin="round"
              />
              <path d="M0 -30 L0 17 L8 -10 Z" fill="#FEF3C7" opacity="0.6" />
              <path d="M0 -30 L0 17 L-8 -10 Z" fill="#B45309" opacity="0.45" />
              <path d="M30 -8 L0 17 L14 7 Z" fill="#F59E0B" opacity="0.5" />
              <path d="M-30 -8 L0 17 L-14 7 Z" fill="#78350F" opacity="0.4" />
              <path d="M19 28 L0 17 L8 -10 Z" fill="#FBBF24" opacity="0.5" />
            </g>

            <defs>
              <linearGradient id="pedestal-base" x1="72" y1="122" x2="140" y2="122" gradientUnits="userSpaceOnUse">
                <stop stopColor="#D97706" />
                <stop offset="0.5" stopColor="#FDE68A" />
                <stop offset="1" stopColor="#92400E" />
              </linearGradient>
              <linearGradient id="pedestal-mid" x1="74" y1="110" x2="138" y2="110" gradientUnits="userSpaceOnUse">
                <stop stopColor="#92400E" />
                <stop offset="0.5" stopColor="#F59E0B" />
                <stop offset="1" stopColor="#78350F" />
              </linearGradient>
              <linearGradient id="pedestal-top" x1="78" y1="100" x2="134" y2="100" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FBBF24" />
                <stop offset="0.5" stopColor="#FEF3C7" />
                <stop offset="1" stopColor="#D97706" />
              </linearGradient>
              <linearGradient id="pedestal-plate" x1="84" y1="92" x2="128" y2="92" gradientUnits="userSpaceOnUse">
                <stop stopColor="#F59E0B" />
                <stop offset="0.5" stopColor="#FFFBEB" />
                <stop offset="1" stopColor="#B45309" />
              </linearGradient>
              <linearGradient id="gold-star-gradient" x1="-30" y1="-30" x2="30" y2="28" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FDE68A" />
                <stop offset="0.4" stopColor="#F59E0B" />
                <stop offset="0.8" stopColor="#D97706" />
                <stop offset="1" stopColor="#B45309" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Modal Header */}
        <div className="flex items-start justify-between relative z-10">
          <div className="space-y-0.5 max-w-[80%]">
            <span className="text-[11px] uppercase tracking-[0.22em] text-[#C5A059] font-bold flex items-center gap-1.5 font-sans">
              <Star size={12} fill="#C5A059" className="text-[#C5A059]" />
              PATRON IMPRESSIONS
            </span>
            <h3 className="text-2xl sm:text-[26px] font-extrabold text-[#0F172A] tracking-tight leading-tight">
              {existingReview ? 'Refine Your Review' : 'Share Your Experience'}
            </h3>
            <p className="text-xs text-slate-500 font-normal">
              Your feedback helps us serve you better
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition shadow-2xs cursor-pointer"
            aria-label="Close dialog"
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        {/* Verified Buyer Callout (if eligible) */}
        {isVerifiedBuyer && (
          <div className="bg-emerald-50/90 border border-emerald-200/80 rounded-xl px-3.5 py-2 flex items-center space-x-2 text-emerald-800 text-xs">
            <CheckCircle2 size={15} className="text-emerald-600 flex-shrink-0" />
            <span className="font-medium">
              Verified Buyer privilege: Your review will carry the official verified badge.
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 relative z-10">
          {/* Section 1: Rating Card */}
          <div className="bg-white/95 border border-[#EFE8DD] rounded-2xl p-4 sm:p-5 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-[#0F172A] flex items-center gap-1.5">
                <Star size={15} stroke="#C5A059" strokeWidth={2} fill="transparent" />
                <span>
                  Select Your Rating <span className="text-red-500">*</span>
                </span>
              </label>
            </div>

            <div className="flex items-center justify-between flex-wrap gap-2 pt-0.5">
              <RatingStars
                rating={rating}
                interactive={true}
                size="2xl"
                onChange={(newRating) => setRating(newRating)}
              />
              <div className="bg-[#FDF4E7] text-[#0F172A] font-extrabold px-3.5 py-1 rounded-full text-sm font-sans flex items-center justify-center border border-[#F5E6CC]">
                {rating} / 5
              </div>
            </div>

            <p className="text-xs text-[#8C7A5B] italic font-serif pt-0.5">
              {ratingDescriptions[rating] || ''}
            </p>
          </div>

          {/* Section 2: Review Title Input */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
              <PenLine size={16} className="text-[#0F172A]" />
              <span>Review Title (Optional)</span>
            </label>
            <div className="relative">
              <input
                type="text"
                maxLength={100}
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
                placeholder="e.g., Exquisite drape and royal finish..."
                className="w-full rounded-2xl border border-[#E2D9CC] bg-[#FAFAF8] focus:bg-white focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] px-4 py-3 pr-16 text-sm text-[#0F172A] placeholder:text-gray-400 transition outline-none"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-sans pointer-events-none">
                {reviewTitle.length} / 100
              </span>
            </div>
          </div>

          {/* Section 3: Impression & Critique Textarea */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
              <MessageCircle size={16} className="text-[#0F172A]" />
              <span>
                Your Impression & Critique <span className="text-red-500">*</span>
              </span>
            </label>
            <div className="rounded-2xl border border-[#E2D9CC] bg-[#FAFAF8] focus-within:bg-white focus-within:border-[#C5A059] focus-within:ring-1 focus-within:ring-[#C5A059] transition p-3.5 sm:p-4">
              <textarea
                required
                rows={4}
                maxLength={2000}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Detail the drape, fabric weave, embroidery precision, and how the silhouette felt when worn..."
                className="w-full text-sm text-[#0F172A] placeholder:text-gray-400 bg-transparent focus:outline-none resize-none leading-relaxed"
              />
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-400 font-sans">
                {reviewText.length} / 2000 characters
              </span>
            </div>
          </div>

          {/* Section 4: Add Photos Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
                <ImageIcon size={16} className="text-[#0F172A]" />
                <span>Add Photos (Optional)</span>
              </label>
              <span className="bg-[#F1F5F9] text-[#64748B] text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 border border-slate-200/60">
                Max 50 MB • JPG, PNG, WEBP <Info size={12} />
              </span>
            </div>

            {/* Dashed Modern Upload Area */}
            <div className="relative border-2 border-dashed border-[#E9D7B8] bg-[#FDFBF7] hover:bg-[#FAF6ED] rounded-2xl p-5 sm:p-6 text-center cursor-pointer transition flex flex-col items-center justify-center group overflow-hidden">
              {/* Subtle ghost image silhouettes on sides */}
              <div className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none hidden sm:block">
                <ImageIcon size={44} className="text-[#C5A059]" />
              </div>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none hidden sm:block">
                <ImageIcon size={44} className="text-[#C5A059]" />
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                onChange={handleFileSelect}
                disabled={isUploading}
                className="hidden"
                id="review-image-upload"
              />
              <label
                htmlFor="review-image-upload"
                className={`cursor-pointer inline-flex flex-col items-center space-y-1 z-10 ${
                  isUploading ? 'opacity-50 pointer-events-none' : ''
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-white shadow-xs border border-[#E8DCC8] flex items-center justify-center text-[#C5A059] group-hover:scale-105 transition mb-1">
                  <Upload size={20} strokeWidth={2.2} />
                </div>
                <span className="text-sm font-bold text-[#0F172A] group-hover:text-[#C5A059] transition">
                  Click to select photo from device
                </span>
                <span className="text-xs text-gray-400">
                  Supports up to 50 MB high-resolution images
                </span>
              </label>

              {/* Upload Progress Indicator */}
              {isUploading && selectedFile && (
                <div className="w-full mt-3 p-3 bg-white border border-[#E9E1D6] rounded-xl space-y-2 text-left z-10 shadow-2xs">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#0F172A] truncate max-w-[200px]">
                      {selectedFile.name}
                    </span>
                    <span className="text-gray-400 font-mono">
                      {formatFileSize(selectedFile.size)}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#DDA74A] to-[#B38738] transition-all duration-200 ease-out rounded-full"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-500">
                    <span>Uploading photo...</span>
                    <span className="font-bold text-[#C5A059]">{uploadProgress}%</span>
                  </div>
                </div>
              )}

              {/* Upload Error Banner */}
              {uploadError && (
                <div className="w-full mt-2 text-left p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center space-x-1.5 z-10">
                  <AlertCircle size={14} className="flex-shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}
            </div>

            {/* Thumbnail Gallery for Uploaded Photos */}
            {images.length > 0 && (
              <div className="flex flex-wrap gap-2.5 pt-1">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative w-16 h-20 rounded-xl overflow-hidden border border-[#E2D9CC] shadow-2xs group"
                  >
                    <img
                      src={img}
                      alt="Uploaded review"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-red-600 text-white rounded-full transition cursor-pointer"
                      title="Remove image"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Level Error Message */}
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center space-x-2">
              <AlertCircle size={15} className="flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Section 5: Action Buttons */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting || isUploading}
              className="w-full py-3.5 rounded-2xl border-2 border-[#0F172A] text-[#0F172A] font-bold text-sm hover:bg-slate-100 active:scale-[0.99] transition duration-150 flex items-center justify-center shadow-xs cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#DDA74A] via-[#C5A059] to-[#B38738] hover:from-[#d19c3f] hover:to-[#a4792b] text-white font-bold text-sm shadow-md active:scale-[0.99] transition duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Send size={15} className="-rotate-12" />
              <span>
                {isSubmitting
                  ? 'Publishing...'
                  : existingReview
                  ? 'Update Review'
                  : 'Publish Review'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
