import { RawSupabaseDLRRecord, DLRRecord } from '../types/dlr';
import { getDepartmentName } from './getDepartmentName';

export function normalizeDlrRecord(raw: RawSupabaseDLRRecord, index = 0): DLRRecord {
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

  // Extract images array (Quantity, Damage, Barcode)
  const rawImages = raw.image ?? raw.Image ?? raw.images ?? [];
  const images = Array.isArray(rawImages) ? rawImages.filter(Boolean) : [];

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
    createdAt: raw.created_at,
  };
}
