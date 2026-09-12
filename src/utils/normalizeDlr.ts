import { RawSupabaseDLRRecord, DLRRecord } from '../types/dlr';
import { getDepartmentName } from './getDepartmentName';
import { optimizeImageUrl } from './imageUrl';

export function normalizeDlrRecord(raw: RawSupabaseDLRRecord | null | undefined, index = 0): DLRRecord {
  if (!raw || typeof raw !== 'object') {
    return {
      id: `dlr_fallback_${index}_${Date.now()}`,
      sku: '',
      description: '',
      upc: '',
      cost: 0,
      costRaw: '0',
      price: 0,
      priceRaw: '0',
      reason: 'Unknown Reason',
      secondReason: null,
      qty: 1,
      storeCode: '',
      images: [],
      departmentCode: null,
      departmentName: 'Unknown',
      subDep: null,
      dlrNumber: null,
      status: null,
      createdAt: new Date().toISOString(),
    };
  }

  // Extract department code/string safely from Supabase
  const rawDept =
    raw.Department ??
    raw['Department Code'] ??
    raw.DepartmentCode ??
    raw.department_code ??
    raw.dept_code ??
    raw.department ??
    null;

  // Department name MUST strictly come from getDepartmentName(rawDept)
  const departmentName = getDepartmentName(rawDept);

  // Extract SubDep
  const rawSubDep =
    raw.SubDep ??
    raw.sub_dep ??
    raw.SubDepartment ??
    raw['Sub Dep'] ??
    null;
  const subDep = rawSubDep && rawSubDep !== 'null' ? String(rawSubDep).trim() : null;

  // Extract images array (Quantity, Damage, Barcode) and add /w_700/ to reduce KB size
  const rawImages: unknown = raw.image ?? raw.Image ?? raw.images ?? [];
  let imageList: unknown[] = [];
  if (Array.isArray(rawImages)) {
    imageList = rawImages;
  } else if (typeof rawImages === 'string' && rawImages.trim()) {
    try {
      const parsed = JSON.parse(rawImages);
      if (Array.isArray(parsed)) imageList = parsed;
      else if (typeof parsed === 'string') imageList = [parsed];
      else imageList = [rawImages];
    } catch {
      imageList = rawImages.split(',').map((s: string) => s.trim());
    }
  }
  const images = imageList
    .filter((img): img is string => typeof img === 'string' && img.trim().length > 0 && img.trim().startsWith('http'))
    .map((img) => optimizeImageUrl(img.trim()));

  // Parse numeric cost safely
  const rawCostStr = String(raw.Cost ?? raw.cost ?? '0').trim();
  const costNumber = Number(rawCostStr.replace(/[^0-9.-]+/g, '')) || 0;

  // Parse numeric price safely
  const rawPriceStr = String(raw.Price ?? raw.price ?? '0').trim();
  const priceNumber = Number(rawPriceStr.replace(/[^0-9.-]+/g, '')) || 0;

  // Parse Qty safely: default to 1 if missing/null in the database
  let qtyNumber = 1;
  if (raw.Qty !== null && raw.Qty !== undefined && raw.Qty !== '') {
    const parsed = Number(raw.Qty);
    if (!Number.isNaN(parsed) && parsed > 0) {
      qtyNumber = parsed;
    }
  } else if (raw.qty !== null && raw.qty !== undefined && raw.qty !== '') {
    const parsed = Number(raw.qty);
    if (!Number.isNaN(parsed) && parsed > 0) {
      qtyNumber = parsed;
    }
  }

  // Extract store code/name as a clean string (e.g. "202" or "RDSI - PAVILLION")
  const rawStoreCode = raw['Store Code'] ?? raw.StoreCode ?? raw.store_code ?? raw.storeCode ?? '';
  const storeCode = String(rawStoreCode).trim();

  // Extract dlr-number
  const rawDlrNumber =
    raw['dlr-number'] ??
    raw.dlr_number ??
    raw.dlrNumber ??
    raw['DLR Number'] ??
    raw.DLRNumber ??
    null;
  const dlrNumber = rawDlrNumber && String(rawDlrNumber).trim() !== '' && String(rawDlrNumber).trim() !== 'null'
    ? String(rawDlrNumber).trim()
    : null;

  const rawStatus = raw.Status ?? raw.status ?? null;
  const status = rawStatus && String(rawStatus).trim() !== '' && String(rawStatus).trim() !== 'null'
    ? String(rawStatus).trim().toLowerCase()
    : null;

  return {
    id: raw.id ?? `dlr_${raw.idx ?? index}_${Date.now()}`,
    sku: String(raw.SKU ?? raw.sku ?? '').trim(),
    description: String(raw.Description ?? raw.description ?? '').trim(),
    upc: String(raw.UPC ?? raw.upc ?? '').trim(),
    cost: costNumber,
    costRaw: rawCostStr,
    price: priceNumber,
    priceRaw: rawPriceStr,
    reason: String(raw.Reason ?? raw.reason ?? 'Unknown Reason').trim(),
    secondReason: raw.SecondReason && raw.SecondReason !== 'null' ? String(raw.SecondReason).trim() : null,
    qty: qtyNumber,
    storeCode,
    images,
    departmentCode: rawDept,
    departmentName,
    subDep,
    dlrNumber,
    status,
    createdAt: raw.created_at,
  };
}
