import { supabase } from '../lib/supabase';
import { DLRRecord, RawSupabaseDLRRecord } from '../types/dlr';
import { normalizeDlrRecord } from '../utils/normalizeDlr';
import { getStoreNameByCode } from '../data/store';

export async function fetchDLRRecordsFromSupabase(storeCode: string): Promise<DLRRecord[]> {
  const normalizedStoreCode = storeCode.trim();
  const storeName = getStoreNameByCode(normalizedStoreCode);

  // Build filter condition matching either numeric code (e.g. "202") or full name (e.g. "RDSI - PAVILLION")
  let orFilter = `Store Code.eq."${normalizedStoreCode}"`;
  if (storeName && storeName !== normalizedStoreCode) {
    orFilter = `Store Code.eq."${normalizedStoreCode}",Store Code.eq."${storeName}"`;
  }

  // 1. Try querying 'dlr_unsigned' first
  let { data, error } = await supabase
    .from('dlr_unsigned')
    .select('*')
    .or(orFilter)
    .order('created_at', { ascending: false });

  // If table 'dlr_unsigned' is not found, fallback to 'dlr_records'
  if (error && (error.code === 'PGRST205' || error.message.includes('not find the table') || error.code === '42P01')) {
    const fallbackRes = await supabase
      .from('dlr_records')
      .select('*')
      .or(orFilter)
      .order('created_at', { ascending: false });

    data = fallbackRes.data;
    error = fallbackRes.error;
  }

  // If there was an error that isn't handled by fallback
  if (error) {
    console.error('Supabase query error:', error.message);
    throw new Error(error.message || 'Failed to fetch DLR records');
  }

  const rawList: RawSupabaseDLRRecord[] = (data || []) as RawSupabaseDLRRecord[];

  // Double check store code / name match to guarantee strict store data isolation
  const filtered = rawList.filter((item) => {
    const itemStore = String(item['Store Code'] ?? item.StoreCode ?? item.store_code ?? '').trim();
    if (!itemStore) return false;
    if (itemStore === normalizedStoreCode) return true;
    if (storeName && itemStore.toLowerCase() === storeName.toLowerCase()) return true;
    return false;
  });

  return filtered.map((row, index) => normalizeDlrRecord(row, index));
}
