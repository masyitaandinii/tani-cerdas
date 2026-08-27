# Implementation Plan: Bapanas Price Benchmarks, Tengkulak Input Simplification, & Profile Management

## Overview
Implementasi 3 pilar fitur baru sesuai permintaan:
1. Penggunaan data acuan rata-rata Bapanas (Badan Pangan Nasional) untuk Beras & Gabah dengan kemampuan update oleh Admin/Superadmin yang tersimpan di database.
2. Restriksi input Tengkulak: hanya memasukkan harga beras dan gabah (total panen hanya diinput oleh Admin/Superadmin).
3. Fitur Edit Profil mandiri untuk Admin, Tengkulak, dan Superadmin.

---

## Phase 1: Database Model, Types & API Services
1. **Types (`types/benchmark.ts` & `types/index.ts`):**
   - Buat kontrak interface untuk `PriceBenchmark`, `UpdateBenchmarkPayload`.
2. **Model (`app/lib/models/PriceBenchmark.ts`):**
   - Buat Mongoose Schema `PriceBenchmark` untuk menyimpan acuan harga Bapanas terkini dengan default fallback ke `GOVERNMENT_PRICE_BENCHMARKS`.
3. **Model Update (`app/lib/models/TengkulakRecord.ts`):**
   - Ubah `totalPanen` menjadi opsional dengan default `0` agar submit dari Tengkulak valid.
4. **Service Layer (`services/benchmarkService.ts`):**
   - `fetchBenchmarkPrices()` dan `updateBenchmarkPrices(payload)`.
   - Update `services/userService.ts` untuk mendukung `updateProfile()`.
   - Update `services/recordService.ts` untuk mendukung PUT/PATCH secara konsisten.

---

## Phase 2: Backend API Routes
1. **API Benchmarks (`app/api/benchmarks/route.ts`):**
   - `GET`: Mengambil acuan harga Bapanas (publik/semua user).
   - `PUT`: Memperbarui acuan harga Bapanas (Superadmin & Admin).
2. **API Records (`app/api/records/route.ts` & `app/api/records/[id]/route.ts`):**
   - Sesuaikan `RecordSchema` agar `totalPanen` opsional.
   - Paksa `totalPanen = 0` bila request datang dari role `tengkulak`.
   - Dukung `PATCH` dan `PUT` di `[id]/route.ts`.
3. **API Users Profile (`app/api/users/[id]/route.ts`):**
   - Izinkan user mengedit profil miliknya sendiri (`session.user.id === id`).
   - Hash password baru jika diisi.
   - Proteksi field sensitif (`role`, `assignedDusun`).

---

## Phase 3: Frontend UI Components
1. **Edit Profile Modal (`components/features/users/EditProfileModal.tsx`):**
   - Modal form untuk edit Nama Lengkap, WhatsApp, Password baru.
2. **Benchmark Price Manager (`components/features/benchmarks/BenchmarkPriceManager.tsx`):**
   - Form card/modal untuk Admin & Superadmin mengupdate nilai acuan rata-rata Bapanas (Beras & Gabah).
3. **Tengkulak Portal (`components/features/tengkulak/TengkulakDashboard.tsx`):**
   - Hapus field `totalPanen` dari form input Tengkulak.
   - Tambahkan tombol "Edit Profil".
   - Perbarui tampilan statistik khusus Tengkulak.
4. **Header & Admin Detail Page (`components/layout/PageHeader.tsx` & `app/detail/page.tsx`):**
   - Tambahkan tombol "Edit Profil" di PageHeader.
   - Tambahkan tab/section "Acuan Bapanas" di dashboard Admin/Superadmin.
5. **Landing Page Statistics (`app/components/StatsCards.tsx`):**
   - Tampilkan harga rata-rata acuan Bapanas secara dinamis dari API benchmarks.

---

## Phase 4: Unit Testing & Verification
1. Buat unit test `tests/benchmarks.test.ts` untuk menguji GET & PUT API acuan harga Bapanas.
2. Perbarui `tests/records.test.ts` untuk memastikan Tengkulak bisa input tanpa `totalPanen`.
3. Perbarui `tests/models.test.ts` untuk validasi `PriceBenchmark`.
4. Jalankan `npm test` dan `npm run build` untuk memverifikasi zero regression.
