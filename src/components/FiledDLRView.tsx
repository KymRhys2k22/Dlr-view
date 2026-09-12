import React, { useState, useMemo } from 'react';
import { Search, FolderCheck } from 'lucide-react';
import { FiledDLRGroup, DLRRecord } from '../types/dlr';
import { formatCurrencyPHP } from '../utils/currency';
import { FiledDLRCard } from './FiledDLRCard';
import { FiledDLRDetailModal } from './FiledDLRDetailModal';
import { EditDLRModal } from './EditDLRModal';

interface FiledDLRViewProps {
  records: DLRRecord[];
  storeCode: string;
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
  onOpenImageModal,
  onToast,
  onUnfileRecord,
  onUpdateDLRNumber,
  onToggleApproved,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<FiledDLRGroup | null>(null);
  const [groupToEdit, setGroupToEdit] = useState<FiledDLRGroup | null>(null);

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

  // Overall Filed Stats
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

  return (
    <div className="space-y-6">
      {/* Header Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Filed DLR Batches
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            {overallStats.totalFiles}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Assigned report batches</div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Filed Items
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            {overallStats.totalItems}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Across all departments</div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Filed Units
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            {overallStats.totalQty} pcs
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Total physical units</div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Filed Loss
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-600 font-mono mt-1">
            {formatCurrencyPHP(overallStats.totalLoss)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Audited cost sum</div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by DLR Number, SKU, description, or department..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all text-slate-800 placeholder:text-slate-400"
          />
        </div>
        <div className="text-xs text-slate-500 font-medium px-2 shrink-0">
          Showing {filteredGroups.length} of {groups.length} batch(es)
        </div>
      </div>

      {/* Cards Grid or Empty State */}
      {filteredGroups.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-8 sm:p-12 text-center space-y-3">
          <div className="flex items-center justify-center w-14 h-14 mx-auto rounded-3xl bg-slate-100 text-slate-400">
            <FolderCheck className="w-7 h-7" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-800">
            {groups.length === 0 ? 'No Filed DLRs Yet' : 'No Matching Filed DLRs'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            {groups.length === 0
              ? 'Filter by department in Active Audit, select items, and click "Assign DLR Number" to file them into this archive.'
              : 'No filed DLR records match your search criteria. Try a different keyword.'}
          </p>
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors cursor-pointer"
            >
              Clear Search
            </button>
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
