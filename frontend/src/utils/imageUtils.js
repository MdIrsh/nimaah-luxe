export const FALLBACK_PRODUCT_IMAGE =
  'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80';

/**
 * Universal product image URL resolver.
 * Handles:
 * 1. localhost:5000 URLs when accessed from mobile or remote production (Render)
 * 2. Relative URLs (/uploads/...)
 * 3. CDN & external URLs
 * 4. Fallback for invalid/empty URLs
 */
export const getProductImageUrl = (url) => {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return FALLBACK_PRODUCT_IMAGE;
  }

  const trimmed = url.trim();

  // If URL points to localhost or 127.0.0.1 (common when uploaded locally during testing)
  if (trimmed.includes('localhost:5000') || trimmed.includes('127.0.0.1:5000')) {
    const filename = trimmed.split('/uploads/')[1];
    if (filename) {
      const isRemote =
        typeof window !== 'undefined' &&
        window.location.hostname !== 'localhost' &&
        window.location.hostname !== '127.0.0.1';

      if (isRemote) {
        // Point to high-speed CDN hosted on main repo
        return `https://cdn.jsdelivr.net/gh/MdIrsh/nimaah-luxe@main/frontend/public/uploads/${filename}`;
      }
    }
  }

  // If URL starts with relative /uploads/
  if (trimmed.startsWith('/uploads/')) {
    if (typeof window !== 'undefined' && (window.location.port === '5173' || window.location.port === '3000')) {
      return `http://${window.location.hostname}:5000${trimmed}`;
    }
    return trimmed;
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
