export interface SubDepartmentOption {
  code: number;
  label: string;
}

export interface DepartmentOption {
  code: number;
  name: string;
  label: string;
  subDepartments: SubDepartmentOption[];
}

/**
 * Canonical Daiso Department and Sub Department structure
 * Exactly matches the database values in Supabase dlr_records
 */
export const DAISO_DEPARTMENTS: DepartmentOption[] = [
  {
    code: 100,
    name: 'Fashion',
    label: '100 · Fashion',
    subDepartments: [
      { code: 110, label: '110 · Apparel' },
      { code: 120, label: '120 · Accessories' },
    ],
  },
  {
    code: 150,
    name: 'Outdoor & GMS',
    label: '150 · Outdoor & GMS',
    subDepartments: [
      { code: 160, label: '160 · General Merchandise' },
      { code: 170, label: '170 · Outdoor' },
    ],
  },
  {
    code: 200,
    name: 'Food & DIY',
    label: '200 · Food & DIY',
    subDepartments: [
      { code: 210, label: '210 · Stationery' },
      { code: 220, label: '220 · DIY' },
    ],
  },
  {
    code: 250,
    name: 'Houseware',
    label: '250 · Houseware',
    subDepartments: [
      { code: 260, label: '260 · Storage & Living' },
      { code: 270, label: '270 · Kitchen' },
      { code: 280, label: '280 · Tableware' },
    ],
  },
  {
    code: 300,
    name: 'Cleaning',
    label: '300 · Cleaning',
    subDepartments: [
      { code: 310, label: '310 · DIY' },
      { code: 320, label: '320 · Laundry' },
    ],
  },
];

/**
 * Match a raw department code or string to one of the canonical DepartmentOption labels
 */
export function matchDepartmentOption(
  rawDept: string | number | null | undefined
): DepartmentOption {
  if (rawDept === null || rawDept === undefined || rawDept === '') {
    return DAISO_DEPARTMENTS[3]; // Default to Houseware
  }

  const str = String(rawDept).toLowerCase().trim();

  // Try numerical match first
  const parsedNum = parseInt(str, 10);
  if (!Number.isNaN(parsedNum)) {
    const found = DAISO_DEPARTMENTS.find(
      (d) => d.code === parsedNum || str.startsWith(String(d.code))
    );
    if (found) return found;
  }

  // Try text match
  if (str.includes('fashion') || str.includes('apparel')) return DAISO_DEPARTMENTS[0];
  if (str.includes('outdoor') || str.includes('gms')) return DAISO_DEPARTMENTS[1];
  if (str.includes('food') || str.includes('stationery')) return DAISO_DEPARTMENTS[2];
  if (str.includes('houseware') || str.includes('kitchen') || str.includes('tableware')) return DAISO_DEPARTMENTS[3];
  if (str.includes('cleaning') || str.includes('laundry')) return DAISO_DEPARTMENTS[4];

  return DAISO_DEPARTMENTS[3];
}

/**
 * Get the list of sub-departments for a given department label
 */
export function getSubDepartmentsForDepartment(departmentLabel: string): SubDepartmentOption[] {
  const dept = DAISO_DEPARTMENTS.find((d) => d.label === departmentLabel);
  return dept ? dept.subDepartments : [];
}

/**
 * Check if a sub-department label belongs to a department
 */
export function isValidSubDepartment(departmentLabel: string, subDepLabel: string | null | undefined): boolean {
  if (!subDepLabel) return true;
  const subDeps = getSubDepartmentsForDepartment(departmentLabel);
  return subDeps.some((s) => s.label === subDepLabel || s.label.toLowerCase().includes(subDepLabel.toLowerCase()));
}
