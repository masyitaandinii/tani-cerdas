# Graph Report - .  (2026-08-12)

## Corpus Check
- 63 files · ~85,159 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 211 nodes · 316 edges · 19 communities (15 shown, 4 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 5
- Community 6
- Community 7
- Community 8
- Community 9
- Community 13
- Community 14
- Community 15
- Community 16

## God Nodes (most connected - your core abstractions)
1. `connectToDatabase()` - 18 edges
2. `compilerOptions` - 16 edges
3. `TengkulakRecord` - 14 edges
4. `authOptions` - 9 edges
5. `DUSUN_NAMES` - 7 edges
6. `include` - 7 edges
7. `Navbar()` - 6 edges
8. `ROLES` - 6 edges
9. `scripts` - 6 edges
10. `POST()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `seed()` --references--> `TengkulakRecord`  [EXTRACTED]
  scripts/seed.ts → app/lib/data.ts
- `ChatbotSection()` --references--> `react`  [EXTRACTED]
  app/components/ChatbotSection.tsx → package.json
- `PUT()` --references--> `TengkulakRecord`  [EXTRACTED]
  app/api/records/[id]/route.ts → app/lib/data.ts
- `DELETE()` --references--> `TengkulakRecord`  [EXTRACTED]
  app/api/records/[id]/route.ts → app/lib/data.ts
- `GET()` --references--> `TengkulakRecord`  [EXTRACTED]
  app/api/records/route.ts → app/lib/data.ts

## Import Cycles
- None detected.

## Communities (19 total, 4 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.13
Nodes (22): handler, DELETE(), PUT(), RecordSchema, GET(), POST(), RecordSchema, GET() (+14 more)

### Community 1 - "Community 1"
Cohesion: 0.12
Nodes (15): AdminClient(), AppUser, DashboardCharts(), DashboardChartsProps, DashboardClient(), DusunDistributionCard(), Props, Navbar() (+7 more)

### Community 2 - "Community 2"
Cohesion: 0.06
Nodes (33): dotenv, eslint, eslint-config-next, jsdom, devDependencies, dotenv, eslint, eslint-config-next (+25 more)

### Community 3 - "Community 3"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 4 - "Community 4"
Cohesion: 0.12
Nodes (17): bcrypt, lucide-react, mongoose, next, next-auth, dependencies, bcrypt, lucide-react (+9 more)

### Community 5 - "Community 5"
Cohesion: 0.17
Nodes (10): ChatbotSection(), metadata, plusJakartaSans, AppContext, AppProvider(), AppState, useAppStore(), Providers() (+2 more)

### Community 6 - "Community 6"
Cohesion: 0.20
Nodes (9): name, private, scripts, build, dev, lint, start, test (+1 more)

### Community 7 - "Community 7"
Cohesion: 0.39
Nodes (5): ALLOWED_KEYWORDS, INJECTION_BLOCKLIST, IP_RATE_LIMIT, POST(), CHAT_LIMITS

### Community 8 - "Community 8"
Cohesion: 0.33
Nodes (4): Kuartal, ITengkulakRecord, TengkulakRecordSchema, seed()

### Community 9 - "Community 9"
Cohesion: 0.33
Nodes (5): JWT, next-auth, next-auth/jwt, Session, User

## Knowledge Gaps
- **83 isolated node(s):** `AppUser`, `handler`, `RecordSchema`, `RecordSchema`, `DashboardChartsProps` (+78 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `Community 4` to `Community 5`, `Community 6`?**
  _High betweenness centrality (0.305) - this node is a cross-community bridge._
- **Why does `react` connect `Community 5` to `Community 4`?**
  _High betweenness centrality (0.275) - this node is a cross-community bridge._
- **Why does `ChatbotSection()` connect `Community 5` to `Community 1`?**
  _High betweenness centrality (0.274) - this node is a cross-community bridge._
- **What connects `AppUser`, `handler`, `RecordSchema` to the rest of the system?**
  _83 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.12612612612612611 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.125 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.06060606060606061 - nodes in this community are weakly interconnected._