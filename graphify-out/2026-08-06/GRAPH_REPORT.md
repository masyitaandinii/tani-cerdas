# Graph Report - .  (2026-08-06)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 206 nodes · 242 edges · 34 communities (17 shown, 17 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 0.93)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `9bfdc783`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- connectToDatabase
- devDependencies
- app/page.tsx
- dependencies
- compilerOptions
- include
- Next.js
- package.json
- constants.ts
- data.ts
- next-auth.d.ts
- Tani Cerdas Logo
- eslint.config.mjs
- middleware.ts
- next.config.ts
- postcss.config.mjs
- Agricultural Field
- Agriculture
- Document Icon
- Globe Icon SVG
- Houses
- Mist
- Mountains
- River
- Tani Cerdas Logo
- Next.js Logo
- Vercel Logo
- Window Icon
- app/page.tsx

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `connectToDatabase()` - 15 edges
3. `authOptions` - 8 edges
4. `include` - 7 edges
5. `User` - 6 edges
6. `ROLES` - 5 edges
7. `useAppStore()` - 5 edges
8. `scripts` - 5 edges
9. `lib` - 4 edges
10. `Next.js` - 4 edges

## Surprising Connections (you probably didn't know these)
- `Next.js` --semantically_similar_to--> `Next.js`  [INFERRED] [semantically similar]
  README.md → AGENTS.md
- `AGENTS.md` --references--> `nextjs-agent-rules`  [INFERRED]
  CLAUDE.md → AGENTS.md
- `ChatbotSection()` --references--> `react`  [EXTRACTED]
  app/components/ChatbotSection.tsx → package.json
- `seed()` --references--> `User`  [EXTRACTED]
  scripts/seed.ts → types/next-auth.d.ts
- `run()` --references--> `User`  [EXTRACTED]
  scripts/setup-superadmin.ts → types/next-auth.d.ts

## Import Cycles
- None detected.

## Communities (34 total, 17 thin omitted)

### Community 0 - "connectToDatabase"
Cohesion: 0.11
Nodes (23): handler, DELETE(), PUT(), RecordSchema, GET(), POST(), RecordSchema, GET() (+15 more)

### Community 1 - "devDependencies"
Cohesion: 0.08
Nodes (25): dotenv, eslint, eslint-config-next, devDependencies, dotenv, eslint, eslint-config-next, tailwindcss (+17 more)

### Community 2 - "app/page.tsx"
Cohesion: 0.13
Nodes (14): ChatbotSection(), DashboardCharts(), DashboardChartsProps, DusunDistributionCard(), Props, StatsCards(), metadata, plusJakartaSans (+6 more)

### Community 3 - "dependencies"
Cohesion: 0.11
Nodes (19): bcrypt, lucide-react, mongoose, next, next-auth, dependencies, bcrypt, lucide-react (+11 more)

### Community 4 - "compilerOptions"
Cohesion: 0.11
Nodes (19): dom, dom.iterable, esnext, compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules (+11 more)

### Community 5 - "include"
Cohesion: 0.20
Nodes (9): **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts, **/*.tsx, exclude (+1 more)

### Community 6 - "Next.js"
Cohesion: 0.22
Nodes (9): node_modules/next/dist/docs/, Next.js, nextjs-agent-rules, AGENTS.md, create-next-app, Geist, next/font, Next.js (+1 more)

### Community 7 - "package.json"
Cohesion: 0.22
Nodes (8): name, private, scripts, build, dev, lint, start, version

### Community 8 - "constants.ts"
Cohesion: 0.43
Nodes (3): ALLOWED_KEYWORDS, POST(), CHAT_LIMITS

### Community 9 - "data.ts"
Cohesion: 0.33
Nodes (5): INITIAL_TENGKULAK_RECORDS, INITIAL_USERS, Kuartal, TengkulakRecord, User

### Community 10 - "next-auth.d.ts"
Cohesion: 0.40
Nodes (4): JWT, next-auth, next-auth/jwt, Session

### Community 11 - "Tani Cerdas Logo"
Cohesion: 0.67
Nodes (3): Connected Yellow Dots, White Leaf Shape, Tani Cerdas Logo

## Knowledge Gaps
- **100 isolated node(s):** `Kuartal`, `TengkulakRecord`, `User`, `INITIAL_USERS`, `INITIAL_TENGKULAK_RECORDS` (+95 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **17 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `package.json`?**
  _High betweenness centrality (0.091) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `devDependencies` to `package.json`?**
  _High betweenness centrality (0.071) - this node is a cross-community bridge._
- **Why does `react` connect `dependencies` to `app/page.tsx`?**
  _High betweenness centrality (0.060) - this node is a cross-community bridge._
- **What connects `Kuartal`, `TengkulakRecord`, `User` to the rest of the system?**
  _100 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `connectToDatabase` be split into smaller, more focused modules?**
  _Cohesion score 0.11201079622132254 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
- **Should `app/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.13043478260869565 - nodes in this community are weakly interconnected._