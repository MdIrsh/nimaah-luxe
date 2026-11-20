export const FALLBACK_PRODUCT_IMAGE =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400" fill="none"><rect width="400" height="400" fill="%23F1F5F9"/><path d="M160 160h80v80h-80z" fill="%23CBD5E1"/><path d="M175 195l15 20 20-25 25 35h-70z" fill="%2394A3B8"/><circle cx="180" cy="180" r="8" fill="%2394A3B8"/><text x="50%" y="280" font-family="sans-serif" font-size="14" fill="%2364748B" text-anchor="middle" font-weight="600">Ni%27maah Luxe</text></svg>';

/**
 * Universal product image URL resolver.
 * Handles:
 * 1. Mobile phone testing over local Wi-Fi (e.g. http://192.168.100.2:5173 -> resolves to port 5000 on that same host)
 * 2. PC Localhost (http://localhost:5000/uploads/...)
 * 3. Production Render (https://nimaah-luxe.onrender.com/uploads/...)
 * 4. Cloudinary CDN & external URLs
 * 5. Base64 & blob preview URLs
 */
export const getProductImageUrl = (url) => {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return FALLBACK_PRODUCT_IMAGE;
  }

  const trimmed = url.trim();

  // If already a data URL (Base64) or blob URL, return as is
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed;
  }

  // If URL points to /uploads/ (from localhost, render, or relative)
  if (trimmed.includes('/uploads/')) {
    const filename = trimmed.split('/uploads/')[1]?.split('?')[0];
    if (filename) {
      if (typeof window !== 'undefined') {
        // Local Vite server on PC or phone via Wi-Fi: forward to port 5000
        if (window.location.port === '5173' || window.location.port === '3000') {
          return `http://${window.location.hostname}:5000/uploads/${filename}`;
        }

        // On production Render or single-service hosting
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
