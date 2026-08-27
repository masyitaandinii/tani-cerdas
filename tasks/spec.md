# Spec: Industrial-Standard Project Restructuring (TaniCerdas)

## 1. Objective
Restrukturisasi arsitektur codebase **TaniCerdas** agar memenuhi standar industri (*enterprise-grade Next.js App Router with Clean Feature-Driven Architecture*), dengan tujuan:
1. **Mengeliminasi Duplikasi Kode Ekstrem:** Menyelesaikan duplikasi 1.599 baris kode antara `/detail` dan `/admin/input`.
2. **Modularitas Komponen (Single Responsibility Principle):** Memecah file monolitik 1.500+ baris menjadi sub-komponen terisolasi (`RecordForm`, `RecordTable`, `UserForm`, `UserTable`, `EditRecordModal`, `EditUserModal`, `ConfirmModal`, dll.).
3. **Sentralisasi Type Definitions (`types/`):** Menggabungkan tipe data yang tersebar (`TengkulakRecord`, `IUser`, `AppUser`, `Kuartal`, API contracts) ke dalam folder `types/` terpusat.
4. **Service / API Layer (`services/`):** Memisahkan logika fetch API (HTTP calls, error handling, payload formatting) dari UI components ke service layer yang reusable.
5. **Reusable Atomic UI (`components/ui/`):** Menyediakan komponen UI generik (Modal, ConfirmDialog, SuccessDialog, Badge, Form Controls).
6. **Feature-Based Component Grouping (`components/features/`):** Mengelompokkan komponen berdasarkan domain fitur (`records/`, `users/`, `tengkulak/`, `home/`, `complaints/`).
7. **Zero Regression:** Menjamin 100% fungsionalitas tetap berjalan normal, seluruh test suite Vitest (20+ tests) lulus, dan Next.js production build berhasil tanpa error tipe.

---

## 2. Tech Stack & Conventions
- **Framework:** Next.js 16.2 (App Router, Turbopack, React 19)
- **Language:** TypeScript (Strict Mode)
- **State & Data Fetching:** React Hooks + Service Layer
- **Styling:** Tailwind CSS v3
- **Database & ORM:** MongoDB + Mongoose
- **Auth:** NextAuth.js (JWT Strategy)
- **Test Runner:** Vitest

---

## 3. Industrial Standard Project Layout Target

```
tani-cerdas/
├── app/                              # Next.js App Router (Page routing & API endpoints only)
│   ├── (auth)/                       # Auth routes
│   │   └── admin/                    # /admin (Login Portal)
│   │       ├── page.tsx
│   │       ├── layout.tsx
│   │       └── AdminClient.tsx
│   ├── admin/input/                  # /admin/input (Redirect/Alias to /detail for zero duplication)
│   │   └── page.tsx
│   ├── detail/                       # /detail (Main Data & Account Management Dashboard)
│   │   └── page.tsx                  # Clean orchestrator (~150 lines)
│   ├── tengkulak/                    # /tengkulak (Tengkulak Self-Service Portal)
│   │   └── page.tsx
│   ├── api/                          # Route Handlers
│   │   ├── auth/[...nextauth]/
│   │   ├── records/
│   │   ├── tengkulak/
│   │   ├── users/
│   │   └── chat/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                      # Landing page
│
├── components/                       # UI Component Library
│   ├── ui/                           # Generic Reusable Atoms/Molecules
│   │   ├── Modal.tsx                 # Base backdrop & dialog container
│   │   ├── ConfirmModal.tsx          # Generic delete/action confirmation modal
│   │   ├── SuccessModal.tsx          # Generic success notification modal
│   │   └── Badge.tsx                 # Role & Status badges
│   ├── layout/                       # App layout shells
│   │   ├── Navbar.tsx
│   │   └── PageHeader.tsx
│   └── features/                     # Domain-Driven Feature Modules
│       ├── records/                  # Harvest Records feature
│       │   ├── RecordForm.tsx
│       │   ├── RecordTable.tsx
│       │   ├── EditRecordModal.tsx
│       │   └── DusunFilterBar.tsx
│       ├── users/                    # User & Mitra Management feature
│       │   ├── UserForm.tsx
│       │   ├── UserTable.tsx
│       │   └── EditUserModal.tsx
│       ├── tengkulak/                # Tengkulak Self-Service Portal & Public Directory
│       │   ├── TengkulakDashboard.tsx
│       │   └── TengkulakDirectorySection.tsx
│       ├── complaints/               # Citizen Complaints feature
│       │   └── ComplaintSection.tsx
│       └── home/                     # Landing Page Widgets
│           ├── StatsCards.tsx
│           ├── DashboardCharts.tsx
│           ├── DusunDistributionCard.tsx
│           └── ChatbotSection.tsx
│
├── services/                         # Frontend API Services
│   ├── recordService.ts              # CRUD API for harvest records
│   ├── userService.ts                # CRUD API for system users & tengkulak
│   └── tengkulakService.ts           # Public directory API
│
├── types/                            # Centralized TypeScript Type Definitions
│   ├── record.ts                     # Harvest record & kuartal contracts
│   ├── user.ts                       # User, roles, & session contracts
│   ├── api.ts                        # API standard envelope & error responses
│   └── index.ts                      # Barrel export
│
├── app/lib/                          # Backend utilities, DB, Models, & Constants
│   ├── db.ts                         # Mongoose connection with DNS auto-configuration
│   ├── auth.ts                       # NextAuth options & RBAC authorize logic
│   ├── constants.ts                  # Dusun config, village info, government price benchmarks
│   ├── data.ts                       # Types & legacy helpers
│   └── models/                       # Mongoose schemas
│       ├── User.ts
│       └── TengkulakRecord.ts
│
└── tests/                            # Vitest Test Suites
    ├── auth.test.ts
    ├── records.test.ts
    ├── models.test.ts
    └── chat.test.ts
```

---

## 4. Architectural Boundaries
- **Always:**
  - Pastikan semua tipe data di-import dari `@/types` atau file model terkait.
  - Pisahkan logic render UI dari HTTP network requests menggunakan `services/`.
  - Gunakan nama komponen PascalCase yang merefleksikan domain (`RecordForm`, `UserTable`).
  - Jalankan `npm test` dan `npm run build` setelah setiap refactoring slice.
- **Ask First:**
  - Mengubah skema database atau menghapus endpoint API yang aktif.
- **Never:**
  - Menghapus fungsionalitas bisnis yang telah disepakati (RBAC dusun, WhatsApp linking, acuan HET/HPP, formulir pengaduan).
  - Melakukan refactor tanpa verifikasi type safety.

---

## 5. Success Criteria
1. `app/detail/page.tsx` ter-refactor dari 1.599 baris menjadi modular (< 250 baris).
2. Duplikasi di `app/admin/input/page.tsx` dieliminasi (menggunakan reusable component atau redirect terstandar).
3. Folder `types/`, `services/`, `components/ui/`, dan `components/features/` terstruktur rapi.
4. Semua 20 unit tests di Vitest lulus 100%.
5. `npm run build` sukses tanpa warning tipe atau compile error.
