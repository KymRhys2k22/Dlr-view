import * as XLSX from 'xlsx';
import { DLRRecord } from '../types/dlr';
import { getDepartmentName } from './getDepartmentName';

export function exportDLRToExcel(
  records: DLRRecord[],
  selectedDepartment: string,
  _storeCode?: string
): void {
  // Map records to Excel rows with exact column names required
  const excelData = records.map((record) => {
    // Quantity, Damage, Barcode images
    const qtyImg = record.images[0] || '';
    const dmgImg = record.images[1] || '';
    const barImg = record.images[2] || '';

    // Department name MUST use getDepartmentName()
    const departmentName = getDepartmentName(record.departmentCode);

    return {
      'DLR Number': record.dlrNumber || 'Unfiled',
      SKU: record.sku,
      Description: record.description,
      UPC: record.upc,
      'Department Code': record.departmentCode !== null && record.departmentCode !== undefined ? String(record.departmentCode) : '',
      Department: departmentName,
      'Sub Department': record.subDep || '',
      Cost: record.costRaw || record.cost.toFixed(2),
      Price: record.priceRaw || record.price.toFixed(2),
      Reason: record.reason,
      SecondReason: record.secondReason || '',
      Qty: record.qty,
      'Store Code': record.storeCode,
      'Quantity Image': qtyImg,
      'Damage Image': dmgImg,
      'Barcode Image': barImg,
    };
  });

  // Create workbook and worksheet
  const worksheet = XLSX.utils.json_to_sheet(excelData);

  // Set column widths for readability
  worksheet['!cols'] = [
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
    { wch: 45 }, // Quantity Image
    { wch: 45 }, // Damage Image
    { wch: 45 }, // Barcode Image
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'DLR Reports');

  // Generate filename: DLR_{Department}_{YYYY-MM-DD}.xlsx
  const safeDeptName = (selectedDepartment || 'All_Departments')
    .replace(/\s+&\s+/g, '_')
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_]/g, '');

  const today = new Date().toISOString().split('T')[0];
  const filename = `DLR_${safeDeptName}_${today}.xlsx`;

  // Trigger download
  XLSX.writeFile(workbook, filename);
}
