# Spec: Pembaruan Sistem Harga Bapanas, Pembagian Akses Input Panen, & Fitur Edit Profil

## 1. Objective
Memperbarui sistem **TaniCerdas** berdasarkan kebutuhan operasional pertanian desa:
1. **Data Harga Rata-rata Bapanas & Pembaruan oleh Admin/Superadmin:**
   - Menampilkan harga rata-rata acuan dan batas HET/HPP dari **Badan Pangan Nasional (Bapanas)** pada kartu statistik dan ringkasan harga.
   - Menyediakan fitur di mana **Admin Dusun** dan **Superadmin** dapat melakukan pembaruan (*update*) nilai acuan harga rata-rata Bapanas secara dinamis melalui antarmuka dashboard, tersimpan di database MongoDB dengan fallback ke nilai default standar.
2. **Restriksi Input Tengkulak & Pencatatan Total Panen:**
   - Mitra **Tengkulak hanya menginput harga beras dan harga gabah** (serta kuartal/periode berjalan).
   - Field **Total Panen (Kg)** dihilangkan dari form input Tengkulak.
   - Volume **Total Panen** hanya dicatat dan dikelola oleh **Admin Dusun** dan **Superadmin**.
3. **Fitur Edit Profil untuk Admin dan Tengkulak:**
   - Memberikan hak akses kepada **Admin** dan **Tengkulak** (serta Superadmin) untuk mengedit profil mereka sendiri (Nama Lengkap, Nomor WhatsApp, dan Password akun).
   - Menyediakan antarmuka modal edit profil (*Edit Profile Modal*) yang mudah diakses dari header dashboard maupun portal tengkulak.

---

## 2. Tech Stack & Dependencies
- **Framework:** Next.js 16.2 (App Router, Turbopack, React 19)
- **Language:** TypeScript (Strict Mode)
- **Database & ORM:** MongoDB + Mongoose
- **Auth:** NextAuth.js (Session & JWT Strategy)
- **Icons & Styling:** Lucide React & Tailwind CSS v4
- **Testing:** Vitest

---

## 3. Architecture & Data Flow

### A. Model Acuan Harga Bapanas (`PriceBenchmark`)
```typescript
export interface IPriceBenchmark {
    beras: {
        min: number;     // HET Min (Rp/kg)
        max: number;     // HET Max (Rp/kg)
        target: number;  // Rata-rata / Harga Acuan Bapanas (Rp/kg)
        label: string;
        description: string;
        unit: string;
    };
    gabah: {
        min: number;     // HPP Min (Rp/kg)
        max: number;     // HPP Max (Rp/kg)
        target: number;  // Rata-rata / Harga Acuan Bapanas (Rp/kg)
        label: string;
        description: string;
        unit: string;
    };
    updatedBy?: string;
    updatedAt: Date;
}
```

### B. Hak Akses & Role-Based Access Control (RBAC)

| Aksi / Fitur | Superadmin | Admin Dusun | Tengkulak | Publik (Unauthenticated) |
|---|---|---|---|---|
| Lihat Harga Rata-rata Bapanas | ✅ | ✅ | ✅ | ✅ |
| Update Acuan Harga Bapanas | ✅ | ✅ | ❌ | ❌ |
| Input Harga Beras & Gabah | ✅ | ✅ | ✅ | ❌ |
| Input / Edit Total Panen Desa | ✅ | ✅ | ❌ | ❌ |
| Edit Profil Pribadi (Nama, WA, Pass) | ✅ | ✅ | ✅ | ❌ |
| Manajemen Akun Pengguna Lain | ✅ | ✅ (Khusus Tengkulak dusunnya) | ❌ | ❌ |

---

## 4. API Endpoints Contract

1. **`GET /api/benchmarks`**
   - Mengambil data acuan harga Bapanas terkini (publik).
2. **`PUT /api/benchmarks`**
   - Memperbarui data acuan harga Bapanas (Auth required: `admin` | `superadmin`).
3. **`POST /api/records`**
   - Tengkulak: `totalPanen` otomatis diset ke `0` / diabaikan.
   - Admin/Superadmin: menerima `totalPanen` (opsional atau angka valid).
4. **`PATCH /api/users/[id]`**
   - User mana pun dapat mengupdate profil mereka sendiri (`session.user.id === id`).
   - Admin dapat mengupdate profil tengkulak di dusunnya.
   - Superadmin dapat mengupdate semua akun.

---

## 5. UI/UX Changes

1. **`StatsCards.tsx` (Beranda):**
   - Menampilkan Harga Rata-rata Beras & Gabah berdasarkan data acuan Bapanas terkini dengan badge Bapanas resmi.
   - Tetap menampilkan total akumulasi hasil panen desa tahun berjalan.
2. **`TengkulakDashboard.tsx` (Portal Tengkulak):**
   - Form input disederhanakan: HANYA Harga Beras (Rp/kg), Harga Gabah (Rp/kg), dan Periode.
   - Ringkasan berfokus pada aktivitas setoran harga dan riwayat harga tengkulak.
   - Tombol "Edit Profil" tersedia di bagian atas profil.
3. **`RecordForm.tsx` & `EditRecordModal.tsx` (Admin / Superadmin):**
   - Tetap memiliki input `Total Panen (Kg)` untuk pencatatan hasil panen desa/dusun.
4. **`PageHeader.tsx` & `EditProfileModal.tsx`:**
   - Tombol "Edit Profil" untuk Admin / Superadmin.
   - Modal input: Nama Lengkap, Nomor WhatsApp, dan Password Baru (opsional).
5. **`BenchmarkPriceManager.tsx` (Dashboard Admin / Superadmin):**
   - Komponen / Tab Pengaturan Harga Bapanas untuk Admin & Superadmin agar dapat mengubah rata-rata harga beras, HET beras, rata-rata harga gabah, dan HPP gabah secara langsung.

---

## 6. Boundaries
- **Always:**
  - Jaga agar semua test Vitest lulus (20+ tests) dan tambahkan unit test untuk benchmark prices & edit profile.
  - Jalankan `npm run build` setelah setiap perubahan.
  - Cegah perubahan `role` atau `assignedDusun` saat user biasa mengedit profilnya sendiri.
- **Ask First:**
  - Menghapus kolom database yang telah ada.
- **Never:**
  - Mengizinkan Tengkulak menginput atau mengubah `totalPanen`.
  - Mengizinkan user yang tidak login mengubah data acuan Bapanas.

---

## 7. Success Criteria
1. Pengunjung melihat harga rata-rata beras & gabah mengacu pada data Bapanas.
2. Admin / Superadmin dapat mengubah data acuan harga Bapanas dari dashboard dan perubahan langsung tersimpan ke MongoDB serta tampil di beranda.
3. Form Tengkulak bersih tanpa input `totalPanen`, dan data harga tetap tersimpan sempurna.
4. Admin dan Tengkulak dapat memperbarui nama, nomor WhatsApp, dan password mereka melalui modal Edit Profil.
5. Seluruh unit tests lulus 100% dan Next.js build sukses.
