/**
 * Utility functions for optimizing and transforming image URLs.
 */

/**
 * Adds `/w_700/` transformation to Cloudinary image URLs to reduce image size (KB) and bandwidth.
 * E.g.: https://res.cloudinary.com/.../upload/v123... -> https://res.cloudinary.com/.../upload/w_700/v123...
 *
 * @param url The raw image URL
 * @returns The optimized URL with /w_700/ width parameter
 */
export function optimizeImageUrl(url: string | null | undefined): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  // Avoid duplicate transformation if already present
  if (trimmed.includes('/w_700/')) return trimmed;

  // If it's a Cloudinary upload URL, insert /w_700/ right after /upload/
  // Also cleanly replaces existing width parameter if present (e.g. /upload/w_1200/)
  if (trimmed.includes('cloudinary.com') && trimmed.includes('/upload/')) {
    return trimmed.replace(/\/upload\/(?:w_\d+\/)?/, '/upload/w_700/');
  }

  return trimmed;
}

/**
 * Removes the `/w_700/` (or width transformation) from a Cloudinary image URL to get the original uncompressed image.
 *
 * @param url The image URL
 * @returns The original uncompressed image URL
 */
export function getOriginalImageUrl(url: string | null | undefined): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  return trimmed.replace(/\/upload\/(?:w_\d+\/)?/, '/upload/');
}
