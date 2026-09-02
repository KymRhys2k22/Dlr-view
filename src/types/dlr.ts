import { DepartmentName } from '../utils/getDepartmentName';

export interface RawSupabaseDLRRecord {
  idx?: number;
  id?: string;
  SKU?: string;
  sku?: string;
  Description?: string;
  description?: string;
  UPC?: string;
  upc?: string;
  Cost?: string | number;
  cost?: string | number;
  Price?: string | number;
  price?: string | number;
  Reason?: string;
  reason?: string;
  SecondReason?: string | null;
  secondReason?: string | null;
  second_reason?: string | null;
  Qty?: number | string | null;
  qty?: number | string | null;
  'Store Code'?: string | number;
  StoreCode?: string | number;
  store_code?: string | number;
  storeCode?: string | number;
  image?: string[] | null;
  Image?: string[] | null;
  images?: string[] | null;
  'Department Code'?: string | number | null;
  DepartmentCode?: string | number | null;
  department_code?: string | number | null;
  Department?: string | number | null;
  department?: string | number | null;
  dept_code?: string | number | null;
  SubDep?: string | null;
  sub_dep?: string | null;
  SubDepartment?: string | null;
  'Sub Dep'?: string | null;
  'dlr-number'?: string | null;
  dlr_number?: string | null;
  dlrNumber?: string | null;
  'DLR Number'?: string | null;
  'DLRNumber'?: string | null;
  created_at?: string;
}

export interface DLRRecord {
  id: string;
  sku: string;
  description: string;
  upc: string;
  cost: number;
  costRaw: string;
  price: number;
  priceRaw: string;
  reason: string;
  secondReason: string | null;
  qty: number;
  storeCode: string;
  images: string[];
  departmentCode: string | number | null;
  departmentName: string;
  subDep: string | null;
  dlrNumber: string | null;
  createdAt?: string;
}

export interface FiledDLRGroup {
  dlrNumber: string;
  records: DLRRecord[];
  totalRecords: number;
  totalQuantity: number;
  totalCost: number;
  departments: string[];
  lastUpdated?: string;
}

export interface UserSession {
  name: string;
  storeCode: string;
  storeName: string;
  loginTime: string;
}

export interface SummaryStats {
  totalRecords: number;
  totalQuantity: number;
  totalCost: number;
}

export interface FilterState {
  departments: DepartmentName[];
  search: string;
}
