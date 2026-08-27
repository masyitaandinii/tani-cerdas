# Implementation Plan: Industrial-Standard Project Restructuring

## Phase 1: Centralized Types & Service Layer
1. Buat folder `types/`:
   - `types/record.ts`: Type definition untuk data panen, kuartal, dan payload form.
   - `types/user.ts`: Type definition untuk akun, peran (`UserRole`), session, dan form pengguna.
   - `types/api.ts`: Kontrak response API envelope.
   - `types/index.ts`: Barrel export untuk memudahkan import (`@/types`).
2. Buat folder `services/`:
   - `services/recordService.ts`: Abstraksi fetch/create/update/delete untuk records.
   - `services/userService.ts`: Abstraksi fetch/create/update/delete untuk users.
   - `services/tengkulakService.ts`: Abstraksi fetch data tengkulak publik.

## Phase 2: Generic Reusable UI Components
1. Buat folder `components/ui/`:
   - `components/ui/Modal.tsx`: Base modal dialog wrapper (ESC handling, backdrop blur, animation).
   - `components/ui/ConfirmModal.tsx`: Dialog konfirmasi aksi (hapus record/user).
   - `components/ui/SuccessModal.tsx`: Dialog feedback sukses seragam.
   - `components/ui/Badge.tsx`: Badge visual untuk peran, status kuartal, dan warning pemerintah.
2. Buat `components/layout/`:
   - `components/layout/Navbar.tsx` & `PageHeader.tsx`.

## Phase 3: Domain-Driven Feature Modularization
1. Feature Records (`components/features/records/`):
   - `RecordForm.tsx`: Form input data panen + auto-suggest nama mitra.
   - `RecordTable.tsx`: Tabel data panen responsive + aksi edit/hapus.
   - `EditRecordModal.tsx`: Modal edit data panen.
   - `DusunFilterBar.tsx`: Filter tab dusun untuk superadmin/admin.
2. Feature Users (`components/features/users/`):
   - `UserForm.tsx`: Form registrasi akun pengguna (terisolasi superadmin vs admin dusun).
   - `UserTable.tsx`: Tabel daftar pengguna + nomor WhatsApp + aksi edit/hapus.
   - `EditUserModal.tsx`: Modal edit akun pengguna & nomor WhatsApp.
3. Feature Tengkulak (`components/features/tengkulak/`):
   - `TengkulakDashboard.tsx`: Panel view khusus peran tengkulak (ringkasan setoran, chart kuartal, & self-input).
   - `TengkulakDirectorySection.tsx`: Komponen landing page direktori tengkulak.
4. Feature Complaints & Home (`components/features/complaints/`, `components/features/home/`):
   - Migrasi dan modularisasi komponen beranda.

## Phase 4: Clean Page Orchestration & Route De-duplication
1. Refactor `app/detail/page.tsx` menjadi halaman ramping (~150-200 baris) yang hanya mengorkestrasi state & sub-komponen feature.
2. Selesaikan duplikasi di `app/admin/input/page.tsx` dengan re-exporting `InputDataPage` dari `@/app/detail/page` atau `redirect('/detail')`.
3. Refactor `app/tengkulak/page.tsx` & `app/page.tsx`.

## Phase 5: Verification & Quality Assurance
1. Jalankan unit test `npm test` (memastikan 20/20 test cases lulus).
2. Jalankan `npm run build` (memastikan Next.js compile & Turbopack 100% lulus tanpa type error).
3. Verifikasi runtime API dan alur navigasi.
