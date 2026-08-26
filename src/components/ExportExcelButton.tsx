import React, { useState } from 'react';
import { FileSpreadsheet, Check } from 'lucide-react';
import { DLRRecord } from '../types/dlr';
import { exportDLRToExcel } from '../utils/exportExcel';

interface ExportExcelButtonProps {
  records: DLRRecord[];
  selectedDepartment: string;
  storeCode: string;
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const ExportExcelButton: React.FC<ExportExcelButtonProps> = ({
  records,
  selectedDepartment,
  storeCode,
  onToast,
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    if (records.length === 0) {
      onToast('No records available to export.', 'info');
      return;
    }

    try {
      setIsExporting(true);
      exportDLRToExcel(records, selectedDepartment, storeCode);
      onToast(`Exported ${records.length} DLR record(s) to Excel!`, 'success');
      setTimeout(() => {
        setIsExporting(false);
      }, 1500);
    } catch (err) {
      console.error('Export failed:', err);
      setIsExporting(false);
      onToast('Failed to generate Excel file.', 'error');
    }
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={isExporting || records.length === 0}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 shadow-sm ${
        records.length === 0
          ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
          : isExporting
          ? 'bg-emerald-600 text-white shadow-emerald-600/20'
          : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-emerald-600/20 hover:shadow-md'
      }`}
      title={`Export ${records.length} visible records to Excel (.xlsx)`}
    >
      {isExporting ? (
        <>
          <Check className="w-4 h-4 text-white animate-in zoom-in-50" />
          <span>Exporting...</span>
        </>
      ) : (
        <>
          <FileSpreadsheet className="w-4 h-4" />
          <span>Export Excel</span>
          <span className="px-1.5 py-0.2 text-[11px] font-bold rounded-md bg-emerald-700/60 text-emerald-100">
            {records.length}
          </span>
        </>
      )}
    </button>
  );
};
