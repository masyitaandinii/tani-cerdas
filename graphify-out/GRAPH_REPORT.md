# Graph Report - D:\project\ppk\tani-cerdas  (2026-07-30)

## Corpus Check
- 27 files · ~66,062 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 131 nodes · 139 edges · 26 communities (10 shown, 16 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 0.93)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Admin Dashboard Store
- TypeScript Compiler Config
- Dev Dependencies Tooling
- Core React Dependencies
- TypeScript References
- Next.js Setup Docs
- Package Scripts
- App Layout Provider
- Logo Graphics
- ESLint Config
- Next Config
- PostCSS Config
- Hero Field Image
- Hero Background Paddies
- File Icon
- Globe Icon
- Hero Background Houses
- Hero Background Mist
- Hero Background Mountains
- Hero Background River
- Logo 2
- Next.js Logo
- Vercel Logo
- Window Icon
- App Page Route

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `TengkulakRecord` - 10 edges
3. `useAppStore()` - 7 edges
4. `include` - 7 edges
5. `scripts` - 5 edges
6. `lib` - 4 edges
7. `Next.js` - 4 edges
8. `ChatbotSection()` - 3 edges
9. `User` - 3 edges
10. `AppState` - 3 edges

## Surprising Connections (you probably didn't know these)
- `Next.js` --semantically_similar_to--> `Next.js`  [INFERRED] [semantically similar]
  README.md → AGENTS.md
- `AGENTS.md` --references--> `nextjs-agent-rules`  [INFERRED]
  CLAUDE.md → AGENTS.md
- `PengelolaPage()` --calls--> `useAppStore()`  [EXTRACTED]
  app/admin/page.tsx → app/lib/store.tsx
- `DashboardChartsProps` --references--> `TengkulakRecord`  [EXTRACTED]
  app/components/DashboardCharts.tsx → app/lib/data.ts
- `Props` --references--> `TengkulakRecord`  [EXTRACTED]
  app/components/DusunDistributionCard.tsx → app/lib/data.ts

## Import Cycles
- None detected.

## Communities (26 total, 16 thin omitted)

### Community 0 - "Admin Dashboard Store"
Cohesion: 0.18
Nodes (17): PengelolaPage(), ChatbotSection(), DashboardCharts(), DashboardChartsProps, DusunDistributionCard(), Props, StatsCards(), StatsCardsProps (+9 more)

### Community 1 - "TypeScript Compiler Config"
Cohesion: 0.11
Nodes (19): dom, dom.iterable, esnext, compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules (+11 more)

### Community 2 - "Dev Dependencies Tooling"
Cohesion: 0.12
Nodes (17): eslint, eslint-config-next, devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/node (+9 more)

### Community 3 - "Core React Dependencies"
Cohesion: 0.18
Nodes (11): lucide-react, next, dependencies, lucide-react, next, react, react-dom, recharts (+3 more)

### Community 4 - "TypeScript References"
Cohesion: 0.20
Nodes (9): **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts, **/*.tsx, exclude (+1 more)

### Community 5 - "Next.js Setup Docs"
Cohesion: 0.22
Nodes (9): node_modules/next/dist/docs/, Next.js, nextjs-agent-rules, AGENTS.md, create-next-app, Geist, next/font, Next.js (+1 more)

### Community 6 - "Package Scripts"
Cohesion: 0.22
Nodes (8): name, private, scripts, build, dev, lint, start, version

### Community 7 - "App Layout Provider"
Cohesion: 0.40
Nodes (3): metadata, plusJakartaSans, AppProvider()

### Community 8 - "Logo Graphics"
Cohesion: 0.67
Nodes (3): Connected Yellow Dots, White Leaf Shape, Tani Cerdas Logo

## Knowledge Gaps
- **72 isolated node(s):** `plusJakartaSans`, `metadata`, `AppContext`, `eslintConfig`, `nextConfig` (+67 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **16 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `devDependencies` connect `Dev Dependencies Tooling` to `Package Scripts`?**
  _High betweenness centrality (0.052) - this node is a cross-community bridge._
- **Why does `compilerOptions` connect `TypeScript Compiler Config` to `TypeScript References`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Core React Dependencies` to `Package Scripts`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **What connects `plusJakartaSans`, `metadata`, `AppContext` to the rest of the system?**
  _72 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `TypeScript Compiler Config` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._
- **Should `Dev Dependencies Tooling` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._