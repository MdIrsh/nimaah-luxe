import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Camera,
  Star,
  PenLine,
  MessageSquare,
  Send,
  ArrowRight,
  Heart,
} from 'lucide-react';
import RatingStars from './RatingStars';
import uploadService, { formatFileSize } from '../../services/uploadService';
import { FALLBACK_PRODUCT_IMAGE, getProductImageUrl, handleImageError } from '../../utils/imageUtils';
import { useAuth } from '../../context/AuthContext';

export const ReviewModal = ({
  isOpen,
  onClose,
  onSubmit,
  existingReview = null,
  productTitle = 'Audio Piece',
  productImage = '',
  productBrand = 'NOISE',
  isVerifiedBuyer = false,
}) => {
  const { user } = useAuth();
  const [customerName, setCustomerName] = useState(
    existingReview?.customerName || existingReview?.user?.name || user?.name || ''
  );
  const [rating, setRating] = useState(existingReview?.rating || 4);
  const [reviewTitle, setReviewTitle] = useState(existingReview?.reviewTitle || '');
  const [reviewText, setReviewText] = useState(existingReview?.reviewText || '');
  const [images, setImages] = useState(existingReview?.reviewImages || []);

  useEffect(() => {
    if (existingReview) {
      setCustomerName(existingReview.customerName || existingReview.user?.name || user?.name || '');
      setRating(existingReview.rating || 4);
      setReviewTitle(existingReview.reviewTitle || '');
      setReviewText(existingReview.reviewText || '');
      setImages(existingReview.reviewImages || []);
    } else {
      setCustomerName(user?.name || '');
      setRating(4);
      setReviewTitle('');
      setReviewText('');
      setImages([]);
    }
  }, [existingReview, isOpen, user]);

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const ratingDescriptions = {
    5: 'Masterpiece! Flawless acoustics and comfort.',
    4: 'Great! Your opinion matters.',
    3: 'Good experience, satisfactory quality.',
    2: 'Fair experience, room for refinement.',
    1: 'Needs significant improvement.',
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError('');

    // Pre-validate file type with mobile compatibility
    const validExts = ['jpg', 'jpeg', 'png', 'webp'];
    const ext = file.name.split('.').pop()?.toLowerCase();
    const isImage = (file.type && file.type.toLowerCase().startsWith('image/')) || validExts.includes(ext);

    if (!isImage) {
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

    if (!user && !customerName.trim()) {
      setFormError('Please enter your name.');
      return;
    }

    if (!reviewText.trim()) {
      setFormError('Please share your thoughts on the product.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        rating,
        reviewTitle: reviewTitle.trim(),
        reviewText: reviewText.trim(),
        reviewImages: images,
        customerName: user?.name || customerName.trim(),
      });
      onClose();
    } catch (err) {
      console.error('Submit review error:', err);
      setFormError(err.response?.data?.message || err.message || 'Failed to submit review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayImg = productImage || FALLBACK_PRODUCT_IMAGE;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Modal Container: Mobile bottom-sheet & Desktop centered modal */}
      <div
        className="relative w-full sm:max-w-xl bg-gradient-to-b from-[#F0F7FF] via-white to-[#F0F7FF]/60 rounded-t-[28px] sm:rounded-3xl border border-blue-100 shadow-2xl p-5 sm:p-7 max-h-[92vh] sm:max-h-[90vh] overflow-y-auto no-scrollbar space-y-4 sm:space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag Bar */}
        <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto sm:hidden -mt-1 mb-2" />

        {/* Circular Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 w-8 h-8 rounded-full bg-white/95 border border-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition shadow-2xs cursor-pointer z-20"
          aria-label="Close review dialog"
        >
          <X size={16} strokeWidth={2.5} />
        </button>

        {/* Header with Integrated Product Showcase */}
        <div className="flex items-center gap-4 sm:gap-5 pr-8">
          {/* Product Image Box */}
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-[#E0F2FE] via-[#EDE9FE]/50 to-[#F0FDF4]/40 p-2 flex items-center justify-center border border-blue-100 shadow-xs relative overflow-hidden flex-shrink-0 group">
            {/* Sparkles */}
            <span className="absolute top-1.5 right-2 text-blue-400 text-xs select-none">✦</span>
            <span className="absolute bottom-2 left-2 text-blue-300 text-[10px] select-none">✦</span>
            <img
              src={displayImg}
              alt={productTitle}
              referrerPolicy="no-referrer"
              onError={handleImageError}
              className="w-full h-full object-contain mix-blend-multiply drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
            />
          </div>

          {/* Heading Content */}
          <div className="space-y-0.5 min-w-0">
            <span className="text-xl font-black tracking-tight text-[#0B192C] font-sans block truncate lowercase">
              {productBrand ? productBrand.toLowerCase() : "ni'maah luxe"}
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#0B192C] tracking-tight leading-tight">
              {existingReview ? 'Refine Your Experience' : 'Share Your Experience'}
            </h3>
            <p className="text-xs text-slate-500 font-normal flex items-center gap-1.5 flex-wrap">
              <span>Your feedback helps us serve you better</span>
              <Heart size={13} className="text-blue-500 stroke-[2.2]" />
            </p>
          </div>
        </div>

        {/* Verified Buyer Callout (if eligible) */}
        {isVerifiedBuyer && (
          <div className="bg-emerald-50/90 border border-emerald-200 rounded-xl px-3.5 py-2 flex items-center space-x-2 text-emerald-800 text-xs">
            <CheckCircle2 size={15} className="text-emerald-600 flex-shrink-0" />
            <span className="font-medium">
              Verified Buyer: Your review will carry the official verified badge.
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Customer Name (When not logged in or editing name) */}
          {!user ? (
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-[#0B192C]">
                Your Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={50}
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full rounded-2xl border border-slate-200 bg-[#F8FAFC] focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 px-4 py-3 text-sm text-[#0B192C] placeholder:text-slate-400 transition outline-none shadow-2xs"
              />
            </div>
          ) : (
            <div className="text-xs text-slate-500 font-medium px-1">
              Reviewing as: <strong className="text-slate-800">{user.name}</strong>
            </div>
          )}

          {/* Section 1: Rate Your Experience Card */}
          <div className="bg-gradient-to-r from-blue-50/50 via-white to-sky-50/40 border border-blue-100 rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-2xs space-y-2.5">
            {/* "Be the Voice" Script Watermark */}
            <span
              className="text-blue-600/75 text-2xl sm:text-3xl font-bold -rotate-12 absolute right-3 sm:right-5 top-2.5 select-none pointer-events-none"
              style={{ fontFamily: "'Brush Script MT', 'Caveat', 'Playfair Display', cursive, serif" }}
            >
              Be the Voice
            </span>

            {/* Header */}
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-[#2563EB] flex items-center justify-center text-white shadow-2xs">
                <Star size={11} fill="white" className="text-white" />
              </div>
              <label className="text-sm font-bold text-[#0B192C]">
                Rate Your Experience <span className="text-red-500">*</span>
              </label>
            </div>

            {/* Stars Row + Pill */}
            <div className="flex items-center justify-between flex-wrap gap-2 pt-0.5">
              <RatingStars
                rating={rating}
                interactive={true}
                size="2xl"
                color="amber"
                onChange={(newRating) => setRating(newRating)}
              />
              <div className="bg-[#E0F2FE] text-[#0369A1] font-extrabold px-3.5 py-1 rounded-full text-xs font-sans border border-blue-200/60 shadow-2xs">
                {rating}.0 / 5
              </div>
            </div>

            {/* Dynamic Opinion Subtext */}
            <p className="text-xs text-slate-500 font-medium italic pt-0.5">
              {ratingDescriptions[rating] || 'Great! Your opinion matters.'}
            </p>
          </div>

          {/* Section 2: Review Title Input */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-blue-100 text-[#2563EB] flex items-center justify-center">
                <PenLine size={11} />
              </div>
              <label className="text-sm font-bold text-[#0B192C]">
                Review Title (Optional)
              </label>
            </div>
            <div className="relative">
              <input
                type="text"
                maxLength={100}
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
                placeholder="e.g. Great sound quality..."
                className="w-full rounded-2xl border border-slate-200 bg-[#F8FAFC] focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 px-4 py-3 pr-16 text-sm text-[#0B192C] placeholder:text-slate-400 transition outline-none shadow-2xs"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-sans pointer-events-none">
                {reviewTitle.length} / 100
              </span>
            </div>
          </div>

          {/* Section 3: Your Impression & Critique */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-blue-100 text-[#2563EB] flex items-center justify-center">
                <MessageSquare size={11} />
              </div>
              <label className="text-sm font-bold text-[#0B192C]">
                Your Impression & Critique <span className="text-red-500">*</span>
              </label>
            </div>
            <div className="relative rounded-2xl border border-slate-200 bg-[#F8FAFC] focus-within:bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition p-3.5 sm:p-4 shadow-2xs">
              <textarea
                required
                rows={4}
                maxLength={2000}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Tell us about the product – design, performance, battery life and more..."
                className="w-full text-sm text-[#0B192C] placeholder:text-slate-400 bg-transparent focus:outline-none resize-none leading-relaxed"
              />
              <div className="flex items-center justify-end gap-1 text-[11px] text-slate-400 font-sans pt-1">
                <span>{reviewText.length} / 2000</span>
                <PenLine size={11} className="opacity-40" />
              </div>
            </div>
          </div>

          {/* Section 4: Add Photos */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-blue-100 text-[#2563EB] flex items-center justify-center">
                <Camera size={11} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#0B192C]">Add Photos (Optional)</h4>
                <p className="text-[11px] text-slate-400">Show us your product in action</p>
              </div>
            </div>

            {/* Modern Drag & Drop Upload Area */}
            <div className="relative border-2 border-dashed border-blue-200 bg-gradient-to-r from-blue-50/40 via-sky-50/20 to-blue-50/40 hover:bg-blue-50/70 rounded-2xl p-5 sm:p-6 text-center cursor-pointer transition flex flex-col items-center justify-center group overflow-hidden">
              {/* Subtle ghost product watermark in the background */}
              <div className="w-24 h-24 absolute -right-3 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none hidden sm:block">
                <img
                  src={displayImg}
                  alt=""
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain filter grayscale"
                />
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.jpg,.jpeg,.png,.webp"
                onChange={handleFileSelect}
                disabled={isUploading}
                className="hidden"
                id="review-image-upload"
              />
              <label
                htmlFor="review-image-upload"
                className={`cursor-pointer inline-flex flex-col items-center space-y-1 z-10 ${isUploading ? 'opacity-50 pointer-events-none' : ''
                  }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-blue-100 flex items-center justify-center text-[#2563EB] group-hover:scale-105 transition mb-1">
                  <UploadCloud size={24} strokeWidth={2.2} />
                </div>
                <span className="text-sm font-bold text-[#0B192C] group-hover:text-blue-600 transition">
                  Click to upload photo from device
                </span>
                <span className="text-xs text-slate-400">
                  Supports JPG, PNG, WEBP • Max 50 MB
                </span>
              </label>

              {/* Upload Progress */}
              {isUploading && selectedFile && (
                <div className="w-full mt-3 p-3 bg-white border border-blue-100 rounded-xl space-y-2 text-left z-10 shadow-2xs">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#0B192C] truncate max-w-[200px]">
                      {selectedFile.name}
                    </span>
                    <span className="text-slate-400 font-mono">
                      {formatFileSize(selectedFile.size)}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 transition-all duration-200 ease-out rounded-full"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>Uploading photo...</span>
                    <span className="font-bold text-blue-600">{uploadProgress}%</span>
                  </div>
                </div>
              )}

              {uploadError && (
                <div className="w-full mt-2 text-left p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center space-x-1.5 z-10">
                  <AlertCircle size={14} className="flex-shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}
            </div>

            {/* Thumbnail Preview Strip */}
            {images.length > 0 && (
              <div className="flex flex-wrap gap-2.5 pt-1">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative w-16 h-20 rounded-xl overflow-hidden border border-blue-200 shadow-2xs group"
                  >
                    <img
                      src={getProductImageUrl(img)}
                      alt="Uploaded review"
                      referrerPolicy="no-referrer"
                      onError={handleImageError}
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

          {/* Form Error Banner */}
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center space-x-2">
              <AlertCircle size={15} className="flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Action Buttons: Outlined Cancel & Dark Navy Publish Review */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting || isUploading}
              className="w-full py-3.5 rounded-2xl border-2 border-[#0B192C] text-[#0B192C] font-bold text-sm hover:bg-slate-100 active:scale-[0.99] transition duration-150 flex items-center justify-center shadow-xs cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="w-full py-3.5 rounded-2xl bg-[#0B192C] hover:bg-[#1E3A8A] text-white font-bold text-sm shadow-md active:scale-[0.99] transition duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Send size={15} className="-rotate-12" />
              <span>
                {isSubmitting
                  ? 'Publishing...'
                  : existingReview
                    ? 'Update Review'
                    : 'Publish Review'}
              </span>
              <ArrowRight size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
