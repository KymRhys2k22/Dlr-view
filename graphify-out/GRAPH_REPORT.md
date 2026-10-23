# Graph Report - Dlr-view  (2026-10-23)

## Corpus Check
- Corpus is ~36,387 words - fits in a single context window. You may not need a graph.

## Summary
- 373 nodes · 758 edges · 24 communities (21 shown, 3 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 23 edges (avg confidence: 0.88)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- App Shell and Core UI
- DLR Table and Action Modals
- Apple Design System Guidelines
- Project Configuration and Build Scripts
- Filed DLR and Export Utilities
- TypeScript Compiler Configuration
- OpenCode Agent Tooling Config
- Navbar, Notifications, and Audio
- ESLint Development Dependencies
- Application Bootstrap and Error Handling
- DLR Image Previews and Modals
- Runtime Core Dependencies
- Node TypeScript Configuration
- Public SVG Social Icons
- Vercel Deployment Configuration
- PWA Brand Icons and Manifest
- Brand Logos and Hero Assets
- Store Master Data and Utilities
- Cloudinary Image Service Integration
- Supabase Edge Function Deno Config
- TermIDE Shell Autocompletions
- Cloudinary Deletion Edge Function
- Vite Environment Type Declarations
- OpenCode CLI Session History

## God Nodes (most connected - your core abstractions)
1. `react` - 33 edges
2. `lucide-react` - 31 edges
3. `App()` - 31 edges
4. `DLRRecord` - 24 edges
5. `formatCurrencyPHP()` - 21 edges
6. `compilerOptions` - 19 edges
7. `Apple Design Skill` - 17 edges
8. `CopyUPCButton()` - 15 edges
9. `CopySKUButton()` - 13 edges
10. `exportFiledDLRToPdf()` - 10 edges

## Surprising Connections (you probably didn't know these)
- `Apple System Design Typography & Theme` --semantically_similar_to--> `UI Typography Foundations`  [INFERRED] [semantically similar]
  index.html → .agents/skills/apple-design/SKILL.md
- `Image Evidence Slotting` --conceptually_related_to--> `Spatial Consistency`  [INFERRED]
  README.md → .agents/skills/apple-design/SKILL.md
- `iOS Apple Mobile Web App Configuration` --conceptually_related_to--> `Materials and Depth (Translucency)`  [INFERRED]
  index.html → .agents/skills/apple-design/SKILL.md
- `Daiso Damage & Lost Report Dashboard` --conceptually_related_to--> `DOM Root Mount Point`  [INFERRED]
  README.md → index.html
- `Tailwind CSS v4` --semantically_similar_to--> `Apple System Design Typography & Theme`  [INFERRED] [semantically similar]
  README.md → index.html

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Fluid Gesture-Driven Physics Pipeline** — agents_skills_apple_design_skill_spring_physics, agents_skills_apple_design_skill_velocity_handoff, agents_skills_apple_design_skill_momentum_projection, agents_skills_apple_design_skill_interruptibility [INFERRED 0.95]
- **Daiso Inventory Loss Auditing and Reporting Pipeline** — readme_store_code_resolution, readme_strict_department_mapping, readme_live_summary_metrics, readme_image_evidence_slotting, readme_excel_export_feature [INFERRED 0.95]
- **Apple Web Presentation & Styling System** — index_apple_styling, index_apple_mobile_web_app, agents_skills_apple_design_skill_materials_and_depth, agents_skills_apple_design_skill_ui_typography [INFERRED 0.85]
- **UI Navigation and Social Icon Sprite Set** — public_icons_bluesky_icon, public_icons_discord_icon, public_icons_documentation_icon, public_icons_github_icon, public_icons_social_icon, public_icons_x_icon [EXTRACTED 1.00]
- **PWA and Application Icon Suite** — public_apple_touch_icon_apple_touch_icon, public_favicon_favicon, public_pwa_192x192_pwa_icon, public_pwa_512x512_pwa_icon [INFERRED 0.95]

## Communities (24 total, 3 thin omitted)

### Community 0 - "App Shell and Core UI"
Cohesion: 0.08
Nodes (42): react, App(), BatchActionBar(), BatchActionBarProps, DepartmentTabs(), EmptyState(), EmptyStateProps, ErrorState() (+34 more)

### Community 1 - "DLR Table and Action Modals"
Cohesion: 0.12
Nodes (32): lucide-react, AssignDLRModal(), AssignDLRModalProps, CopySKUButton(), CopySKUButtonProps, CopyUPCButton(), CopyUPCButtonProps, DeleteConfirmModal() (+24 more)

### Community 2 - "Apple Design System Guidelines"
Cohesion: 0.08
Nodes (21): Apple Design Skill, Designing Audio-Haptic Experiences, Eight Principles of Great Design, WWDC 2018: Designing Fluid Interfaces, WWDC 2020: The Details of UI Typography, WWDC 2026: Principles of Great Design, iOS Apple Mobile Web App Configuration, PWA Meta Configuration (+13 more)

### Community 3 - "Project Configuration and Build Scripts"
Cohesion: 0.07
Nodes (30): name, private, scripts, build, dev, lint, preview, typecheck (+22 more)

### Community 4 - "Filed DLR and Export Utilities"
Cohesion: 0.14
Nodes (25): jspdf, jspdf-autotable, DepartmentTabsProps, FiledDLRCard(), FiledDLRCardProps, FiledDLRDetailModal(), FiledDLRDetailModalProps, FiledDLRView() (+17 more)

### Community 5 - "TypeScript Compiler Configuration"
Cohesion: 0.10
Nodes (20): compilerOptions, allowImportingTsExtensions, baseUrl, isolatedModules, jsx, lib, module, moduleDetection (+12 more)

### Community 6 - "OpenCode Agent Tooling Config"
Cohesion: 0.12
Nodes (16): models, name, npm, options, name, mcp, supabase, model (+8 more)

### Community 7 - "Navbar, Notifications, and Audio"
Cohesion: 0.30
Nodes (11): NavbarProps, NotificationCenter(), NotificationCenterProps, RealtimeEventItem, isSoundNotificationEnabled(), playNotificationSound(), setSoundNotificationEnabled(), getBrowserNotificationPermission() (+3 more)

### Community 8 - "ESLint Development Dependencies"
Cohesion: 0.14
Nodes (14): devDependencies, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, @types/node, @types/react (+6 more)

### Community 9 - "Application Bootstrap and Error Handling"
Cohesion: 0.17
Nodes (5): react-dom, ErrorBoundary, Props, State, rootElement

### Community 10 - "DLR Image Previews and Modals"
Cohesion: 0.27
Nodes (9): CopyImageButton(), CopyImageButtonProps, DLRImagePreviewProps, ImageSlot, SLOTS, ImageModal(), ImageModalProps, getOriginalImageUrl() (+1 more)

### Community 11 - "Runtime Core Dependencies"
Cohesion: 0.20
Nodes (10): dependencies, jspdf, jspdf-autotable, lucide-react, react, react-dom, @supabase/supabase-js, tailwindcss (+2 more)

### Community 12 - "Node TypeScript Configuration"
Cohesion: 0.22
Nodes (8): compilerOptions, allowSyntheticDefaultImports, composite, module, moduleResolution, skipLibCheck, strict, include

### Community 13 - "Public SVG Social Icons"
Cohesion: 0.29
Nodes (7): Bluesky Icon, Discord Icon, Documentation Icon, GitHub Icon, Social Icon, SVG Icons Sprite, X Icon

### Community 14 - "Vercel Deployment Configuration"
Cohesion: 0.29
Nodes (6): buildCommand, framework, headers, outputDirectory, rewrites, $schema

### Community 15 - "PWA Brand Icons and Manifest"
Cohesion: 0.40
Nodes (6): Apple Touch Icon, Daiso Brand Identity, Favicon, PWA Icon 192x192, DLR Daily Log Report Visual Motif, PWA Icon 512x512

### Community 16 - "Brand Logos and Hero Assets"
Cohesion: 0.33
Nodes (6): Hero Image, Isometric Layered Card Illustration, React Framework Branding, React Logo SVG, Vite Tooling Branding, Vite Logo SVG

### Community 17 - "Store Master Data and Utilities"
Cohesion: 0.80
Nodes (3): getStoreNameByCode(), isValidStoreCode(), STORES

### Community 18 - "Cloudinary Image Service Integration"
Cohesion: 0.70
Nodes (3): deleteCloudinaryImages(), getCloudinaryPublicId(), getCloudinaryPublicIds()

### Community 19 - "Supabase Edge Function Deno Config"
Cohesion: 0.40
Nodes (4): compilerOptions, lib, imports, @supabase/functions-js

### Community 20 - "TermIDE Shell Autocompletions"
Cohesion: 0.67
Nodes (3): termide.bash script, _termide(), _termide_sessions()

## Knowledge Gaps
- **22 isolated node(s):** `tailwindcss`, `@types/node`, `@types/react`, `@types/react-dom`, `typescript` (+17 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 140 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `App Shell and Core UI` to `DLR Table and Action Modals`, `Project Configuration and Build Scripts`, `Filed DLR and Export Utilities`, `Navbar, Notifications, and Audio`, `Application Bootstrap and Error Handling`, `DLR Image Previews and Modals`?**
  _High betweenness centrality (0.098) - this node is a cross-community bridge._
- **What connects `tailwindcss`, `@types/node`, `@types/react` to the rest of the system?**
  _22 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App Shell and Core UI` be split into smaller, more focused modules?**
  _Cohesion score 0.07987012987012987 - nodes in this community are weakly interconnected._
- **Why does `lucide-react` connect `DLR Table and Action Modals` to `App Shell and Core UI`, `Project Configuration and Build Scripts`, `Filed DLR and Export Utilities`, `Navbar, Notifications, and Audio`, `Application Bootstrap and Error Handling`, `DLR Image Previews and Modals`?**
  _High betweenness centrality (0.088) - this node is a cross-community bridge._
- **Should `DLR Table and Action Modals` be split into smaller, more focused modules?**
  _Cohesion score 0.12473572938689217 - nodes in this community are weakly interconnected._
- **Why does `devDependencies` connect `ESLint Development Dependencies` to `Project Configuration and Build Scripts`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._
- **Should `Apple Design System Guidelines` be split into smaller, more focused modules?**
  _Cohesion score 0.0761904761904762 - nodes in this community are weakly interconnected._