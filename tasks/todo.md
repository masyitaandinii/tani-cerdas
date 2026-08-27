- [x] Task 1: Create Centralized Types Layer (`types/`)
  - Acceptance: `types/record.ts`, `types/user.ts`, `types/api.ts`, `types/index.ts` dibuat dan mengekspor interface lengkap.
  - Verify: Import types di file TypeScript tanpa compiler error.
  - Files: `types/record.ts`, `types/user.ts`, `types/api.ts`, `types/index.ts`

- [x] Task 2: Create Frontend API Service Layer (`services/`)
  - Acceptance: `services/recordService.ts`, `services/userService.ts`, `services/tengkulakService.ts` mengenkapsulasi seluruh fetch logic dengan type-safe handling.
  - Verify: Test HTTP calls menggunakan service functions.
  - Files: `services/recordService.ts`, `services/userService.ts`, `services/tengkulakService.ts`

- [x] Task 3: Create Reusable UI Components (`components/ui/` & `components/layout/`)
  - Acceptance: `Modal.tsx`, `ConfirmModal.tsx`, `SuccessModal.tsx`, `Badge.tsx`, `PageHeader.tsx` dibuat dengan accessibility dan styling konsisten.
  - Verify: Komponen me-render modal dialog & badge dengan benar.
  - Files: `components/ui/Modal.tsx`, `components/ui/ConfirmModal.tsx`, `components/ui/SuccessModal.tsx`, `components/ui/Badge.tsx`

- [x] Task 4: Modularize Feature Components (`components/features/`)
  - Acceptance: Komponen Records (`RecordForm`, `RecordTable`, `EditRecordModal`, `DusunFilterBar`), Users (`UserForm`, `UserTable`, `EditUserModal`), dan Tengkulak (`TengkulakDashboard`, `TengkulakDirectorySection`) terisolasi rapi.
  - Verify: Komponen dapat di-mount dan dites secara independen.
  - Files: `components/features/records/*`, `components/features/users/*`, `components/features/tengkulak/*`

- [x] Task 5: Refactor Dashboard & Eliminate Duplicate Routes
  - Acceptance: `app/detail/page.tsx` menjadi orchestrator bersih (< 380 baris). `app/admin/input/page.tsx` mengeliminasi duplikasi 1.599 baris dengan me-redirect atau re-export.
  - Verify: Mengunjungi `/detail` dan `/admin/input` berfungsi identik dan sempurna.
  - Files: `app/detail/page.tsx`, `app/admin/input/page.tsx`, `app/tengkulak/page.tsx`

- [x] Task 6: Final Verification & Type Safety Check
  - Acceptance: `npm test` lulus 100% (20/20 test cases), `npm run build` sukses tanpa warning atau error.
  - Verify: `npm test && npm run build`.

