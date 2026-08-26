/**
 * Department Name Mapper for Daiso Damage & Lost Report (DLR)
 *
 * CRITICAL RULE:
 * Department MUST be determined using the department code returned from Supabase.
 * Do NOT infer department from SKU, Description, Reason, UPC, Price, Product name, or Image.
 */
export function getDepartmentName(
  deptCode: string | number | null | undefined
): string {
  try {
    if (deptCode === null || deptCode === undefined || deptCode === '' || deptCode === 'null') {
      return 'Unknown';
    }

    // Convert the Supabase value using Number() or parseInt() for formats like "200 · Food & DIY"
    let value = Number(deptCode);

    if (Number.isNaN(value)) {
      const parsed = parseInt(String(deptCode).trim(), 10);
      if (!Number.isNaN(parsed)) {
        value = parsed;
      }
    }

    if (value === 250) return 'Houseware';
    if (value === 100) return 'Fashion';
    if (value === 200) return 'Food & DIY';
    if (value === 300) return 'Cleaning';
    if (value === 150) return 'Outdoor & GMS';

    // Direct label fallback if formatted name was stored
    const str = String(deptCode).toLowerCase().trim();
    if (str.includes('houseware')) return 'Houseware';
    if (str.includes('fashion')) return 'Fashion';
    if (str.includes('food')) return 'Food & DIY';
    if (str.includes('cleaning')) return 'Cleaning';
    if (str.includes('outdoor')) return 'Outdoor & GMS';

    return 'Unknown';
  } catch {
    return '';
  }
}

export type DepartmentName =
  | 'All Departments'
  | 'Houseware'
  | 'Fashion'
  | 'Food & DIY'
  | 'Cleaning'
  | 'Outdoor & GMS'
  | 'Unknown';

export const DEPARTMENT_TABS: DepartmentName[] = [
  'All Departments',
  'Houseware',
  'Fashion',
  'Food & DIY',
  'Cleaning',
  'Outdoor & GMS',
  'Unknown',
];
