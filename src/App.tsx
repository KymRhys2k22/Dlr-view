import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { UserSession, DLRRecord, SummaryStats } from './types/dlr';
import { DepartmentName } from './utils/getDepartmentName';
import { fetchDLRRecordsFromSupabase, deleteDLRRecordFromSupabase } from './services/dlrService';
import { LoginForm } from './components/LoginForm';
import { Navbar } from './components/Navbar';
import { Greeting } from './components/Greeting';
import { SummaryCards } from './components/SummaryCards';
import { DepartmentTabs } from './components/DepartmentTabs';
import { SearchBar } from './components/SearchBar';
import { ExportExcelButton } from './components/ExportExcelButton';
import { DLRTable } from './components/DLRTable';
import { DLRCard } from './components/DLRCard';
import { SkeletonLoader } from './components/SkeletonLoader';
import { EmptyState } from './components/EmptyState';
import { ErrorState } from './components/ErrorState';
import { ImageModal } from './components/ImageModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { LayoutGrid, Table as TableIcon } from 'lucide-react';

const SESSION_STORAGE_KEY = 'daiso_dlr_session_v1';

export const App: React.FC = () => {
  // Session state
  const [session, setSession] = useState<UserSession | null>(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_STORAGE_KEY) || localStorage.getItem(SESSION_STORAGE_KEY);
      return saved ? (JSON.parse(saved) as UserSession) : null;
    } catch {
      return null;
    }
  });

  // Data fetching state
  const [records, setRecords] = useState<DLRRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Delete state
  const [recordToDelete, setRecordToDelete] = useState<DLRRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Filters state
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentName>('All Departments');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // UI preferences
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Modal Lightbox state
  const [modalImage, setModalImage] = useState<{
    url: string | null;
    type: string;
    item?: { sku: string; description: string; reason: string };
  }>({
    url: null,
    type: '',
  });

  // Toast state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const newToast: ToastMessage = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      type,
      message,
    };
    setToasts((prev) => [...prev.slice(-4), newToast]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Fetch DLR records for active store
  const loadRecords = useCallback(async (storeCode: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await fetchDLRRecordsFromSupabase(storeCode);
      setRecords(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch records from database';
      setErrorMessage(msg);
      addToast('Error loading Damage & Lost Reports.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  // Load records whenever session changes
  useEffect(() => {
    if (session?.storeCode) {
      loadRecords(session.storeCode);
    }
  }, [session, loadRecords]);

  // Login handler
  const handleLogin = (userSession: UserSession) => {
    try {
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(userSession));
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(userSession));
    } catch (err) {
      console.error('Failed to save session:', err);
    }
    setSession(userSession);
    setSelectedDepartment('All Departments');
    setSearchQuery('');
    addToast(`Welcome back, ${userSession.name}!`, 'info');
  };

  // Logout handler
  const handleLogout = () => {
    try {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch (err) {
      console.error('Failed to clear session:', err);
    }
    setSession(null);
    setRecords([]);
    setSelectedDepartment('All Departments');
    setSearchQuery('');
    addToast('Logged out successfully.', 'info');
  };

  // Confirm delete handler
  const handleConfirmDelete = async () => {
    if (!recordToDelete) return;
    setIsDeleting(true);
    try {
      await deleteDLRRecordFromSupabase(recordToDelete.id);
      setRecords((prev) => prev.filter((r) => r.id !== recordToDelete.id));
      addToast(
        `Record for SKU ${recordToDelete.sku || 'item'} deleted successfully!`,
        'success'
      );
      setRecordToDelete(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete record';
      addToast(msg, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Department item counts
  const departmentCounts = useMemo<Record<DepartmentName, number>>(() => {
    const counts: Record<DepartmentName, number> = {
      'All Departments': records.length,
      Houseware: 0,
      Fashion: 0,
      'Food & DIY': 0,
      Cleaning: 0,
      'Outdoor & GMS': 0,
      Unknown: 0,
    };

    records.forEach((record) => {
      const dept = record.departmentName as DepartmentName;
      if (counts[dept] !== undefined && dept !== 'All Departments') {
        counts[dept] += 1;
      } else {
        counts.Unknown += 1;
      }
    });

    return counts;
  }, [records]);

  // Combined Filtered Records (Department + Search)
  const filteredRecords = useMemo<DLRRecord[]>(() => {
    const query = searchQuery.trim().toLowerCase();

    return records.filter((record) => {
      // 1. Department Filter
      if (selectedDepartment !== 'All Departments') {
        if (record.departmentName !== selectedDepartment) {
          return false;
        }
      }

      // 2. Search Filter (SKU, Description, UPC, Reason, SecondReason, SubDep)
      if (query) {
        const skuMatch = record.sku.toLowerCase().includes(query);
        const descMatch = record.description.toLowerCase().includes(query);
        const upcMatch = record.upc.toLowerCase().includes(query);
        const reasonMatch = record.reason.toLowerCase().includes(query);
        const secondReasonMatch = (record.secondReason || '').toLowerCase().includes(query);
        const subDepMatch = (record.subDep || '').toLowerCase().includes(query);

        if (!skuMatch && !descMatch && !upcMatch && !reasonMatch && !secondReasonMatch && !subDepMatch) {
          return false;
        }
      }

      return true;
    });
  }, [records, selectedDepartment, searchQuery]);

  // Recalculated Summary Stats
  const summaryStats = useMemo<SummaryStats>(() => {
    let totalQty = 0;
    let totalCost = 0;

    filteredRecords.forEach((record) => {
      const qty = record.qty || 0;
      const cost = record.cost || 0;
      totalQty += qty;
      totalCost += cost * qty;
    });

    return {
      totalRecords: filteredRecords.length,
      totalQuantity: totalQty,
      totalCost: totalCost,
    };
  }, [filteredRecords]);

  // Reset filters helper
  const handleResetFilters = () => {
    setSelectedDepartment('All Departments');
    setSearchQuery('');
  };

  // Open Image Modal
  const handleOpenImageModal = (url: string, type: string, item?: { sku: string; description: string; reason: string }) => {
    setModalImage({ url, type, item });
  };

  const handleCloseImageModal = () => {
    setModalImage({ url: null, type: '' });
  };

  // If not logged in, show Login Screen
  if (!session) {
    return (
      <>
        <LoginForm onLogin={handleLogin} />
        <PWAInstallPrompt />
        <ToastContainer toasts={toasts} onDismiss={removeToast} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans antialiased">
      {/* Top Navbar */}
      <Navbar
        session={session}
        onLogout={handleLogout}
        onRefresh={() => loadRecords(session.storeCode)}
        isLoading={isLoading}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Personalized Greeting */}
        <Greeting session={session} />

        {/* Loading State */}
        {isLoading && <SkeletonLoader />}

        {/* Error State */}
        {!isLoading && errorMessage && (
          <ErrorState
            message={errorMessage}
            onRetry={() => loadRecords(session.storeCode)}
            isRetrying={isLoading}
          />
        )}

        {/* Data Content */}
        {!isLoading && !errorMessage && (
          <div className="space-y-6">
            {/* Dynamic Summary Cards */}
            <SummaryCards stats={summaryStats} selectedDepartment={selectedDepartment} />

            {/* Department Filter Tabs */}
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Filter by Department
              </div>
              <DepartmentTabs
                activeTab={selectedDepartment}
                onTabChange={setSelectedDepartment}
                counts={departmentCounts}
              />
            </div>

            {/* Controls Bar: Search, View Mode Toggle, Excel Export */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
              {/* Search Bar */}
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                totalMatches={filteredRecords.length}
              />

              <div className="flex items-center gap-2 shrink-0">
                {/* View Mode Toggle (Desktop only) */}
                <div className="hidden lg:flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setViewMode('table')}
                    className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                      viewMode === 'table'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                    title="Table View"
                  >
                    <TableIcon className="w-4 h-4" />
                    <span>Table</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('cards')}
                    className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                      viewMode === 'cards'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                    title="Card Grid View"
                  >
                    <LayoutGrid className="w-4 h-4" />
                    <span>Cards</span>
                  </button>
                </div>

                {/* Export Excel Button */}
                <ExportExcelButton
                  records={filteredRecords}
                  selectedDepartment={selectedDepartment}
                  storeCode={session.storeCode}
                  onToast={addToast}
                />
              </div>
            </div>

            {/* Records List / Table or Empty State */}
            {filteredRecords.length === 0 ? (
              <EmptyState
                isSearchActive={Boolean(searchQuery.trim())}
                selectedDepartment={selectedDepartment}
                onReset={handleResetFilters}
              />
            ) : (
              <>
                {/* Desktop Table View */}
                {viewMode === 'table' ? (
                  <div className="hidden lg:block">
                    <DLRTable
                      records={filteredRecords}
                      onOpenModal={handleOpenImageModal}
                      onToast={addToast}
                      onDeleteRecord={(rec) => setRecordToDelete(rec)}
                    />
                  </div>
                ) : null}

                {/* Card View (Always on Mobile/Tablet, or when selected on Desktop) */}
                <div
                  className={`${
                    viewMode === 'table' ? 'lg:hidden' : 'block'
                  } grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`}
                >
                  {filteredRecords.map((record) => (
                    <DLRCard
                      key={record.id}
                      record={record}
                      onOpenModal={handleOpenImageModal}
                      onToast={addToast}
                      onDeleteRecord={(rec) => setRecordToDelete(rec)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Daiso Damage & Lost Report (DLR) Portal · Store #{session.storeCode} ({session.storeName})
          </span>
          <span className="text-slate-400">
            Internal Store Operations & Loss Prevention
          </span>
        </div>
      </footer>

      {/* Image Modal Lightbox */}
      <ImageModal
        isOpen={Boolean(modalImage.url)}
        imageUrl={modalImage.url}
        imageType={modalImage.type}
        itemInfo={modalImage.item}
        onClose={handleCloseImageModal}
        onToast={addToast}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(recordToDelete)}
        record={recordToDelete}
        onClose={() => !isDeleting && setRecordToDelete(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />

      {/* PWA Install and Offline Prompt */}
      <PWAInstallPrompt />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
};

export default App;
