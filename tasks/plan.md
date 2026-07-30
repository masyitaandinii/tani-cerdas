# Technical Implementation Plan

1. **Setup & Dependencies**
   - Install backend dependencies (`mongoose`, `next-auth`, `bcrypt`, `zod`).
   - Install test dependencies (`vitest`, `@types/bcrypt`, dll).
   - Configure Vitest for TDD.

2. **Slice 1: Database & Data Models**
   - Buat MongoDB Connection Utility (`lib/db.ts`).
   - Buat Mongoose Schema untuk `User` dan `TengkulakRecord`.
   - Buat skrip Seeder (`scripts/seed.ts`) untuk inisialisasi Superadmin dan Admin.
   - *Test:* Unit test memvalidasi struktur Mongoose Schema (menggunakan in-memory atau mock db).

3. **Slice 2: Auth & RBAC Middleware**
   - Setup konfigurasi NextAuth (`app/api/auth/[...nextauth]/route.ts`).
   - Gunakan CredentialsProvider, komparasi bcrypt, dan injeksi callback `jwt` & `session`.
   - *Test:* Unit test memanggil logic credentials authorization.

4. **Slice 3: Endpoint Records (`/api/records`)**
   - Implementasi GET (Public) dengan stripping field `nama` dan penghapusan `authorId` jika session tidak ada/role public.
   - Implementasi POST (Admin/Superadmin) dengan Zod validation dan override `dusun`.
   - *Test:* Unit test menggunakan request/response mock memastikan stripping data berjalan, override role berhasil, dan schema tertolak jika invalid.

5. **Slice 4: Endpoint Chatbot (`/api/chat`)**
   - Implementasi Pre-validation Guard dengan Keyword check.
   - Integrasi ke LLM API (dummy atau Google Gemini) jika lolos guard.
   - *Test:* Unit test memvalidasi jika input "cara merakit PC" otomatis gagal tanpa error, dan input "harga gabah" berhasil lolos guard.
