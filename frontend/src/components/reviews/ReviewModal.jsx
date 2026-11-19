import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, CheckCircle2, AlertCircle, Trash2, Image as ImageIcon } from 'lucide-react';
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
      // Preserve existing images if upload fails!
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
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white border border-[#E9E1D6] max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl rounded-2xl relative my-8 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#F2ECE1] pb-4">
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#C5A059] font-cinzel font-semibold block">
              Patron Impressions
            </span>
            <h3 className="font-serif-luxury text-xl sm:text-2xl font-bold text-[#14110C] mt-0.5">
              {existingReview ? 'Refine Your Review' : 'Share Your Experience'}
            </h3>
            <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
              Piece: <span className="font-medium text-[#14110C]">{productTitle}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-black transition rounded-full hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* Verified Buyer Callout */}
        {isVerifiedBuyer && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center space-x-2 text-emerald-800 text-xs">
            <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
            <span className="font-medium">
              You are recognized as a <strong>Verified Buyer</strong> of this piece. Your review will display a verified trust badge.
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 1-5 Star Interactive Rating */}
          <div className="space-y-2">
            <label className="block text-xs uppercase tracking-wider text-gray-600 font-semibold">
              Select Your Rating *
            </label>
            <div className="flex items-center space-x-3">
              <RatingStars
                rating={rating}
                interactive={true}
                size="xl"
                onChange={(newRating) => setRating(newRating)}
              />
              <span className="font-mono text-sm font-bold text-[#14110C]">
                {rating} / 5
              </span>
            </div>
            <p className="text-[11px] text-[#A68B66] font-serif italic">
              {ratingDescriptions[rating] || ''}
            </p>
          </div>

          {/* Review Title Input */}
          <div className="space-y-1.5">
            <label className="block text-xs uppercase tracking-wider text-gray-600 font-semibold">
              Review Title (Optional)
            </label>
            <input
              type="text"
              maxLength={150}
              value={reviewTitle}
              onChange={(e) => setReviewTitle(e.target.value)}
              placeholder="e.g., Exquisite drape and royal finish..."
              className="w-full text-xs sm:text-sm bg-[#FAF9F6] border border-[#E9E1D6] rounded-xl p-3 focus:outline-none focus:border-[#C5A059] transition"
            />
          </div>

          {/* Commentary Textarea */}
          <div className="space-y-1.5">
            <label className="block text-xs uppercase tracking-wider text-gray-600 font-semibold">
              Your Impression & Critique *
            </label>
            <textarea
              required
              rows={4}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Detail the drape, fabric weave, embroidery precision, and how the silhouette felt when worn..."
              className="w-full text-xs sm:text-sm bg-[#FAF9F6] border border-[#E9E1D6] rounded-xl p-3.5 focus:outline-none focus:border-[#C5A059] transition"
            />
            <span className="text-[10px] text-gray-400 block text-right">
              {reviewText.length} / 2000 characters
            </span>
          </div>

          {/* Image Upload Section (Up to 50MB, JPG/PNG/WEBP) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs uppercase tracking-wider text-gray-600 font-semibold">
                Add Photos (Optional)
              </label>
              <span className="text-[10px] text-gray-400 font-medium">
                Max 50 MB • JPG, PNG, WEBP
              </span>
            </div>

            {/* Gallery of currently added images */}
            {images.length > 0 && (
              <div className="flex flex-wrap gap-2.5">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative w-16 h-20 rounded-lg overflow-hidden border border-[#E9E1D6] shadow-2xs group"
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
                      className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-red-600 text-white rounded-full transition"
                      title="Remove image"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Box */}
            <div className="border-2 border-dashed border-[#E9E1D6] rounded-xl p-4 text-center hover:border-[#C5A059] transition bg-[#FAF9F6]">
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
                className={`cursor-pointer inline-flex flex-col items-center space-y-1.5 ${
                  isUploading ? 'opacity-50 pointer-events-none' : ''
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-white border border-[#E9E1D6] flex items-center justify-center text-[#C5A059] shadow-2xs">
                  <Upload size={18} />
                </div>
                <span className="text-xs font-semibold text-[#14110C]">
                  Click to select photo from device
                </span>
                <span className="text-[10.5px] text-gray-400">
                  Supports up to 50 MB high-resolution images
                </span>
              </label>

              {/* Live Upload Progress */}
              {isUploading && selectedFile && (
                <div className="mt-3 p-3 bg-white border border-[#E9E1D6] rounded-lg space-y-2 text-left">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[#14110C] truncate max-w-[200px]">
                      {selectedFile.name}
                    </span>
                    <span className="text-gray-400 font-mono">
                      {formatFileSize(selectedFile.size)}
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#C5A059] transition-all duration-200 ease-out rounded-full"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-500">
                    <span>Uploading image...</span>
                    <span className="font-bold text-[#C5A059]">{uploadProgress}%</span>
                  </div>
                </div>
              )}

              {/* Upload Error Message */}
              {uploadError && (
                <div className="mt-2 text-left p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center space-x-1.5">
                  <AlertCircle size={14} className="flex-shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}
            </div>
          </div>

          {/* Form Error Banner */}
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center space-x-2">
              <AlertCircle size={15} className="flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-[#F2ECE1]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting || isUploading}
              className="px-5 py-2.5 text-xs uppercase tracking-wider text-gray-600 hover:text-black font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className={`px-7 py-2.5 bg-[#14110C] hover:bg-[#C5A059] text-white text-xs uppercase tracking-[0.2em] font-semibold transition duration-300 shadow-sm rounded-xs flex items-center space-x-2 ${
                isSubmitting || isUploading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              <span>{isSubmitting ? 'Recording...' : existingReview ? 'Update Impression' : 'Publish Review'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
