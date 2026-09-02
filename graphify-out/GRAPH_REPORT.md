# Graph Report - Dlr-view  (2026-09-03)

## Corpus Check
- Corpus is ~18,227 words - fits in a single context window. You may not need a graph.

## Summary
- 218 nodes · 352 edges · 16 communities (13 shown, 3 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.85)
- Token cost: 2,500 input · 600 output

## Community Hubs (Navigation)
- Core Dashboard & Application State
- ESLint & Linting Configuration
- Project Dependencies & Manifest
- TypeScript Compiler Configuration
- Application Entrypoint & Notifications
- DLR Cards & Confirmation Modals
- Authentication & Store Directory
- Department Filtering & Excel Export
- Vite & Tooling Config
- Image Evidence & Preview Components
- Vercel Deployment Settings
- Store Code Resolution Utilities
- Vite Environment Definitions
- Vite Configuration Helpers
- Department Mapping Specification

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 19 edges
2. `DLRRecord` - 15 edges
3. `formatCurrencyPHP()` - 9 edges
4. `App()` - 8 edges
5. `NotificationCenter()` - 8 edges
6. `getStoreNameByCode()` - 8 edges
7. `UserSession` - 8 edges
8. `compilerOptions` - 7 edges
9. `scripts` - 6 edges
10. `fetchDLRRecordsFromSupabase()` - 6 edges

## Surprising Connections (you probably didn't know these)
- `ExportExcelButtonProps` --references--> `DLRRecord`  [EXTRACTED]
  src/components/ExportExcelButton.tsx → src/types/dlr.ts
- `LoginFormProps` --references--> `UserSession`  [EXTRACTED]
  src/components/LoginForm.tsx → src/types/dlr.ts
- `App()` --calls--> `fetchDLRRecordsFromSupabase()`  [EXTRACTED]
  src/App.tsx → src/services/dlrService.ts
- `App()` --calls--> `subscribeToDLRChanges()`  [EXTRACTED]
  src/App.tsx → src/services/dlrService.ts
- `DLRCardProps` --references--> `DLRRecord`  [EXTRACTED]
  src/components/DLRCard.tsx → src/types/dlr.ts

## Import Cycles
- None detected.

## Communities (16 total, 3 thin omitted)

### Community 0 - "Core Dashboard & Application State"
Cohesion: 0.10
Nodes (21): Daiso Damage & Lost Report Dashboard, Excel Export Specification, EmptyState(), EmptyStateProps, ErrorState(), ErrorStateProps, getTimeOfDayGreeting(), Greeting() (+13 more)

### Community 1 - "ESLint & Linting Configuration"
Cohesion: 0.07
Nodes (27): eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, devDependencies, eslint, @eslint/js (+19 more)

### Community 2 - "Project Dependencies & Manifest"
Cohesion: 0.08
Nodes (25): lucide-react, dependencies, lucide-react, react, react-dom, @supabase/supabase-js, tailwindcss, @tailwindcss/vite (+17 more)

### Community 3 - "TypeScript Compiler Configuration"
Cohesion: 0.08
Nodes (24): DOM, DOM.Iterable, ES2022, src, compilerOptions, allowImportingTsExtensions, baseUrl, isolatedModules (+16 more)

### Community 4 - "Application Entrypoint & Notifications"
Cohesion: 0.22
Nodes (14): Web HTML Shell & PWA Meta, App(), NotificationCenter(), NotificationCenterProps, rootElement, deleteDLRRecordFromSupabase(), isSoundNotificationEnabled(), playNotificationSound() (+6 more)

### Community 5 - "DLR Cards & Confirmation Modals"
Cohesion: 0.22
Nodes (13): DeleteConfirmModal(), DeleteConfirmModalProps, DLRCard(), DLRCardProps, DLRImagePreview(), DLRTable(), DLRTableProps, SummaryCards() (+5 more)

### Community 6 - "Authentication & Store Directory"
Cohesion: 0.21
Nodes (12): LoginForm(), LoginFormProps, StoreInfo, getStoreNameByCode(), isValidStoreCode(), STORES, supabase, fetchDLRRecordsFromSupabase() (+4 more)

### Community 7 - "Department Filtering & Excel Export"
Cohesion: 0.26
Nodes (9): DepartmentTabs(), DepartmentTabsProps, ExportExcelButton(), ExportExcelButtonProps, FilterState, exportDLRToExcel(), DEPARTMENT_TABS, DepartmentName (+1 more)

### Community 8 - "Vite & Tooling Config"
Cohesion: 0.18
Nodes (10): vite.config.js, vite.config.ts, compilerOptions, allowSyntheticDefaultImports, composite, module, moduleResolution, skipLibCheck (+2 more)

### Community 9 - "Image Evidence & Preview Components"
Cohesion: 0.24
Nodes (7): CopyImageButton(), CopyImageButtonProps, DLRImagePreviewProps, ImageSlot, SLOTS, ImageModal(), ImageModalProps

### Community 10 - "Vercel Deployment Settings"
Cohesion: 0.29
Nodes (6): buildCommand, framework, headers, outputDirectory, rewrites, $schema

### Community 11 - "Store Code Resolution Utilities"
Cohesion: 0.80
Nodes (3): getStoreNameByCode(), isValidStoreCode(), STORES

## Knowledge Gaps
- **85 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+80 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `devDependencies` connect `ESLint & Linting Configuration` to `Project Dependencies & Manifest`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **Why does `DLRRecord` connect `DLR Cards & Confirmation Modals` to `Core Dashboard & Application State`, `Application Entrypoint & Notifications`, `Authentication & Store Directory`, `Department Filtering & Excel Export`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _85 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Core Dashboard & Application State` be split into smaller, more focused modules?**
  _Cohesion score 0.0989247311827957 - nodes in this community are weakly interconnected._
- **Should `ESLint & Linting Configuration` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._
- **Should `Project Dependencies & Manifest` be split into smaller, more focused modules?**
  _Cohesion score 0.07692307692307693 - nodes in this community are weakly interconnected._
- **Should `TypeScript Compiler Configuration` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._