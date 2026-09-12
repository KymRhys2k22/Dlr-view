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

  // 1. Try querying 'dlr_records' first
  let { data, error } = await supabase
    .from('dlr_records')
    .select('*')
    .or(orFilter)
    .order('created_at', { ascending: false });

  // If table 'dlr_records' is not found, fallback to 'dlr_unsigned'
  if (error && (error.code === 'PGRST205' || error.message.includes('not find the table') || error.code === '42P01')) {
    const fallbackRes = await supabase
      .from('dlr_unsigned')
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
  const filtered = rawList.filter((item) => isStoreMatch(item, normalizedStoreCode, storeName));

  return filtered.map((row, index) => normalizeDlrRecord(row, index));
}

/**
 * Flexible matcher for store code or name
 */
export function isStoreMatch(
  row: RawSupabaseDLRRecord | null | undefined,
  storeCode: string,
  storeName?: string | null
): boolean {
  if (!row) return false;
  const rawStore = String(
    row['Store Code'] ?? row.StoreCode ?? row.store_code ?? row.storeCode ?? ''
  ).trim();

  // If row has no store specified, allow
  if (!rawStore) return true;

  const targetCode = storeCode.trim().toLowerCase();
  const targetName = (storeName || getStoreNameByCode(storeCode) || '').trim().toLowerCase();
  const itemStore = rawStore.toLowerCase();

  if (itemStore === targetCode) return true;
  if (targetName && itemStore === targetName) return true;
  if (targetName && itemStore.includes(targetName)) return true;
  if (targetCode && itemStore.includes(targetCode)) return true;

  return false;
}

/**
 * Delete a DLR record from Supabase table by ID
 */
export async function deleteDLRRecordFromSupabase(recordId: string): Promise<void> {
  let { error } = await supabase
    .from('dlr_records')
    .delete()
    .eq('id', recordId);

  if (error && (error.code === 'PGRST205' || error.message.includes('not find the table') || error.code === '42P01')) {
    const fallback = await supabase
      .from('dlr_unsigned')
      .delete()
      .eq('id', recordId);
    error = fallback.error;
  }

  if (error) {
    console.error('Supabase delete error:', error.message);
    throw new Error(error.message || 'Failed to delete DLR record from database');
  }
}

/**
 * Insert a new DLR record to Supabase
 */
export async function insertDLRRecordToSupabase(
  record: Partial<RawSupabaseDLRRecord>
): Promise<RawSupabaseDLRRecord> {
  let { data, error } = await supabase
    .from('dlr_records')
    .insert([record])
    .select()
    .single();

  if (
    error &&
    (error.code === 'PGRST205' || error.message.includes('not find the table') || error.code === '42P01')
  ) {
    const fallback = await supabase
      .from('dlr_unsigned')
      .insert([record])
      .select()
      .single();
    data = fallback.data;
    error = fallback.error;
  }

  if (error) {
    console.error('Supabase insert error:', error.message);
    throw new Error(error.message || 'Failed to insert DLR record into database');
  }

  return data as RawSupabaseDLRRecord;
}

/**
 * Hybrid Real-time Sync Engine:
 * 1. Listens to Supabase Realtime WebSocket ('postgres_changes' on 'dlr_records' and 'dlr_unsigned')
 * 2. Runs a lightweight Smart Polling Fallback (every 4 seconds) to guarantee detection even if Realtime replication is disabled in Supabase.
 * 3. Deduplicates IDs so each insert triggers exactly ONE notification.
 */
export function subscribeToDLRChanges({
  storeCode,
  initialRecords = [],
  onInsert,
  onDelete,
  onStatusChange,
}: {
  storeCode: string;
  initialRecords?: DLRRecord[];
  onInsert: (record: DLRRecord) => void;
  onDelete?: (recordId: string) => void;
  onStatusChange?: (status: string) => void;
}): () => void {
  const normalizedStoreCode = storeCode.trim();
  const storeName = getStoreNameByCode(normalizedStoreCode);

  // Set of known IDs to prevent duplicate notifications
  const knownIds = new Set<string>();
  initialRecords.forEach((r) => knownIds.add(r.id));

  let isDestroyed = false;

  const handleNewRecord = (raw: RawSupabaseDLRRecord) => {
    if (!isStoreMatch(raw, normalizedStoreCode, storeName)) return;

    const record = normalizeDlrRecord(raw);
    if (!record.id || knownIds.has(record.id)) return;

    knownIds.add(record.id);
    onInsert(record);
  };

  // 1. Supabase Real-time WebSocket Channel
  const channelName = `realtime_dlr_${normalizedStoreCode}_${Date.now()}`;
  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'dlr_records',
      },
      (payload) => {
        handleNewRecord(payload.new as RawSupabaseDLRRecord);
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'dlr_unsigned',
      },
      (payload) => {
        handleNewRecord(payload.new as RawSupabaseDLRRecord);
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table: 'dlr_records',
      },
      (payload) => {
        if (onDelete && payload.old && 'id' in payload.old) {
          const id = String(payload.old.id);
          knownIds.delete(id);
          onDelete(id);
        }
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table: 'dlr_unsigned',
      },
      (payload) => {
        if (onDelete && payload.old && 'id' in payload.old) {
          const id = String(payload.old.id);
          knownIds.delete(id);
          onDelete(id);
        }
      }
    )
    .subscribe((status) => {
      if (onStatusChange) {
        onStatusChange(status);
      }
    });

  // 2. Smart Polling Fallback (runs every 4 seconds to guarantee instant alerts)
  const pollForNewInserts = async () => {
    if (isDestroyed) return;

    try {
      let orFilter = `Store Code.eq."${normalizedStoreCode}"`;
      if (storeName && storeName !== normalizedStoreCode) {
        orFilter = `Store Code.eq."${normalizedStoreCode}",Store Code.eq."${storeName}"`;
      }

      const { data } = await supabase
        .from('dlr_records')
        .select('*')
        .or(orFilter)
        .order('created_at', { ascending: false })
        .limit(15);

      if (data && Array.isArray(data)) {
        for (const row of data) {
          handleNewRecord(row as RawSupabaseDLRRecord);
        }
      }
    } catch (err) {
      console.debug('Polling check error:', err);
    }
  };

  const intervalId = setInterval(pollForNewInserts, 4000);

  return () => {
    isDestroyed = true;
    clearInterval(intervalId);
    supabase.removeChannel(channel);
  };
}

/**
 * Update the 'Status' column for one or more DLR records in Supabase
 */
export async function updateDLRStatusInSupabase(
  recordIds: string[],
  status: string | null
): Promise<void> {
  if (!recordIds.length) return;

  let { error } = await supabase
    .from('dlr_records')
    .update({ Status: status })
    .in('id', recordIds);

  if (error && (error.code === 'PGRST205' || error.message.includes('not find the table') || error.code === '42P01')) {
    const fallback = await supabase
      .from('dlr_unsigned')
      .update({ Status: status })
      .in('id', recordIds);
    error = fallback.error;
  }

  if (error) {
    console.error('Supabase update Status error:', error.message);
    throw new Error(error.message || 'Failed to update Status in database');
  }
}

/**
 * Update the 'dlr-number' column for one or more DLR records in Supabase
 */
export async function updateDLRNumberInSupabase(
  recordIds: string[],
  dlrNumber: string
): Promise<void> {
  if (!recordIds.length) return;
  const cleanDlr = dlrNumber.trim();

  let { error } = await supabase
    .from('dlr_records')
    .update({ 'dlr-number': cleanDlr })
    .in('id', recordIds);

  if (error && (error.code === 'PGRST205' || error.message.includes('not find the table') || error.code === '42P01')) {
    const fallback = await supabase
      .from('dlr_unsigned')
      .update({ 'dlr-number': cleanDlr })
      .in('id', recordIds);
    error = fallback.error;
  }

  if (error) {
    console.error('Supabase update dlr-number error:', error.message);
    throw new Error(error.message || 'Failed to update DLR number in database');
  }
}

/**
 * Remove or clear the 'dlr-number' column for one or more DLR records (unfile)
 */
export async function unfileDLRRecordInSupabase(
  recordIds: string[]
): Promise<void> {
  if (!recordIds.length) return;

  let { error } = await supabase
    .from('dlr_records')
    .update({ 'dlr-number': null })
    .in('id', recordIds);

  if (error && (error.code === 'PGRST205' || error.message.includes('not find the table') || error.code === '42P01')) {
    const fallback = await supabase
      .from('dlr_unsigned')
      .update({ 'dlr-number': null })
      .in('id', recordIds);
    error = fallback.error;
  }

  if (error) {
    console.error('Supabase unfile error:', error.message);
    throw new Error(error.message || 'Failed to unfile DLR record in database');
  }
}

