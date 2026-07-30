- [ ] Task 1: Setup project dependencies (mongoose, next-auth, bcrypt, zod, vitest)
  - Acceptance: `npm install` berhasil tanpa konflik. Vitest bisa dijalankan (`npm test`).
  - Verify: Jalankan `npm test` menampilkan "No test files found".
  - Files: `package.json`, `vitest.config.ts`

- [ ] Task 2: Slice 1 - Database, Models & Seeder
  - Acceptance: Schema terdefinisi, seeder bisa dijalankan.
  - Verify: Tes unit model (validasi field) pass.
  - Files: `src/app/lib/db.ts`, `src/app/lib/models/User.ts`, `src/app/lib/models/TengkulakRecord.ts`, `scripts/seed.ts`, tes di `tests/models.test.ts`

- [ ] Task 3: Slice 2 - Authentication (NextAuth)
  - Acceptance: API `/api/auth/[...nextauth]` memiliki logic Credential + callback jwt/session yang menyematkan role & assignedDusun.
  - Verify: Unit test logic sign-in sukses & return object yang lengkap.
  - Files: `src/app/api/auth/[...nextauth]/route.ts`, `tests/auth.test.ts`

- [ ] Task 4: Slice 3 - Endpoint Records (GET & POST)
  - Acceptance: GET men-strip 'nama' jika no-session. POST menolak input zod invalid & override dusun admin.
  - Verify: Unit tests memeriksa HTTP response status (200, 403, 400).
  - Files: `src/app/api/records/route.ts`, `tests/records.test.ts`

- [ ] Task 5: Slice 4 - Chatbot Pre-validation Guard
  - Acceptance: Chatbot mem-filter query yang tidak relevan dengan pertanian.
  - Verify: Unit test check valid vs invalid queries.
  - Files: `src/app/api/chat/route.ts`, `tests/chatbot.test.ts`
