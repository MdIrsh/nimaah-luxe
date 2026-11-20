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
import { getProductImageUrl } from '../../utils/imageUtils';
import { useAuth } from '../../context/AuthContext';

export const ReviewModal = ({
  isOpen,
  onClose,
  onSubmit,
  existingReview = null,
  productTitle = 'Product',
  productImage = '',
  productBrand = "Ni'maah Luxe",
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

  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const fileInputRef = useRef(null);

  // Prevent background scrolling on mobile when modal is open
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

  if (!isOpen) return null;

  const ratingDescriptions = {
    5: 'Masterpiece! Flawless quality and design.',
    4: 'Great! Your opinion matters.',
    3: 'Good experience, satisfactory quality.',
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

  // Safe image display without mock models
  const cleanProductImg =
    productImage && !productImage.includes('unsplash.com')
      ? getProductImageUrl(productImage)
      : '';

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Modal Container: Mobile bottom-sheet & Desktop modal */}
      <div
        className="relative w-full sm:max-w-xl max-h-[94dvh] sm:max-h-[90vh] bg-gradient-to-b from-[#F0F7FF] via-white to-white rounded-t-[28px] sm:rounded-3xl border border-blue-100 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-2 duration-250"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag Indicator Bar */}
        <div className="w-12 h-1 bg-slate-300 rounded-full mx-auto sm:hidden mt-2.5 mb-1 shrink-0" />

        {/* Circular Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-5 sm:right-5 w-8 h-8 rounded-full bg-white/95 border border-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition shadow-2xs cursor-pointer z-30"
          aria-label="Close dialog"
        >
          <X size={16} strokeWidth={2.5} />
        </button>

        {/* 1. Modal Header (Fixed at top) */}
        <div className="px-4 sm:px-6 pt-2 sm:pt-5 pb-3 border-b border-blue-50/80 shrink-0">
          <div className="flex items-center gap-3 sm:gap-4 pr-9">
            {/* Product Thumbnail (Compact & Mobile-friendly, NO dummy woman model) */}
            <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-xl bg-gradient-to-br from-[#E0F2FE] via-[#EDE9FE]/50 to-[#F0FDF4]/40 p-1 flex items-center justify-center border border-blue-100 shadow-2xs relative overflow-hidden shrink-0">
              {cleanProductImg ? (
                <img
                  src={cleanProductImg}
                  alt={productTitle}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                  className="w-full h-full object-contain mix-blend-multiply drop-shadow-xs"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-blue-600">
                  <ShoppingBag size={20} strokeWidth={1.75} />
                  <span className="text-[9px] font-bold uppercase tracking-wider mt-0.5">Luxe</span>
                </div>
              )}
            </div>

            {/* Header Titles */}
            <div className="min-w-0 flex-1">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#2563EB] block truncate">
                {productBrand || "Ni'maah Luxe"}
              </span>
              <h3 className="text-base sm:text-xl font-extrabold text-[#0B192C] tracking-tight leading-snug truncate">
                {existingReview ? 'Refine Your Experience' : 'Rate & Review Product'}
              </h3>
              <p className="text-[11px] text-slate-500 flex items-center gap-1 truncate">
                <span>Your feedback helps us serve you better</span>
                <Heart size={11} className="text-blue-500 fill-blue-500 shrink-0" />
              </p>
            </div>
          </div>

          {/* Verified Buyer Badge */}
          {isVerifiedBuyer && (
            <div className="mt-2.5 bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-1 flex items-center space-x-1.5 text-emerald-800 text-[11px]">
              <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
              <span className="font-semibold">Verified Buyer: Official badge will be displayed</span>
            </div>
          )}
        </div>

        {/* 2. Modal Body (Scrollable with mobile overscroll-contain) */}
        <form
          id="review-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-6 py-3.5 space-y-3.5 sm:space-y-4 text-xs"
        >
          {/* Customer Name Field */}
          {!user ? (
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#0B192C]">
                Your Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={50}
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter your name (e.g. Rahul Sharma)"
                className="w-full rounded-xl border border-slate-200 bg-[#F8FAFC] focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 px-3.5 py-2.5 text-xs text-[#0B192C] placeholder:text-slate-400 transition outline-none"
              />
            </div>
          ) : (
            <div className="text-[11px] text-slate-500 font-medium bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5 flex items-center justify-between">
              <span>
                Reviewing as: <strong className="text-slate-800">{user.name}</strong>
              </span>
              <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">
                Patron Account
              </span>
            </div>
          )}

          {/* Section 1: Rating Stars Card */}
          <div className="bg-gradient-to-r from-blue-50/50 via-white to-sky-50/40 border border-blue-100 rounded-xl p-3 sm:p-4 space-y-2 relative shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-full bg-[#2563EB] flex items-center justify-center text-white">
                  <Star size={9} fill="white" className="text-white" />
                </div>
                <label className="text-xs font-bold text-[#0B192C]">
                  Rate Your Experience <span className="text-red-500">*</span>
                </label>
              </div>

              <div className="bg-[#E0F2FE] text-[#0369A1] font-extrabold px-2.5 py-0.5 rounded-full text-[11px] font-sans border border-blue-200/60">
                {rating}.0 / 5
              </div>
            </div>

            {/* Stars Row */}
            <div className="flex items-center justify-between flex-wrap gap-2 pt-0.5">
              <RatingStars
                rating={rating}
                interactive={true}
                size="xl"
                color="amber"
                onChange={(newRating) => setRating(newRating)}
              />
              <span className="text-[11px] text-slate-500 italic">
                {ratingDescriptions[rating] || 'Great! Your opinion matters.'}
              </span>
            </div>
          </div>

          {/* Section 2: Review Title */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <PenLine size={12} className="text-[#2563EB]" />
                <label className="text-xs font-bold text-[#0B192C]">
                  Review Title <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
              </div>
              <span className="text-[10px] text-slate-400 font-sans">
                {reviewTitle.length}/100
              </span>
            </div>
            <input
              type="text"
              maxLength={100}
              value={reviewTitle}
              onChange={(e) => setReviewTitle(e.target.value)}
              placeholder="e.g. Exceptional fabric quality & flawless fit"
              className="w-full rounded-xl border border-slate-200 bg-[#F8FAFC] focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 px-3.5 py-2.5 text-xs text-[#0B192C] placeholder:text-slate-400 transition outline-none"
            />
          </div>

          {/* Section 3: Review Message */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <MessageSquare size={12} className="text-[#2563EB]" />
                <label className="text-xs font-bold text-[#0B192C]">
                  Your Detailed Review <span className="text-red-500">*</span>
                </label>
              </div>
              <span className="text-[10px] text-slate-400 font-sans">
                {reviewText.length}/2000
              </span>
            </div>
            <textarea
              required
              rows={3}
              maxLength={2000}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Tell other patrons about the product quality, finish, comfort, and craftsmanship..."
              className="w-full rounded-xl border border-slate-200 bg-[#F8FAFC] focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 p-3 text-xs text-[#0B192C] placeholder:text-slate-400 transition outline-none resize-none leading-relaxed"
            />
          </div>

          {/* Section 4: Add Photos (Multiple Photos, Mobile-friendly) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Camera size={12} className="text-[#2563EB]" />
                <label className="text-xs font-bold text-[#0B192C]">
                  Customer Photos <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
              </div>
              <span className="text-[10px] text-slate-400">Multiple photos supported</span>
            </div>

            {/* Mobile-friendly Upload Box (Strictly Zero Dummy Watermark) */}
            <div className="border-2 border-dashed border-blue-200 hover:border-blue-400 bg-gradient-to-r from-blue-50/30 via-sky-50/15 to-blue-50/30 hover:bg-blue-50/60 rounded-xl p-3 sm:p-4 text-center cursor-pointer transition">
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
                className={`cursor-pointer inline-flex flex-col items-center justify-center space-y-1 w-full ${
                  isUploading ? 'opacity-50 pointer-events-none' : ''
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-white shadow-2xs border border-blue-100 flex items-center justify-center text-[#2563EB]">
                  <UploadCloud size={20} strokeWidth={2.2} />
                </div>
                <span className="text-xs font-bold text-[#0B192C]">
                  Click to upload photos from device
                </span>
                <span className="text-[10px] text-slate-400">
                  Select multiple photos • JPG, PNG, WEBP (Max 50 MB)
                </span>
              </label>

              {/* Upload Progress Bar */}
              {isUploading && (
                <div className="w-full mt-2.5 p-2 bg-white border border-blue-100 rounded-lg space-y-1 text-left">
                  <div className="flex justify-between text-[11px]">
                    <span className="font-semibold text-slate-700">Uploading photos to cloud...</span>
                    <span className="font-bold text-blue-600">{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 transition-all duration-200 rounded-full"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Upload Error Banner */}
              {uploadError && (
                <div className="w-full mt-2 text-left p-2 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-[11px] flex items-center space-x-1.5">
                  <AlertCircle size={13} className="shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}
            </div>

            {/* Thumbnail Preview Strip */}
            {images.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold px-0.5">
                  <span>Attached Photos ({images.length})</span>
                  <span className="text-blue-600">Tap trash icon to remove</span>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                  {images.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-square rounded-xl overflow-hidden border border-blue-200 shadow-2xs group bg-slate-100"
                    >
                      <img
                        src={getProductImageUrl(img)}
                        alt={`Uploaded photo ${idx + 1}`}
                        referrerPolicy="no-referrer"
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

          {/* Form Error Message */}
          {formError && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center space-x-1.5">
              <AlertCircle size={14} className="shrink-0" />
              <span>{formError}</span>
            </div>
          )}
        </form>

        {/* 3. Modal Sticky Footer (Always visible & comfortable on mobile) */}
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
