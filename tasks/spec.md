# Spec: Backend Tani Cerdas (Next.js API + MongoDB)

## Objective
Mengintegrasikan backend API ke dalam codebase Next.js App Router yang sudah ada untuk aplikasi Pojok Tani.
Fitur mencakup:
1. Otentikasi Role-Based Access Control (RBAC)
2. Input data harga gabah/beras per Dusun (dibatasi per admin dusun)
3. Endpoint data untuk dashboard (menyediakan data mentah yang diolah oleh komponen UI *existing*)
4. Chatbot AI dengan batasan konteks pertanian.

**Non-Goals (Di luar scope versi ini):**
- **User Management API:** Pembuatan dan modifikasi entitas `User` tidak diekspos melalui API (tidak ada `POST /api/users`). Pengelolaan akun Superadmin/Admin saat ini murni dilakukan secara manual melalui eksekusi skrip *seeder*.
- **Edit/Delete Records (Append-Only):** Tidak disediakan endpoint `PUT/DELETE /api/records/[id]`. Sistem API desainnya adalah *append-only log* guna menjaga integritas *audit trail* data historis (menjamin harga gabah/beras lampau tidak dapat diubah sepihak). Jika terjadi kesalahan, admin wajib memasukkan rekaman input baru.

## Pendekatan Teknis (Trade-offs)
- **Auth (NextAuth.js dengan Credentials Provider):** 
  - *Alasan:* NextAuth adalah standar de-facto untuk Next.js. Menggunakan custom Credentials Provider dan JWT session sangat cocok untuk API serverless Next.js, dan tidak memerlukan manajemen session tersendiri di sisi client.
- **Kalkulasi Data (Dashboard):**
  - *Alasan:* Berdasarkan struktur komponen frontend existing (`DashboardCharts.tsx` dan `DusunDistributionCard.tsx`), UI menerima data secara mentah (`TengkulakRecord[]`) dan melakukan agregasi secara mandiri di sisi *client* (menggunakan `useMemo`). Oleh karena itu, backend menggunakan pendekatan **On-Read** (langsung melakukan query semua record) melalui endpoint `GET /api/records`. Data tidak seagregat yang dikira sebelumnya (karena frontend existing bergantung pada array objek mentah tersebut), tetapi query On-Read biasa ke MongoDB cukup cepat. 
- **Pembatasan Chatbot (Pre-validation Guard):**
  - *Alasan:* Memilih **Pre-validation Guard** secara eksplisit. Backend akan mengecek string query menggunakan daftar keyword (*exact initial list*: `["beras", "gabah", "padi", "panen", "tani", "petani", "tengkulak", "pupuk", "hama", "cuaca", "harga", "jual", "beli", "sawah", "pertanian", "irigasi"]`). Jika input tidak mengandung satupun kata kunci tersebut, backend akan me-return pesan penolakan (mis: *"Maaf, TaniBot hanya bisa menjawab seputar harga dan pertanian."*) **tanpa perlu memanggil LLM API**. Hal ini jauh lebih hemat biaya/API quota dan mencegah celah jailbreak prompt.

## Tech Stack
- Framework: Next.js (App Router / Route Handlers)
- Database: MongoDB + Mongoose (memudahkan schema & instance methods)
- Validation: Zod (Validasi *request body* sebelum masuk ke eksekusi Mongoose)
- Security: bcrypt (Hashing password user)
- Auth: NextAuth.js (Auth.js) dengan JWT

## Commands
```bash
Install dependencies: npm install mongoose next-auth bcrypt zod
Dev: npm run dev
Test: npm test
```

## Project Structure
```text
src/
  app/
    api/
      auth/[...nextauth]/route.ts  # Endpoint auth
      records/route.ts             # Get all records & Create record
      chat/route.ts                # AI chatbot (Pre-validation + LLM call)
  lib/
    db.ts                          # MongoDB connection
    models/
      User.ts                      # User schema
      TengkulakRecord.ts           # Record schema
```

## Data Model (Mongoose)

**User Model:**
- username (String, unique)
- password (String, hashed by bcrypt)
- name (String)
- role (Enum: 'superadmin', 'admin', 'user')
- assignedDusun (Number: 1, 2, 3, 4) -> (Required jika role 'admin')

**TengkulakRecord Model:**
Berdasarkan `app/lib/data.ts` existing (baris ke-3 sampai ke-12):
```typescript
export interface TengkulakRecord {
    id: string;
    nama: string;
    dusun: number; // 1, 2, 3, or 4
    hargaBeras: number;
    hargaGabah: number;
    kuartal: Kuartal; // "Q1" | "Q2" | "Q3" | "Q4"
    timestamp: string;
    totalPanen: number; // (Dari sini field totalPanen berasal)
}
```
Field pada schema Mongoose:
- nama (String)
- dusun (Number: 1, 2, 3, 4) -> (Menggunakan Number 1-4 sesuai dengan frontend `lib/data.ts`)
- hargaBeras (Number)
- hargaGabah (Number)
- kuartal (String, enum: 'Q1', 'Q2', 'Q3', 'Q4')
- timestamp (Date)
- totalPanen (Number)
- authorId (ObjectId -> ref User)

## Endpoints & RBAC

1. `POST /api/auth/signin` (NextAuth) -> Public
2. `GET /api/records` -> **All Roles (Termasuk Pengguna Publik)** (Menggunakan **Opsi A**).
   - *Logic Akses:* Tetap 1 endpoint. Namun jika *request* datang dari unauthenticated user atau role 'user' (publik), response akan secara dinamis **men-strip field `nama` dan menghapus `authorId`**. Field `nama` akan di-mask/disamarkan menjadi string seperti `"Anonim"` agar grafik di `DashboardCharts.tsx` level Dusun tetap berjalan lancar tanpa mengekspos data pribadi tengkulak. Admin dan Superadmin akan mendapatkan data *full object*.
3. `POST /api/records` -> **Superadmin, Admin Dusun**. 
   - Validasi Role `admin`: Akan memaksa (override) field `dusun` pada *request body* dengan nilai `session.user.assignedDusun` sebelum simpan. Menghindari celah injeksi via API.
   - Validasi Role `superadmin`: Bebas mengirimkan payload `dusun` (1, 2, 3, atau 4).
   - *Validasi Request Body:* Menggunakan `zod` untuk memvalidasi tipe/shape data.
4. `POST /api/chat` -> All Roles
   - Pre-validation menggunakan cek keyword sebelum `fetch` ke LLM API.

## Boundaries
- **Selalu lakukan:** 
  - Gunakan **zod** untuk memvalidasi body JSON masuk dari `Request` sebelum diserahkan ke *controller* Mongoose.
  - Hashing raw password menggunakan **bcrypt** setiap kali membuat seed / create User baru.
  - **Secara eksplisit lakukan mapping `role` dan `assignedDusun`** dari record *User* (di database) ke *token* melalui NextAuth `callbacks.jwt()`, dan turunkan dari *token* ke *session* melalui `callbacks.session()`. Endpoint RBAC akan lumpuh (karena `undefined`) jika mapping callback ini dilewatkan.
  - Validasi token JWT & role `session.user` di *server-side* menggunakan fungsi helper NextAuth (seperti `getServerSession`).
  - Override payload `dusun` (untuk role `admin`) pada method `POST /api/records`.
- **Jangan pernah:** 
  - Mengekspose `API_KEY` Gemini atau kredensial `MONGODB_URI` ke *client*.
  - Mengubah tipe `dusun` menjadi String (A/B/C/D), karena di frontend existing sudah terlanjur di-set sebagai *Number* (1/2/3/4).

## Success Criteria
- [ ] Admin 1 bisa input data (Otomatis tercatat sebagai dusun 1, tidak bisa meng-inject data menjadi dusun 2).
- [ ] Superadmin bisa input data untuk dusun manapun.
- [ ] Dashboard menampilkan data dengan benar karena fetch ke `GET /api/records` berhasil dieksekusi read-only oleh non-authenticated public user.
- [ ] **Validasi Opsi A (Publik)**: Request `GET /api/records` tanpa token/sesi yang valid memverifikasi kembalian field `nama: "Anonim"` dan `authorId` dipotong (undefined/hilang).
- [ ] **Validasi Opsi A (Admin/Superadmin)**: Request `GET /api/records` dengan token JWT (login) sukses mengembalikan *full object* lengkap dengan `nama` asli tengkulak dan `authorId`.
- [ ] **Validasi Sesi / NextAuth**: Objek `session.user` pada request terautentikasi memuat properti `role` dan `assignedDusun` dengan benar sesuai database, bukan `undefined`.
- [ ] Zod menolak *request body* bila `hargaBeras` dimasukkan tipe data String.
- [ ] Chatbot menolak request "Cara merakit PC" di level *Pre-validation Guard* (API tidak sampai memanggil LLM).

## Open Questions
- Daftar awal *keyword* untuk Chatbot Guard mungkin perlu di-*tuning* kembali cakupannya nanti selama masa *beta testing*.
- (Disetujui): Membuat script *seeder* (`scripts/seed.ts`) terpisah dengan *bcrypt hashing* untuk mem-populate awal database dengan *mock data*.
