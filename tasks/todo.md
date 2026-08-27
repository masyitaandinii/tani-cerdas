- [x] Task 1: Create PriceBenchmark Model & Benchmark Types
  - Acceptance: Schema `PriceBenchmark` dan TypeScript types untuk acuan harga Bapanas terdefinisi lengkap.
  - Verify: Types dan model dapat diimpor tanpa TypeScript error.
  - Files: `types/benchmark.ts`, `types/index.ts`, `app/lib/models/PriceBenchmark.ts`

- [x] Task 2: Implement Benchmark API & Services
  - Acceptance: Endpoint `GET /api/benchmarks` dan `PUT /api/benchmarks` berfungsi, service layer `benchmarkService.ts` siap.
  - Verify: Unit test API benchmark berhasil memverifikasi GET & PUT dengan RBAC.
  - Files: `app/api/benchmarks/route.ts`, `services/benchmarkService.ts`, `services/index.ts`

- [x] Task 3: Adjust Records API & Models for Tengkulak Restrictions
  - Acceptance: Tengkulak tidak lagi mengirim `totalPanen` (default 0), admin/superadmin tetap dapat menginput `totalPanen`.
  - Verify: `tests/records.test.ts` berhasil menguji POST oleh Tengkulak tanpa totalPanen.
  - Files: `app/lib/models/TengkulakRecord.ts`, `app/api/records/route.ts`, `app/api/records/[id]/route.ts`

- [x] Task 4: Enable Profile Editing in API & Services
  - Acceptance: Endpoint `PATCH /api/users/[id]` mengizinkan authenticated user (admin & tengkulak) mengedit profil miliknya.
  - Verify: Test update profil (nama, whatsapp, password) berfungsi.
  - Files: `app/api/users/[id]/route.ts`, `services/userService.ts`

- [x] Task 5: Build UI Components (EditProfileModal, BenchmarkPriceManager, TengkulakDashboard update)
  - Acceptance: Modal edit profil dapat dibuka oleh Admin & Tengkulak, form input Tengkulak hanya berisi beras & gabah, form update acuan Bapanas tersedia untuk Admin/Superadmin.
  - Files: `components/features/users/EditProfileModal.tsx`, `components/features/benchmarks/BenchmarkPriceManager.tsx`, `components/features/tengkulak/TengkulakDashboard.tsx`, `components/layout/PageHeader.tsx`

- [x] Task 6: Integrate with Detail Dashboard & Landing Page StatsCards
  - Acceptance: `app/detail/page.tsx` memiliki tab/pengaturan Bapanas, `app/components/StatsCards.tsx` menampilkan harga rata-rata Bapanas dinamis.
  - Files: `app/detail/page.tsx`, `app/components/StatsCards.tsx`

- [x] Task 7: Comprehensive Unit Testing & Production Build
  - Acceptance: Semua unit test di `tests/` (31 tests) lulus 100%, `npm run build` sukses tanpa error tipe atau compile.
  - Verify: `npm test && npm run build`.
