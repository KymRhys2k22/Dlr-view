import { getCloudinaryPublicIds } from '../utils/cloudinary';

const FUNCTION_URL = `${
  import.meta.env.VITE_SUPABASE_URL || 'https://dxncgchzwmfbbgqpnurq.supabase.co'
}/functions/v1/delete-cloudinary-images`;

const FUNCTION_KEY =
  import.meta.env.VITE_DLR_FUNCTIONS_KEY || '';

/**
 * Deletes Cloudinary images for a list of image URLs.
 * Public IDs are extracted server-side safely via a Supabase Edge Function
 * that holds the Cloudinary admin API credentials as secrets.
 *
 * @param imageUrls Raw/optimized Cloudinary image URLs of the record
 * @returns The publicIds that were processed
 */
export async function deleteCloudinaryImages(
  imageUrls: Array<string | null | undefined>
): Promise<{ publicIds: string[]; deleted: Record<string, string> }> {
  const publicIds = getCloudinaryPublicIds(imageUrls);
  if (publicIds.length === 0) {
    return { publicIds: [], deleted: {} };
  }

  const res = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${FUNCTION_KEY}`,
    },
    body: JSON.stringify({ publicIds }),
  });

  const data = (await res.json().catch(() => ({}))) as {
    error?: string;
    deleted?: Record<string, string>;
  };

  if (!res.ok) {
    throw new Error(data.error || `Failed to delete Cloudinary images (${res.status})`);
  }

  return { publicIds, deleted: data.deleted ?? {} };
}