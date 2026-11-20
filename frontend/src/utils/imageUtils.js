export const FALLBACK_PRODUCT_IMAGE =
  'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80';

/**
 * Universal product image URL resolver.
 * Handles:
 * 1. localhost:5000 URLs when accessed from mobile or remote production (Render)
 * 2. Relative URLs (/uploads/...)
 * 3. CDN & external URLs (Cloudinary, etc.)
 * 4. Fallback for invalid/empty URLs
 */
export const getProductImageUrl = (url) => {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return FALLBACK_PRODUCT_IMAGE;
  }

  const trimmed = url.trim();

  // If URL points to /uploads/ (from localhost, render, or relative)
  if (trimmed.includes('/uploads/')) {
    const filename = trimmed.split('/uploads/')[1]?.split('?')[0];
    if (filename) {
      if (typeof window !== 'undefined') {
        const isLocalDev =
          (window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1') &&
          (window.location.port === '5173' || window.location.port === '3000');

        if (isLocalDev) {
          return `http://localhost:5000/uploads/${filename}`;
        }

        // On production Render or mobile, use root relative /uploads/
        return `/uploads/${filename}`;
      }
      return `/uploads/${filename}`;
    }
  }

  return trimmed;
};

/**
 * Reliable fallback image handler for <img> onError
 */
export const handleImageError = (e, fallback = FALLBACK_PRODUCT_IMAGE) => {
  if (!e?.currentTarget) return;
  e.currentTarget.onerror = null;
  e.currentTarget.src = fallback;
};
