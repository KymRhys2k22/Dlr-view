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
      className={`inline-flex items-center justify-center gap-2 px-4 py-2 sm:px-4.5 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer apple-pressable sf-subheadline ${
        records.length === 0
          ? 'bg-black/[0.04] text-slate-400 border border-black/[0.06] cursor-not-allowed opacity-60'
          : isExporting
          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
          : 'bg-gradient-to-b from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 active:from-emerald-700 active:to-emerald-800 text-white shadow-md shadow-emerald-700/25 border border-white/20'
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
          <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-white/20 text-white">
            {records.length}
          </span>
        </>
      )}
    </button>
  );
};
