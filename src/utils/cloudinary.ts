/**
 * Extracts the Cloudinary public_id from an image URL.
 * Handles optimized (e.g. /w_700/) and versioned (e.g. /v123456/) URLs.
 * E.g. https://res.cloudinary.com/<cloud>/image/upload/w_700/abc123.jpg -> abc123
 * E.g. https://res.cloudinary.com/<cloud>/image/upload/v123/folder/abc123.png -> folder/abc123
 */
export function getCloudinaryPublicId(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed.includes('cloudinary.com') || !trimmed.includes('/upload/')) return null;

  // Strip optimization/transformation segments (e.g. /w_700/)
  const clean = trimmed.replace(/\/upload\/(?:w_\d+\/)?/, '/upload/');

  const marker = '/upload/';
  const index = clean.indexOf(marker);
  if (index === -1) return null;

  let rest = clean.slice(index + marker.length);
  // Strip optional version segment (e.g. v123456/)
  rest = rest.replace(/^v\d+\//, '');
  // Strip file extension from the last path segment
  rest = rest.replace(/\.[a-zA-Z0-9]+$/, '');

  if (!rest) return null;
  try {
    return decodeURIComponent(rest);
  } catch {
    return rest;
  }
}

/**
 * Extracts Cloudinary public_ids from a list of image URLs.
 */
export function getCloudinaryPublicIds(urls: Array<string | null | undefined>): string[] {
  const ids: string[] = [];
  const seen = new Set<string>();
  for (const url of urls) {
    const id = getCloudinaryPublicId(url);
    if (id && !seen.has(id)) {
      seen.add(id);
      ids.push(id);
    }
  }
  return ids;
}