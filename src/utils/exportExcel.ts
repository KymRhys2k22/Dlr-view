import * as XLSX from 'xlsx';
import { DLRRecord } from '../types/dlr';
import { getDepartmentName } from './getDepartmentName';

export interface ExportExcelOptions {
  includeImages?: boolean;
  filenameOverride?: string;
  isApproved?: boolean;
  isFiled?: boolean;
  dlrNumber?: string;
}

export function exportDLRToExcel(
  records: DLRRecord[],
  selectedDepartment: string,
  _storeCode?: string,
  options: ExportExcelOptions = {}
): void {
  const isApproved = Boolean(options.isApproved);
  const isFiled = Boolean(options.isFiled);
  const isBatchExport = isApproved || isFiled || Boolean(options.dlrNumber);

  // In Filed / Approved batch export:
  // - Put DLR number into A1 row at the top of the Excel sheet
  // - Put Department into B1 row at the top of the Excel sheet
  // - Do NOT include DLR Number or Department in the table columns
  // - Omit {Department Code, Sub department, SecondReason, Store Code} and images
  if (isBatchExport) {
    const rawDlr =
      options.dlrNumber ||
      Array.from(new Set(records.map((r) => r.dlrNumber).filter(Boolean))).join(', ') ||
      'Unfiled';
    const cleanDlr = String(rawDlr).trim().replace(/^#/, '');
    const topHeader = cleanDlr ? `DLR Number: ${cleanDlr}` : 'DLR Number: Unfiled';

    // Extract department name(s) for Row 1 (Cell B1)
    const deptList = Array.from(
      new Set(records.map((r) => getDepartmentName(r.departmentCode)).filter(Boolean))
    );
    const deptName =
      deptList.length > 0
        ? deptList.join(', ')
        : selectedDepartment &&
          !selectedDepartment.startsWith('Approved_') &&
          !selectedDepartment.startsWith('Filed_')
        ? selectedDepartment
        : 'All Departments';
    const deptHeader = `Department: ${deptName}`;

    const rows: (string | number)[][] = [
      [topHeader, deptHeader], // Row 1: A1 = DLR Number, B1 = Department
      ['SKU', 'Description', 'UPC', 'Cost', 'Price', 'Reason', 'Qty'], // Row 2: Columns
    ];

    for (const record of records) {
      rows.push([
        record.sku,
        record.description,
        record.upc,
        record.costRaw || record.cost.toFixed(2),
        record.priceRaw || record.price.toFixed(2),
        record.reason,
        record.qty,
      ]);
    }

    const worksheet = XLSX.utils.aoa_to_sheet(rows);

    // Set column widths for readability; column A accommodates A1, column B accommodates B1
    worksheet['!cols'] = [
      { wch: Math.max(20, topHeader.length + 2) }, // SKU (and A1 DLR Number)
      { wch: Math.max(35, deptHeader.length + 2) }, // Description (and B1 Department)
      { wch: 16 }, // UPC
      { wch: 10 }, // Cost
      { wch: 10 }, // Price
      { wch: 22 }, // Reason
      { wch: 8 },  // Qty
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'DLR Reports');

    const today = new Date().toISOString().split('T')[0];
    const prefix = isApproved ? 'Approved' : 'Filed';
    let filename = options.filenameOverride;
    if (!filename) {
      const safeDlr = cleanDlr.replace(/[^a-zA-Z0-9_-]/g, '_');
      filename = `DLR_${prefix}_${safeDlr}_${today}.xlsx`;
    }

    XLSX.writeFile(workbook, filename);
    return;
  }

  const includeImages = options.includeImages !== false;

  // Map records to Excel rows with exact column names required
  const excelData = records.map((record) => {
    // Department name MUST use getDepartmentName()
    const departmentName = getDepartmentName(record.departmentCode);

    const row: Record<string, string | number> = {
      'DLR Number': record.dlrNumber || 'Unfiled',
      SKU: record.sku,
      Description: record.description,
      UPC: record.upc,
      'Department Code':
        record.departmentCode !== null && record.departmentCode !== undefined
          ? String(record.departmentCode)
          : '',
      Department: departmentName,
      'Sub Department': record.subDep || '',
      Cost: record.costRaw || record.cost.toFixed(2),
      Price: record.priceRaw || record.price.toFixed(2),
      Reason: record.reason,
      SecondReason: record.secondReason || '',
      Qty: record.qty,
      'Store Code': record.storeCode,
    };

    if (includeImages) {
      row['Quantity Image'] = record.images[0] || '';
      row['Damage Image'] = record.images[1] || '';
      row['Barcode Image'] = record.images[2] || '';
    }

    return row;
  });

  // Create workbook and worksheet
  const worksheet = XLSX.utils.json_to_sheet(excelData);

  // Set column widths for readability
  const cols = [
    { wch: 16 }, // DLR Number
    { wch: 12 }, // SKU
    { wch: 35 }, // Description
    { wch: 16 }, // UPC
    { wch: 16 }, // Department Code
    { wch: 18 }, // Department
    { wch: 22 }, // Sub Department
    { wch: 10 }, // Cost
    { wch: 10 }, // Price
    { wch: 22 }, // Reason
    { wch: 22 }, // SecondReason
    { wch: 8 },  // Qty
    { wch: 18 }, // Store Code
  ];

  if (includeImages) {
    cols.push(
      { wch: 45 }, // Quantity Image
      { wch: 45 }, // Damage Image
      { wch: 45 }  // Barcode Image
    );
  }

  worksheet['!cols'] = cols;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'DLR Reports');

  const today = new Date().toISOString().split('T')[0];
  let filename = options.filenameOverride;

  if (!filename) {
    const safeDeptName = (selectedDepartment || 'All_Departments')
      .replace(/\s+&\s+/g, '_')
      .replace(/\s+/g, '_')
      .replace(/[^a-zA-Z0-9_]/g, '');
    filename = `DLR_${safeDeptName}_${today}.xlsx`;
  }

  // Trigger download
  XLSX.writeFile(workbook, filename);
}

/**
 * Export an individual filed or approved DLR batch:
 * - DLR number placed in A1 row
 * - Department placed in B1 row
 * - DLR Number & Department excluded from table columns
 * - {Department Code, Sub department, SecondReason, Store Code, images} omitted
 */
export function exportFiledDLRBatchToExcel(
  records: DLRRecord[],
  dlrNumber: string,
  storeCode?: string,
  isApproved: boolean = false
): void {
  const prefix = isApproved ? 'Approved' : 'Filed';
  const today = new Date().toISOString().split('T')[0];
  const safeDlr = String(dlrNumber || 'Batch').replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `DLR_${prefix}_${safeDlr}_${today}.xlsx`;

  exportDLRToExcel(records, `${prefix}_${safeDlr}`, storeCode, {
    isApproved,
    isFiled: !isApproved,
    includeImages: false,
    dlrNumber,
    filenameOverride: filename,
  });
}

/**
 * Export an individual approved DLR batch
 */
export function exportApprovedDLRBatchToExcel(
  records: DLRRecord[],
  dlrNumber: string,
  storeCode?: string
): void {
  exportFiledDLRBatchToExcel(records, dlrNumber, storeCode, true);
}
