import React, { useState, useMemo } from 'react';
import { Search, FolderCheck, FileSpreadsheet } from 'lucide-react';
import { FiledDLRGroup, DLRRecord } from '../types/dlr';
import { formatCurrencyPHP } from '../utils/currency';
import { exportDLRToExcel } from '../utils/exportExcel';
import { FiledDLRCard } from './FiledDLRCard';
import { FiledDLRDetailModal } from './FiledDLRDetailModal';
import { EditDLRModal } from './EditDLRModal';

interface FiledDLRViewProps {
  records: DLRRecord[];
  storeCode: string;
  mode?: 'filed' | 'approved';
  onOpenImageModal: (
    url: string,
    type: string,
    item?: { sku: string; description: string; reason: string; upc?: string }
  ) => void;
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onUnfileRecord?: (recordId: string) => Promise<void>;
  onUpdateDLRNumber?: (recordIds: string[], newDlrNumber: string) => Promise<void>;
  onToggleApproved?: (recordIds: string[], currentStatus: string | null) => Promise<void>;
}

export const FiledDLRView: React.FC<FiledDLRViewProps> = ({
  records,
  storeCode,
  mode = 'filed',
  onOpenImageModal,
  onToast,
  onUnfileRecord,
  onUpdateDLRNumber,
  onToggleApproved,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<FiledDLRGroup | null>(null);
  const [groupToEdit, setGroupToEdit] = useState<FiledDLRGroup | null>(null);

  const isApprovedMode = mode === 'approved';

  // Group filed records by dlrNumber
  const groups = useMemo<FiledDLRGroup[]>(() => {
    const groupMap = new Map<string, DLRRecord[]>();

    records.forEach((record) => {
      const dlr = record.dlrNumber;
      if (!dlr) return;
      const existing = groupMap.get(dlr) || [];
      existing.push(record);
      groupMap.set(dlr, existing);
    });

    const list: FiledDLRGroup[] = [];
    groupMap.forEach((groupRecords, dlrNumber) => {
      const totalQty = groupRecords.reduce((acc, r) => acc + (r.qty || 0), 0);
      const totalCost = groupRecords.reduce((acc, r) => acc + (r.cost || 0) * (r.qty || 0), 0);
      const depts = Array.from(new Set(groupRecords.map((r) => r.departmentName).filter(Boolean)));
      const latestDate = groupRecords[0]?.createdAt;
      const status = groupRecords[0]?.status ?? null;

      list.push({
        dlrNumber,
        records: groupRecords,
        totalRecords: groupRecords.length,
        totalQuantity: totalQty,
        totalCost,
        departments: depts,
        status,
        lastUpdated: latestDate,
      });
    });

    // Sort by most recently updated or alphabet
    return list.sort((a, b) => {
      if (a.lastUpdated && b.lastUpdated) {
        return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
      }
      return String(a.dlrNumber || '').localeCompare(String(b.dlrNumber || ''));
    });
  }, [records]);

  // Filter groups by search query
  const filteredGroups = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return groups;

    return groups.filter((g) => {
      const matchDlr = String(g.dlrNumber || '').toLowerCase().includes(q);
      const matchDept = g.departments.some((d) => String(d || '').toLowerCase().includes(q));
      const matchItems = g.records.some(
        (r) =>
          String(r.sku || '').toLowerCase().includes(q) ||
          String(r.description || '').toLowerCase().includes(q) ||
          String(r.upc || '').toLowerCase().includes(q)
      );
      return matchDlr || matchDept || matchItems;
    });
  }, [groups, searchQuery]);

  // Overall Stats
  const overallStats = useMemo(() => {
    const totalFiles = groups.length;
    const totalItems = groups.reduce((acc, g) => acc + g.totalRecords, 0);
    const totalQty = groups.reduce((acc, g) => acc + g.totalQuantity, 0);
    const totalLoss = groups.reduce((acc, g) => acc + g.totalCost, 0);
    return { totalFiles, totalItems, totalQty, totalLoss };
  }, [groups]);

  const handleToggleApproved = async (recordIds: string[], currentStatus: string | null) => {
    if (!onToggleApproved) return;
    await onToggleApproved(recordIds, currentStatus);

    setSelectedGroup((prev) => {
      if (!prev) return null;
      const newStatus = currentStatus === 'approved' ? null : 'approved';
      return {
        ...prev,
        status: newStatus,
        records: prev.records.map((r) =>
          recordIds.includes(r.id) ? { ...r, status: newStatus } : r
        ),
      };
    });
  };

  const handleUpdateDlr = async (recordIds: string[], newDlrNumber: string) => {
    if (!onUpdateDLRNumber) return;
    await onUpdateDLRNumber(recordIds, newDlrNumber);

    // Update selectedGroup if modal is open
    setSelectedGroup((prev) => {
      if (!prev) return null;

      const allUpdated = prev.records.every((r) => recordIds.includes(r.id));
      if (allUpdated) {
        return {
          ...prev,
          dlrNumber: newDlrNumber,
          records: prev.records.map((r) => ({ ...r, dlrNumber: newDlrNumber })),
        };
      }

      // If item-level update:
      const remaining = prev.records
        .filter((r) => !recordIds.includes(r.id) || newDlrNumber === prev.dlrNumber)
        .map((r) => (recordIds.includes(r.id) ? { ...r, dlrNumber: newDlrNumber } : r));

      if (remaining.length === 0) return null;

      const totalQty = remaining.reduce((acc, r) => acc + (r.qty || 0), 0);
      const totalCost = remaining.reduce((acc, r) => acc + (r.cost || 0) * (r.qty || 0), 0);
      return {
        ...prev,
        records: remaining,
        totalRecords: remaining.length,
        totalQuantity: totalQty,
        totalCost,
      };
    });
  };

  const handleExportAllBatches = () => {
    try {
      const recordsToExport = filteredGroups.flatMap((g) => g.records);
      const modeLabel = isApprovedMode ? 'approved' : 'filed';
      if (recordsToExport.length === 0) {
        onToast(`No ${modeLabel} records to export`, 'info');
        return;
      }
      const today = new Date().toISOString().split('T')[0];
      const uniqueDlrs = Array.from(
        new Set(filteredGroups.map((g) => g.dlrNumber).filter(Boolean))
      ).join(', ');
      const prefix = isApprovedMode ? 'Approved' : 'Filed';
      exportDLRToExcel(recordsToExport, `All_${prefix}`, storeCode, {
        isApproved: isApprovedMode,
        isFiled: !isApprovedMode,
        includeImages: false,
        dlrNumber: uniqueDlrs || `All ${prefix}`,
        filenameOverride: `DLR_All_${prefix}_${today}.xlsx`,
      });
      onToast(`Exported ${recordsToExport.length} ${modeLabel} records to Excel!`, 'success');
    } catch (err) {
      console.error(`Failed to export all ${isApprovedMode ? 'approved' : 'filed'} records:`, err);
      onToast('Failed to export Excel file', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="apple-card p-4 sm:p-5">
          <div className="text-[11px] font-semibold text-slate-400 sf-caption">
            {isApprovedMode ? 'Approved DLR Cards' : 'Filed DLR Cards'}
          </div>
          <div className={`text-xl sm:text-2xl font-bold sf-display mt-1 ${isApprovedMode ? 'text-emerald-700' : 'text-[#1D1D1F]'}`}>
            {overallStats.totalFiles}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5 sf-subheadline">
            {isApprovedMode ? 'Cards verified' : 'Cards awaiting approval'}
          </div>
        </div>

        <div className="apple-card p-4 sm:p-5">
          <div className="text-[11px] font-semibold text-slate-400 sf-caption">
            {isApprovedMode ? 'Total Approved Items' : 'Total Filed Items'}
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#1D1D1F] sf-display mt-1">
            {overallStats.totalItems}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5 sf-subheadline">Across all departments</div>
        </div>

        <div className="apple-card p-4 sm:p-5">
          <div className="text-[11px] font-semibold text-slate-400 sf-caption">
            {isApprovedMode ? 'Total Approved Units' : 'Total Filed Units'}
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#1D1D1F] sf-display mt-1">
            {overallStats.totalQty} <span className="text-sm font-normal text-slate-400">pcs</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5 sf-subheadline">Total physical units</div>
        </div>

        <div className="apple-card p-4 sm:p-5">
          <div className={`text-[11px] font-semibold sf-caption ${isApprovedMode ? 'text-emerald-700' : 'text-rose-600/90'}`}>
            {isApprovedMode ? 'Total Approved Loss' : 'Total Filed Loss'}
          </div>
          <div className={`text-xl sm:text-2xl font-bold sf-display mt-1 ${isApprovedMode ? 'text-emerald-600' : 'text-rose-600'}`}>
            {formatCurrencyPHP(overallStats.totalLoss)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5 sf-subheadline">Audited cost sum</div>
        </div>
      </div>

      {/* Controls Bar: Search & Actions */}
      <div className="apple-card p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${isApprovedMode ? 'approved' : 'filed'} batches by DLR, SKU, description...`}
            className="w-full pl-9.5 pr-4 py-2 text-xs sm:text-sm bg-black/[0.03] focus:bg-white border border-black/[0.06] focus:border-black/[0.2] rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all text-[#1D1D1F] placeholder:text-slate-400 sf-subheadline"
          />
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-3 px-1 flex-wrap">
          <div className="text-xs text-slate-500 font-semibold sf-caption shrink-0">
            Showing {filteredGroups.length} of {groups.length} card(s)
          </div>
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-xs text-slate-500 hover:text-[#1D1D1F] px-2.5 py-1 rounded-lg hover:bg-black/[0.05] transition-colors cursor-pointer apple-pressable sf-subheadline shrink-0"
            >
              Clear
            </button>
          )}
          {filteredGroups.length > 0 && (
            <button
              type="button"
              onClick={handleExportAllBatches}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer apple-pressable sf-subheadline shadow-2xs shrink-0 ${
                isApprovedMode
                  ? 'text-emerald-800 bg-emerald-50 hover:bg-emerald-100/90 border border-emerald-200/80'
                  : 'text-rose-800 bg-rose-50 hover:bg-rose-100/90 border border-rose-200/80'
              }`}
              title={`Export all visible ${isApprovedMode ? 'approved' : 'filed'} cards to a single Excel file (without image links)`}
            >
              <FileSpreadsheet className={`w-3.5 h-3.5 ${isApprovedMode ? 'text-emerald-600' : 'text-rose-600'}`} />
              <span>Export All ({filteredGroups.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Cards Grid or Empty State */}
      {filteredGroups.length === 0 ? (
        <div className="apple-card rounded-3xl p-10 sm:p-14 text-center space-y-3.5 border border-black/[0.06]">
          <div className="flex items-center justify-center w-14 h-14 mx-auto rounded-2xl bg-black/[0.03] text-slate-400 border border-black/[0.05]">
            <FolderCheck className="w-7 h-7" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-[#1D1D1F] sf-headline">
            {isApprovedMode
              ? groups.length === 0
                ? 'No Approved DLR Cards Yet'
                : 'No Matching Approved Cards'
              : groups.length === 0
              ? 'No Filed DLR Cards'
              : 'No Matching Filed Cards'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto sf-subheadline leading-relaxed">
            {isApprovedMode
              ? groups.length === 0
                ? 'You have not approved any filed batches yet. Open the Filed DLRs tab and toggle the approval switch on any card.'
                : 'No approved DLR cards match your search criteria. Try a different keyword.'
              : groups.length === 0
              ? 'There are currently no filed DLR cards awaiting approval. Assign a DLR number to items in Active Audit to file them here.'
              : 'No filed DLR cards match your search criteria. Try a different keyword.'}
          </p>
          {searchQuery && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 rounded-full text-xs font-semibold text-slate-700 bg-black/[0.05] hover:bg-black/[0.08] transition-colors cursor-pointer apple-pressable sf-subheadline"
              >
                Clear Search
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGroups.map((group) => (
            <FiledDLRCard
              key={group.dlrNumber}
              group={group}
              onClick={(g) => setSelectedGroup(g)}
              onEditDlr={(g) => setGroupToEdit(g)}
              onToggleApproved={onToggleApproved ? handleToggleApproved : undefined}
              onToast={onToast}
              storeCode={storeCode}
            />
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <FiledDLRDetailModal
        isOpen={Boolean(selectedGroup)}
        group={selectedGroup}
        storeCode={storeCode}
        onClose={() => setSelectedGroup(null)}
        onOpenImageModal={onOpenImageModal}
        onToast={onToast}
        onUpdateDLRNumber={onUpdateDLRNumber ? handleUpdateDlr : undefined}
        onUnfileRecord={async (recordId) => {
          if (onUnfileRecord) {
            await onUnfileRecord(recordId);
            // Update modal group locally
            setSelectedGroup((prev) => {
              if (!prev) return null;
              const remaining = prev.records.filter((r) => r.id !== recordId);
              if (remaining.length === 0) return null;
              const totalQty = remaining.reduce((acc, r) => acc + (r.qty || 0), 0);
              const totalCost = remaining.reduce((acc, r) => acc + (r.cost || 0) * (r.qty || 0), 0);
              return {
                ...prev,
                records: remaining,
                totalRecords: remaining.length,
                totalQuantity: totalQty,
                totalCost,
              };
            });
          }
        }}
      />

      {/* Edit DLR Modal from Card */}
      {groupToEdit && (
        <EditDLRModal
          isOpen={Boolean(groupToEdit)}
          currentDlrNumber={groupToEdit.dlrNumber}
          targetRecords={groupToEdit.records}
          onClose={() => setGroupToEdit(null)}
          onSave={async (recordIds, newDlrNumber) => {
            await handleUpdateDlr(recordIds, newDlrNumber);
            onToast(`Updated batch to DLR #${newDlrNumber}!`, 'success');
          }}
        />
      )}
    </div>
  );
};
