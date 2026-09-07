import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { UserSession, DLRRecord, SummaryStats } from './types/dlr';
import { DepartmentName } from './utils/getDepartmentName';
import {
  fetchDLRRecordsFromSupabase,
  deleteDLRRecordFromSupabase,
  subscribeToDLRChanges,
  updateDLRNumberInSupabase,
  unfileDLRRecordInSupabase,
} from './services/dlrService';
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
import { RealtimeEventItem } from './components/NotificationCenter';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { BatchActionBar } from './components/BatchActionBar';
import { AssignDLRModal } from './components/AssignDLRModal';
import { FiledDLRView } from './components/FiledDLRView';
import { playNotificationSound } from './utils/audio';
import { sendBrowserNotification, updateAppBadge } from './utils/webNotification';
import { LayoutGrid, Table as TableIcon, ClipboardList, Archive } from 'lucide-react';

const SESSION_STORAGE_KEY = 'daiso_dlr_session_v1';

export const App: React.FC = () => {
  // Session state
  const [session, setSession] = useState<UserSession | null>(() => {
    try {
      const saved =
        sessionStorage.getItem(SESSION_STORAGE_KEY) ||
        localStorage.getItem(SESSION_STORAGE_KEY);
      return saved ? (JSON.parse(saved) as UserSession) : null;
    } catch {
      return null;
    }
  });

  // Top View Navigation: 'active' (Unfiled) vs 'filed' (Archived with DLR number)
  const [pageView, setPageView] = useState<'active' | 'filed'>('active');

  // Data fetching state
  const [records, setRecords] = useState<DLRRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isInitialLoaded, setIsInitialLoaded] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Real-time notification & highlight badge state
  const [realtimeNotifications, setRealtimeNotifications] = useState<RealtimeEventItem[]>([]);
  const [newlyAddedIds, setNewlyAddedIds] = useState<Set<string>>(new Set());
  const [liveNewDepts, setLiveNewDepts] = useState<Set<DepartmentName>>(new Set());
  const [isRealtimeConnected, setIsRealtimeConnected] = useState<boolean>(true);

  // Delete state
  const [recordToDelete, setRecordToDelete] = useState<DLRRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Filters state: Single-select department chip
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentName>('All Departments');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Batch Selection & Assign DLR Modal state
  const [selectedRecordIds, setSelectedRecordIds] = useState<Set<string>>(new Set());
  const [isAssignModalOpen, setIsAssignModalOpen] = useState<boolean>(false);

  // UI preferences
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Modal Lightbox state
  const [modalImage, setModalImage] = useState<{
    url: string | null;
    type: string;
    item?: { sku: string; description: string; reason: string; upc?: string };
  }>({
    url: null,
    type: '',
  });

  // Toast state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback(
    (message: string, type: 'success' | 'error' | 'info' | 'realtime' = 'success') => {
      const newToast: ToastMessage = {
        id: `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        type,
        message,
      };
      setToasts((prev) => [...prev.slice(-4), newToast]);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Update App Icon Badge and Browser Document Title when unread notifications change
  useEffect(() => {
    const unreadCount = realtimeNotifications.filter((n) => !n.read).length;
    const baseTitle = 'Damage & Lost Report · Daiso';
    if (unreadCount > 0) {
      document.title = `(${unreadCount}) ${baseTitle}`;
    } else {
      document.title = baseTitle;
    }
    updateAppBadge(unreadCount);
  }, [realtimeNotifications]);

  // Fetch DLR records for active store
  const loadRecords = useCallback(
    async (storeCode: string) => {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const data = await fetchDLRRecordsFromSupabase(storeCode);
        setRecords(data);
        setIsInitialLoaded(true);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to fetch records from database';
        setErrorMessage(msg);
        addToast('Error loading Damage & Lost Reports.', 'error');
      } finally {
        setIsLoading(false);
      }
    },
    [addToast]
  );

  // Load records whenever session changes
  useEffect(() => {
    if (session?.storeCode) {
      setIsInitialLoaded(false);
      loadRecords(session.storeCode);
    }
  }, [session, loadRecords]);

  // Subscribe to Supabase Real-time Changes & Smart Sync Engine
  useEffect(() => {
    if (!session?.storeCode || !isInitialLoaded) return;

    const unsubscribe = subscribeToDLRChanges({
      storeCode: session.storeCode,
      initialRecords: records,
      onInsert: (newRecord) => {
        // 1. Play audio chime
        playNotificationSound();

        // 2. Prepend to records list (avoid duplicate IDs)
        setRecords((prev) => {
          const exists = prev.some((r) => r.id === newRecord.id);
          if (exists) return prev;
          return [newRecord, ...prev];
        });

        // 3. Mark for visual highlight & department badge indicator for 7 seconds
        setNewlyAddedIds((prev) => {
          const next = new Set(prev);
          next.add(newRecord.id);
          return next;
        });

        const deptName = newRecord.departmentName as DepartmentName;
        setLiveNewDepts((prev) => {
          const next = new Set(prev);
          next.add(deptName);
          return next;
        });

        setTimeout(() => {
          setNewlyAddedIds((prev) => {
            const next = new Set(prev);
            next.delete(newRecord.id);
            return next;
          });
          setLiveNewDepts((prev) => {
            const next = new Set(prev);
            next.delete(deptName);
            return next;
          });
        }, 7000);

        // 4. Record into Real-time activity history drawer
        const eventItem: RealtimeEventItem = {
          id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          timestamp: new Date(),
          record: newRecord,
          read: false,
        };
        setRealtimeNotifications((prev) => [eventItem, ...prev.slice(0, 49)]);

        // 5. Trigger on-screen Toast Notification
        const toastMsg: ToastMessage = {
          id: `rt_${newRecord.id}_${Date.now()}`,
          type: 'realtime',
          title: '✨ New DLR Record Created',
          message: `${newRecord.sku || 'Item'} · ${newRecord.description || 'Damage Report'}`,
          meta: {
            sku: newRecord.sku,
            description: newRecord.description,
            reason: newRecord.reason,
            qty: newRecord.qty,
            department: newRecord.departmentName,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        };
        setToasts((prev) => [...prev.slice(-4), toastMsg]);

        // 6. Send Desktop Browser Push Notification
        sendBrowserNotification('✨ New DLR Record Inserted', {
          body: `SKU: ${newRecord.sku || 'N/A'} - ${newRecord.description || 'Defect Item'}\nQty: ${newRecord.qty} | Reason: ${newRecord.reason}`,
        });
      },
      onDelete: (deletedId) => {
        setRecords((prev) => prev.filter((r) => r.id !== deletedId));
      },
      onStatusChange: (status) => {
        setIsRealtimeConnected(status === 'SUBSCRIBED');
      },
    });

    return () => {
      unsubscribe();
    };
  }, [session?.storeCode, isInitialLoaded]);

  // Demo / Test Real-time Notification trigger
  const handleTestNotification = useCallback(() => {
    if (!session) return;

    const mockRecord: DLRRecord = {
      id: `test_${Date.now()}`,
      sku: '4549131988999',
      description: 'Daiso Stackable Clear Organizer Box 3.2L',
      upc: '4549131988999',
      cost: 88,
      costRaw: '88',
      price: 120,
      priceRaw: '120',
      reason: 'Cracked Corner / Defective Latch',
      secondReason: 'Damaged in transit',
      qty: 2,
      storeCode: session.storeCode,
      images: [],
      departmentCode: '10',
      departmentName: 'Houseware',
      subDep: 'Storage & Organization',
      dlrNumber: null,
      createdAt: new Date().toISOString(),
    };

    // 1. Play sound
    playNotificationSound();

    // 2. Prepend to records list
    setRecords((prev) => [mockRecord, ...prev]);

    // 3. Highlight
    setNewlyAddedIds((prev) => {
      const next = new Set(prev);
      next.add(mockRecord.id);
      return next;
    });

    setLiveNewDepts((prev) => {
      const next = new Set(prev);
      next.add('Houseware');
      return next;
    });

    setTimeout(() => {
      setNewlyAddedIds((prev) => {
        const next = new Set(prev);
        next.delete(mockRecord.id);
        return next;
      });
      setLiveNewDepts((prev) => {
        const next = new Set(prev);
        next.delete('Houseware');
        return next;
      });
    }, 7000);

    // 4. Add to Activity history
    const eventItem: RealtimeEventItem = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date(),
      record: mockRecord,
      read: false,
    };
    setRealtimeNotifications((prev) => [eventItem, ...prev.slice(0, 49)]);

    // 5. Toast
    const toastMsg: ToastMessage = {
      id: `test_rt_${Date.now()}`,
      type: 'realtime',
      title: '✨ Live Insert Alert (Test)',
      message: `${mockRecord.sku} · ${mockRecord.description}`,
      meta: {
        sku: mockRecord.sku,
        description: mockRecord.description,
        reason: mockRecord.reason,
        qty: mockRecord.qty,
        department: mockRecord.departmentName,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    };
    setToasts((prev) => [...prev.slice(-4), toastMsg]);

    // 6. Desktop
    sendBrowserNotification('✨ New DLR Record Inserted (Test)', {
      body: `SKU: ${mockRecord.sku} - ${mockRecord.description}\nQty: ${mockRecord.qty} | Reason: ${mockRecord.reason}`,
    });
  }, [session]);

  const handleClearNotifications = () => {
    setRealtimeNotifications([]);
  };

  const handleMarkNotificationsAsRead = () => {
    setRealtimeNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

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
    setSelectedRecordIds(new Set());
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
    setIsInitialLoaded(false);
    setRealtimeNotifications([]);
    setSelectedDepartment('All Departments');
    setSelectedRecordIds(new Set());
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
      setSelectedRecordIds((prev) => {
        const next = new Set(prev);
        next.delete(recordToDelete.id);
        return next;
      });
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

  // Separate Active (Unfiled) and Filed Records
  const activeRecords = useMemo(() => {
    return records.filter((r) => !r.dlrNumber);
  }, [records]);

  const filedRecords = useMemo(() => {
    return records.filter((r) => Boolean(r.dlrNumber));
  }, [records]);

  // Check if department filtering is active (a specific department chip is chosen)
  const isDepartmentFilterActive = useMemo(() => {
    return selectedDepartment !== 'All Departments';
  }, [selectedDepartment]);

  // Department item counts for ACTIVE records
  const departmentCounts = useMemo<Record<DepartmentName, number>>(() => {
    const counts: Record<DepartmentName, number> = {
      'All Departments': activeRecords.length,
      Houseware: 0,
      Fashion: 0,
      'Food & DIY': 0,
      Cleaning: 0,
      'Outdoor & GMS': 0,
      Unknown: 0,
    };

    activeRecords.forEach((record) => {
      const dept = record.departmentName as DepartmentName;
      if (counts[dept] !== undefined && dept !== 'All Departments') {
        counts[dept] += 1;
      } else {
        counts.Unknown += 1;
      }
    });

    return counts;
  }, [activeRecords]);

  // Filtered Active Records (Single Department Filter + Search)
  const filteredActiveRecords = useMemo<DLRRecord[]>(() => {
    const query = searchQuery.trim().toLowerCase();

    return activeRecords.filter((record) => {
      // 1. Department Filter: if active, must match selected department
      if (isDepartmentFilterActive) {
        if (record.departmentName !== selectedDepartment) {
          return false;
        }
      }

      // 2. Search Filter (SKU, Description, UPC, Reason, SecondReason, SubDep)
      if (query) {
        const skuMatch = String(record.sku || '').toLowerCase().includes(query);
        const descMatch = String(record.description || '').toLowerCase().includes(query);
        const upcMatch = String(record.upc || '').toLowerCase().includes(query);
        const reasonMatch = String(record.reason || '').toLowerCase().includes(query);
        const secondReasonMatch = String(record.secondReason || '').toLowerCase().includes(query);
        const subDepMatch = String(record.subDep || '').toLowerCase().includes(query);

        if (
          !skuMatch &&
          !descMatch &&
          !upcMatch &&
          !reasonMatch &&
          !secondReasonMatch &&
          !subDepMatch
        ) {
          return false;
        }
      }

      return true;
    });
  }, [activeRecords, isDepartmentFilterActive, selectedDepartment, searchQuery]);

  // Recalculated Summary Stats for Active Records
  const summaryStats = useMemo<SummaryStats>(() => {
    let totalQty = 0;
    let totalCost = 0;

    filteredActiveRecords.forEach((record) => {
      const qty = record.qty || 0;
      const cost = record.cost || 0;
      totalQty += qty;
      totalCost += cost * qty;
    });

    return {
      totalRecords: filteredActiveRecords.length,
      totalQuantity: totalQty,
      totalCost: totalCost,
    };
  }, [filteredActiveRecords]);

  // Single Department selection handler
  const handleDepartmentChange = (tab: DepartmentName) => {
    setSelectedDepartment(tab);
    // Clear selection when changing departments to avoid accidental assignment
    setSelectedRecordIds(new Set());
  };

  // Selection handlers
  const handleToggleSelectRecord = (recordId: string) => {
    setSelectedRecordIds((prev) => {
      const next = new Set(prev);
      if (next.has(recordId)) {
        next.delete(recordId);
      } else {
        next.add(recordId);
      }
      return next;
    });
  };

  const handleToggleSelectAllFiltered = () => {
    const allFilteredIds = filteredActiveRecords.map((r) => r.id);
    const areAllSelected =
      allFilteredIds.length > 0 && allFilteredIds.every((id) => selectedRecordIds.has(id));

    if (areAllSelected) {
      setSelectedRecordIds(new Set());
    } else {
      setSelectedRecordIds(new Set(allFilteredIds));
    }
  };

  const handleClearSelection = () => {
    setSelectedRecordIds(new Set());
  };

  // Assign DLR Number submission
  const handleAssignDLRNumber = async (dlrNumber: string) => {
    const targetIds = Array.from(selectedRecordIds);
    if (!targetIds.length) return;

    await updateDLRNumberInSupabase(targetIds, dlrNumber);

    // Optimistically update records
    setRecords((prev) =>
      prev.map((r) => (targetIds.includes(r.id) ? { ...r, dlrNumber: dlrNumber.trim() } : r))
    );

    setSelectedRecordIds(new Set());
    addToast(`Successfully filed ${targetIds.length} item(s) under DLR #${dlrNumber}!`, 'success');
  };

  // Unfile a record (move back to Active Audit)
  const handleUnfileRecord = async (recordId: string) => {
    await unfileDLRRecordInSupabase([recordId]);
    setRecords((prev) =>
      prev.map((r) => (r.id === recordId ? { ...r, dlrNumber: null } : r))
    );
  };

  // Update DLR Number for filed items (batch or single)
  const handleUpdateDLRNumber = async (recordIds: string[], newDlrNumber: string) => {
    const cleanDlr = newDlrNumber.trim();
    if (!cleanDlr) throw new Error('DLR Number cannot be empty');
    if (!recordIds.length) return;

    await updateDLRNumberInSupabase(recordIds, cleanDlr);

    setRecords((prev) =>
      prev.map((r) =>
        recordIds.includes(r.id) ? { ...r, dlrNumber: cleanDlr } : r
      )
    );
  };

  // Selected records list for Assign Modal preview
  const selectedRecordsList = useMemo(() => {
    return filteredActiveRecords.filter((r) => selectedRecordIds.has(r.id));
  }, [filteredActiveRecords, selectedRecordIds]);

  // Reset filters helper
  const handleResetFilters = () => {
    setSelectedDepartment('All Departments');
    setSelectedRecordIds(new Set());
    setSearchQuery('');
  };

  // Open Image Modal
  const handleOpenImageModal = (
    url: string,
    type: string,
    item?: { sku: string; description: string; reason: string; upc?: string }
  ) => {
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
        realtimeNotifications={realtimeNotifications}
        onClearNotifications={handleClearNotifications}
        onMarkNotificationsAsRead={handleMarkNotificationsAsRead}
        onTestNotification={handleTestNotification}
        isRealtimeConnected={isRealtimeConnected}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Personalized Greeting */}
        <Greeting session={session} />

        {/* View Switcher: Active Audit vs Filed DLRs */}
        <div className="flex items-center gap-2 p-1.5 bg-white rounded-2xl border border-slate-200/80 shadow-xs mb-6 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => {
              setPageView('active');
              setSelectedRecordIds(new Set());
            }}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              pageView === 'active'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>Active Audit</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                pageView === 'active' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {activeRecords.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setPageView('filed');
              setSelectedRecordIds(new Set());
            }}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              pageView === 'filed'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Archive className="w-4 h-4" />
            <span>Filed DLRs</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                pageView === 'filed' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {filedRecords.length}
            </span>
          </button>
        </div>

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
          <>
            {pageView === 'active' ? (
              <div className="space-y-6">
                {/* Dynamic Summary Cards with Live Badge */}
                <SummaryCards
                  stats={summaryStats}
                  selectedDepartment={selectedDepartment}
                  liveNewCount={realtimeNotifications.length}
                />

                {/* Department Filter Tabs with Badge Indicators */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Filter by Department
                    </div>
                    {isDepartmentFilterActive && (
                      <span className="text-xs font-semibold text-rose-600">
                        {selectedDepartment} active · Checkboxes enabled
                      </span>
                    )}
                  </div>
                  <DepartmentTabs
                    activeTab={selectedDepartment}
                    onTabChange={handleDepartmentChange}
                    counts={departmentCounts}
                    liveNewDepts={liveNewDepts}
                  />
                </div>

                {/* Conditional Batch Action Bar (ONLY visible when filtered by specific department) */}
                {isDepartmentFilterActive && (
                  <BatchActionBar
                    isVisible={isDepartmentFilterActive}
                    totalFilteredCount={filteredActiveRecords.length}
                    selectedCount={selectedRecordIds.size}
                    isAllSelected={
                      filteredActiveRecords.length > 0 &&
                      filteredActiveRecords.every((r) => selectedRecordIds.has(r.id))
                    }
                    onToggleSelectAll={handleToggleSelectAllFiltered}
                    onClearSelection={handleClearSelection}
                    onOpenAssignModal={() => setIsAssignModalOpen(true)}
                  />
                )}

                {/* Controls Bar: Search, View Mode Toggle, Excel Export */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
                  {/* Search Bar */}
                  <SearchBar
                    value={searchQuery}
                    onChange={setSearchQuery}
                    totalMatches={filteredActiveRecords.length}
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
                      records={filteredActiveRecords}
                      selectedDepartment={selectedDepartment}
                      storeCode={session.storeCode}
                      onToast={addToast}
                    />
                  </div>
                </div>

                {/* Records List / Table or Empty State */}
                {filteredActiveRecords.length === 0 ? (
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
                          records={filteredActiveRecords}
                          onOpenModal={handleOpenImageModal}
                          onToast={addToast}
                          onDeleteRecord={(rec) => setRecordToDelete(rec)}
                          newlyAddedIds={newlyAddedIds}
                          isSelectable={isDepartmentFilterActive}
                          selectedRecordIds={selectedRecordIds}
                          onToggleSelectRecord={handleToggleSelectRecord}
                          onToggleSelectAll={handleToggleSelectAllFiltered}
                        />
                      </div>
                    ) : null}

                    {/* Card View (Always on Mobile/Tablet, or when selected on Desktop) */}
                    <div
                      className={`${
                        viewMode === 'table' ? 'lg:hidden' : 'block'
                      } grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`}
                    >
                      {filteredActiveRecords.map((record) => (
                        <DLRCard
                          key={record.id}
                          record={record}
                          onOpenModal={handleOpenImageModal}
                          onToast={addToast}
                          onDeleteRecord={(rec) => setRecordToDelete(rec)}
                          newlyAddedIds={newlyAddedIds}
                          isSelectable={isDepartmentFilterActive}
                          isSelected={selectedRecordIds.has(record.id)}
                          onToggleSelect={handleToggleSelectRecord}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : (
              /* Filed DLRs Page / Archive View */
              <FiledDLRView
                records={filedRecords}
                storeCode={session.storeCode}
                onOpenImageModal={handleOpenImageModal}
                onToast={addToast}
                onUnfileRecord={handleUnfileRecord}
                onUpdateDLRNumber={handleUpdateDLRNumber}
              />
            )}
          </>
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

      {/* Assign DLR Number Modal */}
      <AssignDLRModal
        isOpen={isAssignModalOpen}
        selectedRecords={selectedRecordsList}
        onClose={() => setIsAssignModalOpen(false)}
        onAssign={handleAssignDLRNumber}
      />

      {/* PWA Install and Offline Prompt */}
      <PWAInstallPrompt />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
};

export default App;
