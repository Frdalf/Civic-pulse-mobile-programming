# Civic Pulse

Aplikasi pelaporan infrastruktur kota rusak & peringatan dini bencana berbasis komunitas
(SDG 11 — Sustainable Cities). Tugas Besar Pemrograman Mobile, Informatika UMM.

## Tech stack
React Native + Expo SDK 58 (TypeScript strict) · Expo Router · Zustand · RxJS ·
react-native-maps · Supabase · Jest. Detail lengkap: [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md).

## Menjalankan
```bash
npm install
cp .env.example .env   # isi EXPO_PUBLIC_SUPABASE_URL & EXPO_PUBLIC_SUPABASE_ANON_KEY
npx expo start         # scan QR dengan Expo Go / development build
```
App tetap jalan dengan data dummy jika `.env` belum diisi.

## Skrip
| Perintah | Fungsi |
|---|---|
| `npm run typecheck` | Cek TypeScript |
| `npm run lint` | ESLint (eslint-config-expo) |
| `npm run format` | Prettier |
| `npm test` | Jest |

## Struktur folder
```
app/            Screen Expo Router (tipis: UI + panggil hook)
src/components  Komponen UI (ui/, map/)
src/hooks       Custom hooks (logika & side effect + cleanup)
src/store       Zustand stores (UDF, immutable)
src/services    Supabase, secure storage, file vault, kamera
src/utils       Fungsi murni (wajib dites)
src/types       Type global (kontrak §5.1)
src/constants   Warna, kategori, konfigurasi, data dummy
__tests__       Test
docs            Skema SQL, audit checklist, bukti prompt
```

## Supabase
Jalankan di SQL Editor proyek Supabase, berurutan:
1. [docs/supabase-schema.sql](docs/supabase-schema.sql) — tabel, RLS, realtime, bucket.
2. [docs/supabase-seed-zones.sql](docs/supabase-seed-zones.sql) — 5 zona rawan bencana Malang.

## Git
Branch `main` (stabil), `dev` (integrasi), fitur `feat/o1-*` / `feat/o2-*`.
Commit memakai Conventional Commits; merge ke `dev` lewat Pull Request.
