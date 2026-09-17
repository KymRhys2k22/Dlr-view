import React, { useState, useMemo } from 'react';
import { FileText, ChevronRight, Package, Calendar, Pencil, Check, Clock, FileSpreadsheet, Loader2 } from 'lucide-react';
import { FiledDLRGroup } from '../types/dlr';
import { formatCurrencyPHP } from '../utils/currency';
import { exportFiledDLRBatchToExcel } from '../utils/exportExcel';
import { exportFiledDLRToPdf } from '../utils/exportPdf';

interface FiledDLRCardProps {
  group: FiledDLRGroup;
  onClick: (group: FiledDLRGroup) => void;
  onEditDlr?: (group: FiledDLRGroup) => void;
  onToggleApproved?: (recordIds: string[], currentStatus: string | null) => void;
  onToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
  storeCode?: string;
}

export const FiledDLRCard: React.FC<FiledDLRCardProps> = ({
  group,
  onClick,
  onEditDlr,
  onToggleApproved,
  onToast,
  storeCode,
}) => {
  const isApproved = group.status === 'approved';
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleDownloadPdf = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    try {
      if (onToast) {
        onToast(`Generating PDF with item photos for DLR #${group.dlrNumber}...`, 'info');
      }
      await exportFiledDLRToPdf(group.records, group.dlrNumber, storeCode, {
        status: group.status,
        isApproved,
      });
      if (onToast) {
        onToast(`Downloaded PDF for DLR #${group.dlrNumber}!`, 'success');
      }
    } catch (err) {
      console.error('Failed to export PDF:', err);
      if (onToast) {
        onToast('Failed to generate PDF report', 'error');
      }
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadExcel = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      exportFiledDLRBatchToExcel(group.records, group.dlrNumber, storeCode, isApproved);
      if (onToast) {
        onToast(`Downloaded Excel for DLR #${group.dlrNumber}!`, 'success');
      }
    } catch (err) {
      console.error('Failed to export batch Excel:', err);
      if (onToast) {
        onToast('Failed to export Excel file', 'error');
      }
    }
  };

  // Gather up to 3 thumbnail images from the group records
  const previewImages = useMemo(() => {
    const list: string[] = [];
    for (const r of group.records) {
      if (r.images && Array.isArray(r.images)) {
        for (const url of r.images) {
          if (url && !list.includes(url)) {
            list.push(url);
            if (list.length >= 3) break;
          }
        }
      }
      if (list.length >= 3) break;
    }
    return list;
  }, [group.records]);

  return (
    <div
      onClick={() => onClick(group)}
      className={`apple-card p-5 sm:p-6 space-y-4 cursor-pointer group relative overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-xl ${
        isApproved
          ? 'border-emerald-500/25 bg-gradient-to-b from-emerald-500/[0.02] to-white shadow-emerald-500/5'
          : 'border-black/[0.06] hover:border-black/[0.12]'
      }`}
    >
      {/* Top Specular Accent */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 transition-all ${
          isApproved
            ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
            : 'bg-gradient-to-r from-rose-500 to-rose-600'
        }`}
      />

      {/* Header: DLR Badge, Status, and Controls */}
      <div className="flex items-start justify-between gap-3 pt-0.5">
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {/* DLR Number Capsule */}
            <span className="font-mono text-sm sm:text-base font-bold text-[#1D1D1F] bg-black/[0.04] px-3 py-1 rounded-full border border-black/[0.06] shadow-2xs">
              #{group.dlrNumber}
            </span>

            {/* Edit Button */}
            {onEditDlr && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditDlr(group);
                }}
                className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-[#1D1D1F] hover:bg-black/[0.05] rounded-full transition-colors cursor-pointer apple-pressable"
                title="Edit DLR Number"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Approval Status Pill */}
            {isApproved ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 shadow-2xs sf-caption">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Approved</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium text-amber-800 bg-amber-50 border border-amber-200/60 sf-caption">
                <Clock className="w-3 h-3 text-amber-600" />
                <span>Pending Review</span>
              </span>
            )}

            {/* Individual Download PDF Button */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-rose-800 bg-rose-50 hover:bg-rose-100/90 active:bg-rose-200 border border-rose-200/80 transition-all cursor-pointer apple-pressable sf-caption shadow-2xs disabled:opacity-60"
              title={`Download PDF report with item photos for DLR #${group.dlrNumber}`}
            >
              {isGeneratingPdf ? (
                <Loader2 className="w-3 h-3 text-rose-600 animate-spin" />
              ) : (
                <FileText className="w-3 h-3 text-rose-600" />
              )}
              <span>PDF</span>
            </button>

            {/* Individual Download Excel Button */}
            <button
              type="button"
              onClick={handleDownloadExcel}
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-emerald-800 bg-emerald-100/90 hover:bg-emerald-200 border border-emerald-300/80 transition-all cursor-pointer apple-pressable sf-caption shadow-2xs"
              title={`Download Excel for DLR #${group.dlrNumber} (clean batch format)`}
            >
              <FileSpreadsheet className="w-3 h-3 text-emerald-700" />
              <span>Excel</span>
            </button>
          </div>

          {/* Date Label */}
          {group.lastUpdated && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400 sf-caption">
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              <span>Filed {new Date(group.lastUpdated).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {/* Right side: Interactive Approval Switch & Open Chevron */}
        <div className="flex items-center gap-2 shrink-0">
          {onToggleApproved && (
            <div
              className="flex items-center gap-1.5 bg-black/[0.03] px-2 py-1 rounded-full border border-black/[0.04]"
              title={isApproved ? 'Click to mark as pending' : 'Click to approve this batch'}
              onClick={(e) => e.stopPropagation()}
            >
              <span className="text-[10px] font-semibold text-slate-500 sf-caption hidden sm:inline">
                {isApproved ? 'Approved' : 'Approve'}
              </span>
              <button
                type="button"
                onClick={() => {
                  onToggleApproved(
                    group.records.map((r) => r.id),
                    group.status
                  );
                }}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer apple-pressable ${
                  isApproved ? 'bg-emerald-500' : 'bg-black/[0.14]'
                }`}
                aria-label={isApproved ? 'Mark unapproved' : 'Mark approved'}
              >
                <span
                  className={`relative inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform ${
                    isApproved ? 'translate-x-[17px]' : 'translate-x-[3px]'
                  }`}
                >
                  {isApproved && (
                    <Check className="absolute w-2.5 h-2.5 text-emerald-600 top-[2px] left-[2px]" />
                  )}
                </span>
              </button>
            </div>
          )}

          <div className="w-8 h-8 rounded-full bg-black/[0.03] group-hover:bg-rose-50 text-slate-400 group-hover:text-rose-600 flex items-center justify-center transition-colors">
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>

      {/* Metrics Row: Inset Apple Segment */}
      <div className="grid grid-cols-3 gap-2 p-3.5 bg-black/[0.025] rounded-2xl border border-black/[0.04] text-center">
        <div>
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider sf-caption">
            Items
          </div>
          <div className="text-sm sm:text-base font-bold text-[#1D1D1F] sf-display mt-0.5 flex items-center justify-center gap-1">
            <FileText className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
            <span>{group.totalRecords}</span>
          </div>
        </div>
        <div className="border-x border-black/[0.05]">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider sf-caption">
            Quantity
          </div>
          <div className="text-sm sm:text-base font-bold text-[#1D1D1F] sf-display mt-0.5 flex items-center justify-center gap-1">
            <Package className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
            <span>{group.totalQuantity} <span className="text-xs font-normal text-slate-400">pcs</span></span>
          </div>
        </div>
        <div>
          <div className="text-[10px] font-semibold text-rose-500 uppercase tracking-wider sf-caption">
            Total Loss
          </div>
          <div className="text-sm sm:text-base font-bold text-rose-600 sf-display mt-0.5">
            {formatCurrencyPHP(group.totalCost)}
          </div>
        </div>
      </div>

      {/* Departments and Image Stack Preview */}
      <div className="flex items-center justify-between gap-2 pt-0.5">
        {/* Department Pills */}
        <div className="flex flex-wrap items-center gap-1.5 min-w-0">
          {group.departments.map((dept) => (
            <span
              key={dept}
              className="text-[11px] font-medium sf-caption px-2.5 py-0.5 rounded-full bg-black/[0.04] text-slate-600 border border-black/[0.05] truncate max-w-[140px]"
            >
              {dept}
            </span>
          ))}
        </div>

        {/* Squircle Thumbnail Stack */}
        {previewImages.length > 0 && (
          <div className="flex items-center -space-x-2 shrink-0">
            {previewImages.map((src, idx) => (
              <img
                key={idx}
                src={src}
                alt="Item thumbnail"
                className="w-7 h-7 rounded-xl object-cover ring-2 ring-white border border-black/[0.06] shadow-xs"
                loading="lazy"
              />
            ))}
          </div>
        )}
      </div>

      {/* Card Footer Hint & Action */}
      <div className="pt-2.5 border-t border-black/[0.04] flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100/90 active:bg-rose-200 border border-rose-200/90 shadow-2xs transition-all cursor-pointer apple-pressable sf-subheadline disabled:opacity-60"
            title={`Download official PDF report with item photos for DLR #${group.dlrNumber}`}
          >
            {isGeneratingPdf ? (
              <Loader2 className="w-3.5 h-3.5 text-rose-600 animate-spin" />
            ) : (
              <FileText className="w-3.5 h-3.5 text-rose-600" />
            )}
            <span>{isGeneratingPdf ? 'Building PDF...' : 'PDF Report'}</span>
          </button>
          <button
            type="button"
            onClick={handleDownloadExcel}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100/90 active:bg-emerald-200 border border-emerald-200/90 shadow-2xs transition-all cursor-pointer apple-pressable sf-subheadline"
            title={`Download Excel spreadsheet for DLR #${group.dlrNumber}`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Excel</span>
          </button>
        </div>
        <span className="text-[11px] text-slate-400 font-normal sf-caption">
          {group.records.length} records in batch
        </span>
      </div>
    </div>
  );
};

