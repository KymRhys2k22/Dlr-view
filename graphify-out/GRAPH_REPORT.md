# Graph Report - Dlr-view  (2026-09-17)

## Corpus Check
- Corpus is ~33,698 words - fits in a single context window. You may not need a graph.

## Summary
- 361 nodes · 679 edges · 22 communities (19 shown, 3 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 23 edges (avg confidence: 0.88)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Core Application & DLR State
- DLR Management & Filing Modals
- Development & Linting Tooling
- Apple Design Foundations & UX
- Document Export & Department Tabs
- TypeScript Compiler Configuration
- OpenCode Agent Router Config
- Navigation & Notification Center
- Error Boundaries & App Lifecycle
- Production Dependencies & Packages
- Node TypeScript Configuration
- Social & UI Sprite Icons
- Vercel Deployment Settings
- PWA Icons & Brand Assets
- Framework & Hero Visual Assets
- Store Data & Code Validation
- Summary Cards & Currency Metrics
- Edge Functions Deno Config
- Termide Shell Completions
- Cloudinary Image Cleanup Edge Function
- Vite Environment Definitions
- OpenCode Session Metadata

## God Nodes (most connected - your core abstractions)
1. `react` - 31 edges
2. `lucide-react` - 29 edges
3. `DLRRecord` - 22 edges
4. `formatCurrencyPHP()` - 19 edges
5. `compilerOptions` - 19 edges
6. `Apple Design Skill` - 17 edges
7. `App()` - 12 edges
8. `exportFiledDLRToPdf()` - 10 edges
9. `Daiso Damage & Lost Report Dashboard` - 10 edges
10. `exportDLRToExcel()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `Apple System Design Typography & Theme` --semantically_similar_to--> `UI Typography Foundations`  [INFERRED] [semantically similar]
  index.html → .agents/skills/apple-design/SKILL.md
- `Tailwind CSS v4` --semantically_similar_to--> `Apple System Design Typography & Theme`  [INFERRED] [semantically similar]
  README.md → index.html
- `Daiso Damage & Lost Report Dashboard` --conceptually_related_to--> `DOM Root Mount Point`  [INFERRED]
  README.md → index.html
- `Image Evidence Slotting` --conceptually_related_to--> `Spatial Consistency`  [INFERRED]
  README.md → .agents/skills/apple-design/SKILL.md
- `iOS Apple Mobile Web App Configuration` --conceptually_related_to--> `Materials and Depth (Translucency)`  [INFERRED]
  index.html → .agents/skills/apple-design/SKILL.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Fluid Gesture-Driven Physics Pipeline** — agents_skills_apple_design_skill_spring_physics, agents_skills_apple_design_skill_velocity_handoff, agents_skills_apple_design_skill_momentum_projection, agents_skills_apple_design_skill_interruptibility [INFERRED 0.95]
- **Apple Web Presentation & Styling System** — index_apple_styling, index_apple_mobile_web_app, agents_skills_apple_design_skill_materials_and_depth, agents_skills_apple_design_skill_ui_typography [INFERRED 0.85]
- **Daiso Inventory Loss Auditing and Reporting Pipeline** — readme_store_code_resolution, readme_strict_department_mapping, readme_live_summary_metrics, readme_image_evidence_slotting, readme_excel_export_feature [INFERRED 0.95]
- **PWA and Application Icon Suite** — public_apple_touch_icon_apple_touch_icon, public_favicon_favicon, public_pwa_192x192_pwa_icon, public_pwa_512x512_pwa_icon [INFERRED 0.95]
- **UI Navigation and Social Icon Sprite Set** — public_icons_bluesky_icon, public_icons_discord_icon, public_icons_documentation_icon, public_icons_github_icon, public_icons_social_icon, public_icons_x_icon [EXTRACTED 1.00]

## Communities (22 total, 3 thin omitted)

### Community 0 - "Core Application & DLR State"
Cohesion: 0.07
Nodes (39): @supabase/supabase-js, App(), BatchActionBar(), BatchActionBarProps, EmptyState(), EmptyStateProps, ErrorState(), ErrorStateProps (+31 more)

### Community 1 - "DLR Management & Filing Modals"
Cohesion: 0.11
Nodes (38): lucide-react, react, xlsx, AssignDLRModal(), AssignDLRModalProps, CopyImageButton(), CopyImageButtonProps, CopySKUButton() (+30 more)

### Community 2 - "Development & Linting Tooling"
Cohesion: 0.05
Nodes (45): devDependencies, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, @types/node, @types/react (+37 more)

### Community 3 - "Apple Design Foundations & UX"
Cohesion: 0.08
Nodes (34): Apple Design Skill, Designing Audio-Haptic Experiences, Direct Manipulation (1:1 Tracking), Eight Principles of Great Design, Interruptibility Principle, Materials and Depth (Translucency), Momentum Projection, Multimodal Feedback (Audio-Haptics) (+26 more)

### Community 4 - "Document Export & Department Tabs"
Cohesion: 0.13
Nodes (20): jspdf, jspdf-autotable, DepartmentTabs(), DepartmentTabsProps, ImageModal(), ImageModalProps, FilterState, RawSupabaseDLRRecord (+12 more)

### Community 5 - "TypeScript Compiler Configuration"
Cohesion: 0.10
Nodes (20): compilerOptions, allowImportingTsExtensions, baseUrl, isolatedModules, jsx, lib, module, moduleDetection (+12 more)

### Community 6 - "OpenCode Agent Router Config"
Cohesion: 0.12
Nodes (16): models, name, npm, options, name, mcp, supabase, model (+8 more)

### Community 7 - "Navigation & Notification Center"
Cohesion: 0.27
Nodes (12): Navbar(), NavbarProps, NotificationCenter(), NotificationCenterProps, RealtimeEventItem, isSoundNotificationEnabled(), playNotificationSound(), setSoundNotificationEnabled() (+4 more)

### Community 8 - "Error Boundaries & App Lifecycle"
Cohesion: 0.17
Nodes (6): ref_react_dom_client, ErrorBoundary, Props, State, src_index, rootElement

### Community 9 - "Production Dependencies & Packages"
Cohesion: 0.20
Nodes (10): dependencies, jspdf, jspdf-autotable, lucide-react, react, react-dom, @supabase/supabase-js, tailwindcss (+2 more)

### Community 10 - "Node TypeScript Configuration"
Cohesion: 0.22
Nodes (8): compilerOptions, allowSyntheticDefaultImports, composite, module, moduleResolution, skipLibCheck, strict, include

### Community 11 - "Social & UI Sprite Icons"
Cohesion: 0.29
Nodes (7): Bluesky Icon, Discord Icon, Documentation Icon, GitHub Icon, Social Icon, SVG Icons Sprite, X Icon

### Community 12 - "Vercel Deployment Settings"
Cohesion: 0.29
Nodes (6): buildCommand, framework, headers, outputDirectory, rewrites, $schema

### Community 13 - "PWA Icons & Brand Assets"
Cohesion: 0.40
Nodes (6): Apple Touch Icon, Daiso Brand Identity, Favicon, PWA Icon 192x192, DLR Daily Log Report Visual Motif, PWA Icon 512x512

### Community 14 - "Framework & Hero Visual Assets"
Cohesion: 0.33
Nodes (6): Hero Image, Isometric Layered Card Illustration, React Framework Branding, React Logo SVG, Vite Tooling Branding, Vite Logo SVG

### Community 15 - "Store Data & Code Validation"
Cohesion: 0.80
Nodes (3): getStoreNameByCode(), isValidStoreCode(), STORES

### Community 16 - "Summary Cards & Currency Metrics"
Cohesion: 0.60
Nodes (4): SummaryCards(), SummaryCardsProps, SummaryStats, formatNumber()

### Community 17 - "Edge Functions Deno Config"
Cohesion: 0.40
Nodes (4): compilerOptions, lib, imports, @supabase/functions-js

### Community 18 - "Termide Shell Completions"
Cohesion: 0.67
Nodes (3): termide.bash script, _termide(), _termide_sessions()

## Knowledge Gaps
- **124 isolated node(s):** `termide.bash script`, `$schema`, `npm`, `name`, `baseURL` (+119 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 142 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `DLR Management & Filing Modals` to `Core Application & DLR State`, `Development & Linting Tooling`, `Document Export & Department Tabs`, `Navigation & Notification Center`, `Error Boundaries & App Lifecycle`, `Summary Cards & Currency Metrics`?**
  _High betweenness centrality (0.101) - this node is a cross-community bridge._
- **Why does `lucide-react` connect `DLR Management & Filing Modals` to `Core Application & DLR State`, `Development & Linting Tooling`, `Document Export & Department Tabs`, `Navigation & Notification Center`, `Error Boundaries & App Lifecycle`, `Summary Cards & Currency Metrics`?**
  _High betweenness centrality (0.087) - this node is a cross-community bridge._
- **What connects `termide.bash script`, `$schema`, `npm` to the rest of the system?**
  _124 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Core Application & DLR State` be split into smaller, more focused modules?**
  _Cohesion score 0.06623376623376623 - nodes in this community are weakly interconnected._
- **Should `DLR Management & Filing Modals` be split into smaller, more focused modules?**
  _Cohesion score 0.11030478955007257 - nodes in this community are weakly interconnected._
- **Should `Development & Linting Tooling` be split into smaller, more focused modules?**
  _Cohesion score 0.04698581560283688 - nodes in this community are weakly interconnected._
- **Should `Apple Design Foundations & UX` be split into smaller, more focused modules?**
  _Cohesion score 0.0761904761904762 - nodes in this community are weakly interconnected._