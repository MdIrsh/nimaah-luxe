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
  ShoppingBag,
} from 'lucide-react';
import RatingStars from './RatingStars';
import uploadService, { formatFileSize } from '../../services/uploadService';
import { getProductImageUrl, handleImageError } from '../../utils/imageUtils';
import { useAuth } from '../../context/AuthContext';

export const ReviewModal = ({
  isOpen,
  onClose,
  onSubmit,
  existingReview = null,
  productTitle = 'Luxury Product',
  productImage = '',
  productBrand = "Ni'maah Luxe",
  isVerifiedBuyer = false,
}) => {
  const { user } = useAuth();
  const [customerName, setCustomerName] = useState(
    existingReview?.customerName || existingReview?.user?.name || user?.name || ''
  );
  const [rating, setRating] = useState(existingReview?.rating || 5);
  const [reviewTitle, setReviewTitle] = useState(existingReview?.reviewTitle || '');
  const [reviewText, setReviewText] = useState(existingReview?.reviewText || '');
  const [images, setImages] = useState(existingReview?.reviewImages || []);

  useEffect(() => {
    if (existingReview) {
      setCustomerName(existingReview.customerName || existingReview.user?.name || user?.name || '');
      setRating(existingReview.rating || 5);
      setReviewTitle(existingReview.reviewTitle || existingReview.title || '');
      setReviewText(existingReview.reviewText || existingReview.comment || '');
      setImages(existingReview.reviewImages || existingReview.images || []);
    } else {
      setCustomerName(user?.name || '');
      setRating(5);
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

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const ratingDescriptions = {
    5: 'Masterpiece! Flawless craftsmanship & exquisite quality.',
    4: 'Great experience, highly recommended.',
    3: 'Satisfactory quality, matches expectations.',
    2: 'Fair experience, room for refinement.',
    1: 'Needs significant improvement.',
  };

  const handleFileSelect = async (e) => {
    const fileList = Array.from(e.target.files || []);
    if (!fileList || fileList.length === 0) return;

    setUploadError('');
    setIsUploading(true);
    setUploadProgress(0);

    const validExts = ['jpg', 'jpeg', 'png', 'webp'];
    const validFiles = [];

    for (const file of fileList) {
      const ext = file.name ? file.name.split('.').pop()?.toLowerCase() : '';
      const isImage =
        (file.type && file.type.toLowerCase().startsWith('image/')) ||
        validExts.includes(ext);

      if (!isImage) {
        setUploadError(`"${file.name}" is not supported. Please choose JPG, JPEG, PNG, or WEBP.`);
        continue;
      }

      if (file.size > 50 * 1024 * 1024) {
        setUploadError(`"${file.name}" exceeds 50 MB.`);
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length === 0) {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    try {
      setSelectedFile(validFiles[0]);
      const urls = await uploadService.uploadMultipleImages(validFiles, (pct) => {
        setUploadProgress(pct);
      });

      if (Array.isArray(urls) && urls.length > 0) {
        setImages((prev) => [...prev, ...urls]);
        setUploadProgress(100);
      }
    } catch (err) {
      console.error('Upload failed:', err);
      setUploadError(err.message || 'Image upload failed. Existing photos preserved.');
    } finally {
      setIsUploading(false);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setImages(images.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
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
        title: reviewTitle.trim(),
        reviewText: reviewText.trim(),
        comment: reviewText.trim(),
        reviewImages: images,
        images: images,
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

  // Only show authentic image if it exists and is not an Unsplash stock photo
  const hasRealImage =
    productImage &&
    typeof productImage === 'string' &&
    !productImage.includes('unsplash.com') &&
    productImage.trim() !== '';

  const displayImg = hasRealImage ? getProductImageUrl(productImage) : '';

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Modal Container: Mobile bottom-sheet & Desktop centered modal */}
      <div
        className="relative w-full sm:max-w-xl max-h-[94dvh] sm:max-h-[90vh] bg-gradient-to-b from-[#F0F7FF] via-white to-white rounded-t-[28px] sm:rounded-3xl border border-blue-100 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-3 duration-250"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag Indicator Bar */}
        <div className="w-12 h-1 bg-slate-300 rounded-full mx-auto sm:hidden mt-2.5 mb-1 shrink-0" />

        {/* Circular Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 w-8 h-8 rounded-full bg-white/95 border border-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition shadow-2xs cursor-pointer z-30"
          aria-label="Close review dialog"
        >
          <X size={16} strokeWidth={2.5} />
        </button>

        {/* 1. Modal Fixed Header */}
        <div className="px-4 sm:px-6 pt-3 sm:pt-5 pb-3 border-b border-blue-100/70 shrink-0 bg-white/80 backdrop-blur-xs">
          <div className="flex items-center gap-3.5 sm:gap-4 pr-8">
            {/* Product Image or Luxury Badge */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#E0F2FE] via-[#EDE9FE]/50 to-[#F0FDF4]/40 p-1.5 flex items-center justify-center border border-blue-100 shadow-xs relative overflow-hidden shrink-0 group">
              <span className="absolute top-1 right-1.5 text-blue-400 text-[10px] select-none">✦</span>
              {displayImg ? (
                <img
                  src={displayImg}
                  alt={productTitle}
                  referrerPolicy="no-referrer"
                  onError={handleImageError}
                  className="w-full h-full object-contain mix-blend-multiply drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <ShoppingBag size={26} className="text-blue-600 drop-shadow-xs" />
              )}
            </div>

            {/* Heading Content */}
            <div className="space-y-0.5 min-w-0">
              <span className="text-xs font-black tracking-wider text-blue-700 uppercase block truncate">
                {productBrand || "Ni'maah Luxe"}
              </span>
              <h3 className="text-base sm:text-lg font-black text-[#0B192C] tracking-tight leading-snug truncate">
                {existingReview ? 'Refine Your Review' : 'Rate & Review'}
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 font-normal flex items-center gap-1.5">
                <span className="truncate max-w-[200px] sm:max-w-xs">{productTitle}</span>
                <Heart size={11} className="text-rose-500 fill-rose-500 shrink-0" />
              </p>
            </div>
          </div>

          {/* Verified Buyer Callout (if eligible) */}
          {isVerifiedBuyer && (
            <div className="mt-2.5 bg-emerald-50/90 border border-emerald-200 rounded-xl px-3 py-1.5 flex items-center space-x-2 text-emerald-800 text-[11px] sm:text-xs">
              <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
              <span className="font-semibold">
                Verified Buyer: Your review will display the official verified purchase badge.
              </span>
            </div>
          )}
        </div>

        {/* 2. Modal Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-6 py-4 space-y-4 no-scrollbar">
          <form id="review-form" onSubmit={handleSubmit} className="space-y-4">
            {/* Customer Name (When not logged in) */}
            {!user ? (
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-bold text-[#0B192C]">
                  Your Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={50}
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full rounded-xl border border-slate-200 bg-[#F8FAFC] focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 px-3.5 py-2.5 text-xs sm:text-sm text-[#0B192C] placeholder:text-slate-400 transition outline-none shadow-2xs"
                />
              </div>
            ) : (
              <div className="text-xs text-slate-500 font-medium px-0.5">
                Reviewing as: <strong className="text-slate-800">{user.name}</strong>
              </div>
            )}

            {/* Section 1: Rate Your Experience Card */}
            <div className="bg-gradient-to-r from-blue-50/60 via-white to-sky-50/50 border border-blue-100 rounded-2xl p-3.5 sm:p-4.5 relative overflow-hidden shadow-2xs space-y-2">
              <span
                className="text-blue-600/70 text-2xl sm:text-3xl font-bold -rotate-12 absolute right-3 sm:right-4 top-2 select-none pointer-events-none"
                style={{ fontFamily: "'Brush Script MT', 'Caveat', 'Playfair Display', cursive, serif" }}
              >
                Be the Voice
              </span>

              {/* Header */}
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-[#2563EB] flex items-center justify-center text-white shadow-2xs">
                  <Star size={11} fill="white" className="text-white" />
                </div>
                <label className="text-xs sm:text-sm font-bold text-[#0B192C]">
                  Rate Your Experience <span className="text-red-500">*</span>
                </label>
              </div>

              {/* Stars Row + Rating Pill */}
              <div className="flex items-center justify-between flex-wrap gap-2 pt-0.5">
                <RatingStars
                  rating={rating}
                  interactive={true}
                  size="2xl"
                  color="amber"
                  onChange={(newRating) => setRating(newRating)}
                />
                <div className="bg-[#E0F2FE] text-[#0369A1] font-extrabold px-3 py-0.5 rounded-full text-xs font-mono border border-blue-200/60 shadow-2xs">
                  {rating}.0 / 5
                </div>
              </div>

              {/* Dynamic Opinion Subtext */}
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium italic pt-0.5">
                {ratingDescriptions[rating] || 'Great! Your feedback is highly appreciated.'}
              </p>
            </div>

            {/* Section 2: Review Title Input */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-blue-100 text-[#2563EB] flex items-center justify-center">
                  <PenLine size={11} />
                </div>
                <label className="text-xs sm:text-sm font-bold text-[#0B192C]">
                  Review Title <span className="text-slate-400 font-normal text-xs">(Optional)</span>
                </label>
              </div>
              <div className="relative">
                <input
                  type="text"
                  maxLength={100}
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  placeholder="e.g. Exceptional craftsmanship, perfect fit..."
                  className="w-full rounded-xl border border-slate-200 bg-[#F8FAFC] focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 px-3.5 py-2.5 pr-14 text-xs sm:text-sm text-[#0B192C] placeholder:text-slate-400 transition outline-none shadow-2xs"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-mono pointer-events-none">
                  {reviewTitle.length}/100
                </span>
              </div>
            </div>

            {/* Section 3: Detailed Feedback */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-blue-100 text-[#2563EB] flex items-center justify-center">
                  <MessageSquare size={11} />
                </div>
                <label className="text-xs sm:text-sm font-bold text-[#0B192C]">
                  Your Impression & Critique <span className="text-red-500">*</span>
                </label>
              </div>
              <div className="relative rounded-xl border border-slate-200 bg-[#F8FAFC] focus-within:bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition p-3 shadow-2xs">
                <textarea
                  required
                  rows={4}
                  maxLength={2000}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Tell us about the fabric quality, stitching, silhouette, fit, and overall finish..."
                  className="w-full text-xs sm:text-sm text-[#0B192C] placeholder:text-slate-400 bg-transparent focus:outline-none resize-none leading-relaxed"
                />
                <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400 font-mono pt-1">
                  <span>{reviewText.length} / 2000</span>
                </div>
              </div>
            </div>

            {/* Section 4: Add Photos (NO ghost model background watermark) */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-blue-100 text-[#2563EB] flex items-center justify-center">
                  <Camera size={11} />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#0B192C]">Add Photos (Optional)</h4>
                  <p className="text-[11px] text-slate-400">Upload actual photos of your product</p>
                </div>
              </div>

              {/* Clean Upload Dropzone */}
              <div className="relative border-2 border-dashed border-blue-200 bg-gradient-to-r from-blue-50/30 via-white to-blue-50/30 hover:bg-blue-50/60 rounded-2xl p-4 sm:p-5 text-center cursor-pointer transition flex flex-col items-center justify-center group">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,.jpg,.jpeg,.png,.webp"
                  onChange={handleFileSelect}
                  disabled={isUploading}
                  className="hidden"
                  id="review-image-upload"
                />
                <label
                  htmlFor="review-image-upload"
                  className={`cursor-pointer inline-flex flex-col items-center space-y-1 w-full ${
                    isUploading ? 'opacity-50 pointer-events-none' : ''
                  }`}
                >
                  <div className="w-11 h-11 rounded-2xl bg-white shadow-xs border border-blue-100 flex items-center justify-center text-[#2563EB] group-hover:scale-105 transition mb-0.5">
                    <UploadCloud size={22} strokeWidth={2.2} />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-[#0B192C] group-hover:text-blue-600 transition">
                    Click to upload photo from device
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Supports JPG, PNG, WEBP • Max 50 MB
                  </span>
                </label>

                {/* Upload Progress */}
                {isUploading && selectedFile && (
                  <div className="w-full mt-3 p-2.5 bg-white border border-blue-100 rounded-xl space-y-1.5 text-left shadow-2xs">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#0B192C] truncate max-w-[200px]">
                        {selectedFile.name}
                      </span>
                      <span className="text-slate-400 font-mono text-[10px]">
                        {formatFileSize(selectedFile.size)}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
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
                  <div className="w-full mt-2 text-left p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center space-x-1.5">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}
              </div>

              {/* Uploaded Customer Photos Preview Strip */}
              {images.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs text-slate-600 font-semibold px-0.5">
                    <span>Attached Photos ({images.length})</span>
                    <span className="text-[11px] text-blue-600">Tap trash icon to remove</span>
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                    {images.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative aspect-square rounded-xl overflow-hidden border border-blue-200 shadow-2xs group bg-slate-100"
                      >
                        <img
                          src={getProductImageUrl(img)}
                          alt={`Uploaded customer photo ${idx + 1}`}
                          referrerPolicy="no-referrer"
                          onError={handleImageError}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.2 rounded">
                          #{idx + 1}
                        </span>
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
                </div>
              )}
            </div>

            {/* Form Error Banner */}
            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center space-x-2">
                <AlertCircle size={15} className="shrink-0" />
                <span>{formError}</span>
              </div>
            )}
          </form>
        </div>

        {/* 3. Modal Sticky Action Footer (Always accessible on mobile) */}
        <div className="sticky bottom-0 bg-white/95 backdrop-blur-md px-4 sm:px-6 py-3 border-t border-slate-100 shadow-[0_-4px_15px_rgba(0,0,0,0.04)] shrink-0 z-20">
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting || isUploading}
              className="w-full py-2.5 sm:py-3 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs sm:text-sm hover:bg-slate-50 active:scale-98 transition flex items-center justify-center cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="review-form"
              disabled={isSubmitting || isUploading}
              className="w-full py-2.5 sm:py-3 rounded-xl bg-[#0B192C] hover:bg-[#1E3A8A] text-white font-bold text-xs sm:text-sm shadow-md active:scale-98 transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Send size={13} className="-rotate-12" />
              <span>
                {isSubmitting
                  ? 'Saving...'
                  : existingReview
                  ? 'Update Review'
                  : 'Publish Review'}
              </span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
