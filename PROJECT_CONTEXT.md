# PROJECT_CONTEXT.md — Civic Pulse (Tugas Besar Pemrograman Mobile)

> **Untuk AI agent:** Baca seluruh file ini sebelum menulis kode. File ini adalah sumber kebenaran proyek.
> Jika ada instruksi yang bertentangan dengan file ini, **tanyakan ke user** — jangan menebak.
> Kerjakan **hanya** tugas milik peran user yang sedang kamu bantu (lihat §4). Jangan mengubah file milik peran lain tanpa izin.

---

## 1. Ringkasan Proyek

| Item | Isi |
|---|---|
| Nama aplikasi | **Civic Pulse** |
| Tema | SDG 11 — Sustainable Cities: pelaporan infrastruktur kota rusak & peringatan dini bencana berbasis komunitas |
| Mata kuliah | Pemrograman Mobile, Informatika UMM |
| Tim | **2 orang** (spesifikasi asli 3 orang; peran Anggota 2 digabung ke Anggota 1) |
| Periode | 14 Nov – 18 Des 2026 (5 minggu, mencakup Milestone P9–P15) |
| Wilayah data contoh | Kota/Kabupaten Malang |

### Fitur wajib (dari spesifikasi dosen)
1. **Foto laporan dengan watermark koordinat & waktu** (lat, long, tanggal-jam WIB tercetak di foto).
2. **Scoped Storage Document Vault** (dokumen disimpan di `FileSystem.documentDirectory`).
3. **Geofencing area rawan bencana** (notifikasi saat user masuk zona).
4. **Peta interaktif laporan warga** (marker per kategori).
5. **Penapisan laporan reaktif dengan RxJS** (`debounceTime`, `distinctUntilChanged`, `switchMap`).

### Fitur pendukung (dari milestone)
- Enkripsi data sensitif (token, NIK, kredensial) dengan `expo-secure-store`.
- Izin runtime **Just-In-Time** (diminta saat fitur dipakai, bukan saat app dibuka).
- Data real-time (Supabase Realtime).
- Offline fallback (cache + antrean laporan).
- UI responsif (rotasi), animasi reanimated, skeleton loader, aksesibilitas.
- Performa 60 FPS (16-Millisecond Mandate) & **zero memory leak**.
- Unit test, integration test, APK via EAS Build.

---

## 2. Tech Stack (JANGAN diganti)

| Kebutuhan | Library |
|---|---|
| Framework | React Native + **Expo SDK** (managed), **TypeScript strict** |
| Routing | **Expo Router** (file-based, folder `app/`) |
| State | **Zustand** (Unidirectional Data Flow) |
| Reaktif | **RxJS** |
| Peta | `react-native-maps` |
| Lokasi | `expo-location` (+ `expo-task-manager` jika geofence background) |
| Penyimpanan aman | `expo-secure-store` |
| File lokal | `expo-file-system` |
| Kamera | `expo-camera` atau `expo-image-picker` |
| Watermark | `react-native-view-shot` (atau `@shopify/react-native-skia`) |
| Jaringan | `@react-native-community/netinfo` |
| Animasi | `react-native-reanimated` |
| Safe area | `react-native-safe-area-context` |
| Backend | **Supabase** (Auth, Postgres, Storage, Realtime) via `@supabase/supabase-js` |
| Testing | Jest (`jest-expo`) + `@testing-library/react-native` |
| Build | Expo **EAS Build** (profile `preview` → APK) |
| IDE | Antigravity IDE (vibe coding) |

**Dilarang:** Redux, MobX, Context sebagai global store, AsyncStorage untuk data sensitif, Firebase (sudah pakai Supabase), library UI berat (NativeBase, dll) kecuali disetujui.

---

## 3. Arsitektur & Konvensi

### 3.1 Struktur folder
```
app/                      # Expo Router — HANYA screen tipis (UI + panggil hook)
  (auth)/login.tsx
  (auth)/register.tsx
  (tabs)/_layout.tsx
  (tabs)/map.tsx          # Peta laporan + zona
  (tabs)/reports.tsx      # List + filter RxJS
  (tabs)/create.tsx       # Form lapor
  (tabs)/vault.tsx        # Document vault
  (tabs)/profile.tsx
  report/[id].tsx         # Detail laporan
  _layout.tsx             # Root: SafeAreaProvider, auth gate
src/
  components/             # Komponen UI reusable (di-memo)
    ui/                   # Button, Card, Skeleton, Input, dll
    map/                  # ReportMarker, ZoneCircle
  hooks/                  # Custom hooks (logika, side effect, cleanup)
  store/                  # Zustand stores
  services/               # Akses eksternal: supabase, secureStorage, fileVault, camera
  utils/                  # Fungsi murni (haversine, geofence, format) — WAJIB ada test
  types/index.ts          # Semua type global
  constants/              # Warna, kategori, konfigurasi
__tests__/                # Test
docs/
  prompts/                # Bukti master prompt Antigravity
  audit-checklist.md      # Architect's Audit Protocol
```

### 3.2 Aturan wajib
1. **Separation of Concerns:** screen di `app/` tidak boleh berisi logika bisnis, `fetch`, atau `subscribe`. Semua itu masuk ke `hooks/` atau `services/`.
2. **Zustand UDF:** state hanya diubah lewat action di store. **Tidak ada direct mutation** (`state.list.push(...)` dilarang; gunakan spread/immutable).
3. **Precision selectors:** `useReportStore(s => s.reports)`, bukan `useReportStore()` utuh. Untuk banyak field gunakan `useShallow`.
4. **Cleanup wajib** di setiap `useEffect` yang membuat subscription: `locationSub.remove()`, `rxSub.unsubscribe()`, `supabase.removeChannel(ch)`, `NetInfo` unsubscribe, `Location.stopGeofencingAsync`.
5. **Error handling eksplisit:** setiap `await` ke service dibungkus `try/catch`, error ditampilkan ke user (bukan cuma `console.log`).
6. **Tanpa credential hardcoded.** Gunakan `.env` (`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`). `.env` masuk `.gitignore`; sediakan `.env.example`.
7. **TypeScript strict**, tidak ada `any` kecuali dengan komentar alasan.
8. Waktu ditampilkan dalam **WIB (Asia/Jakarta)**.
9. Bahasa UI: **Bahasa Indonesia**.

### 3.3 Git
- Branch: `main` (stabil), `dev` (integrasi), fitur: `feat/o1-<nama>` atau `feat/o2-<nama>`.
- Commit: Conventional Commits (`feat:`, `fix:`, `refactor:`, `test:`, `docs:`).
- Merge ke `dev` lewat Pull Request, direview anggota lain.
- **Kedua anggota wajib commit rutin tiap minggu** (dinilai dari commit history).

---

## 4. Pembagian Peran & Kepemilikan File

| | **Orang 1 — Lead Architect, Security & Frontend** | **Orang 2 — Lead Spatial, Hardware & Data** |
|---|---|---|
| Gabungan peran asli | Anggota 1 + Anggota 2 | Anggota 3 |
| Milik (boleh ubah bebas) | `src/store/*`, `src/types/*`, `src/services/supabase.ts`, `src/services/secureStorage.ts`, `src/services/auth.ts`, `src/components/ui/*`, `src/constants/*`, `app/_layout.tsx`, `app/(auth)/*`, `app/(tabs)/_layout.tsx`, `app/(tabs)/reports.tsx`, `app/(tabs)/create.tsx`, `app/(tabs)/vault.tsx`, `app/(tabs)/profile.tsx`, `app/report/[id].tsx`, `eas.json`, `app.json`, `README.md`, `docs/audit-checklist.md` | `src/hooks/useLocationTracking.ts`, `src/hooks/useGeofence.ts`, `src/hooks/useReportFilter.ts`, `src/hooks/useRealtimeReports.ts`, `src/hooks/useNetworkStatus.ts`, `src/hooks/usePermission.ts`, `src/services/fileVault.ts`, `src/services/camera.ts`, `src/services/watermark.ts`, `src/services/offlineQueue.ts`, `src/utils/haversine.ts`, `src/utils/geofence.ts`, `src/components/map/*`, `app/(tabs)/map.tsx` |
| Fokus | Struktur, store, keamanan, semua UI non-peta, performa render, audit, build | Peta, lokasi, geofence, kamera/watermark, file-system, RxJS, realtime, offline |

**Aturan lintas peran:**
- Orang 2 butuh field/action baru di store → **minta Orang 1** (atau buat PR kecil dan minta review). Jangan ubah `types/` diam-diam.
- Orang 1 memakai hook milik Orang 2 lewat **signature di §5**. Jika signature belum ada, buat stub sementara dengan signature yang sama.
- Pekerjaan **bersama**: optimasi memo di kode masing-masing, laporan PDF, laporan AIK, demo.

---

## 5. Kontrak Bersama (sepakati di Minggu 1, jangan diubah sepihak)

### 5.1 Types (`src/types/index.ts`)
```ts
export type ReportCategory =
  | 'jalan_rusak' | 'lampu_mati' | 'drainase' | 'banjir'
  | 'longsor' | 'pohon_tumbang' | 'lainnya';

export type ReportStatus = 'baru' | 'diverifikasi' | 'diproses' | 'selesai';

export interface Coordinate { latitude: number; longitude: number; }

export interface Report {
  id: string;
  userId: string;
  category: ReportCategory;
  description: string;
  photoUrl: string | null;     // URL Supabase Storage (sudah ber-watermark)
  location: Coordinate;
  status: ReportStatus;
  createdAt: string;           // ISO string
  pendingSync?: boolean;       // true jika masih di antrean offline
}

export interface DisasterZone {
  id: string;
  name: string;
  type: 'banjir' | 'longsor' | 'gempa' | 'lainnya';
  center: Coordinate;
  radiusMeters: number;
  riskLevel: 'rendah' | 'sedang' | 'tinggi';
}

export interface VaultDocument {
  id: string;
  name: string;
  uri: string;                 // path di documentDirectory
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
}

export interface ReportFilter {
  query: string;
  categories: ReportCategory[];
  status: ReportStatus | 'semua';
  maxDistanceKm: number | null;
}
```

### 5.2 Store (Orang 1 pemilik)
```ts
// useReportStore
reports: Report[];
filter: ReportFilter;
isLoading: boolean;
error: string | null;
setReports(r: Report[]): void;
upsertReport(r: Report): void;      // dipakai realtime & offline queue
removeReport(id: string): void;
setFilter(f: Partial<ReportFilter>): void;

// useZoneStore
zones: DisasterZone[];
activeZoneIds: string[];            // zona yang sedang dimasuki user
setZones(z: DisasterZone[]): void;
setActiveZones(ids: string[]): void;

// useAuthStore
user: { id: string; email: string } | null;
isHydrated: boolean;
login(email: string, pw: string): Promise<void>;
logout(): Promise<void>;
hydrate(): Promise<void>;           // baca token dari secure-store

// useVaultStore
documents: VaultDocument[];
addDocument(d: VaultDocument): void;
removeDocument(id: string): void;

// useNetworkStore
isOnline: boolean;
setOnline(v: boolean): void;
```

### 5.3 Hooks & services (Orang 2 pemilik)
```ts
useLocationTracking(): { location: Coordinate | null; error: string | null; permission: 'granted'|'denied'|'undetermined' }
useGeofence(zones: DisasterZone[], location: Coordinate | null): { insideZones: DisasterZone[] }
useReportFilter(): { results: Report[]; isSearching: boolean; setQuery(q: string): void }
useRealtimeReports(): void          // subscribe → panggil upsertReport
useNetworkStatus(): boolean
usePermission(kind: 'camera'|'location'|'media'): { status; request(): Promise<boolean> }

haversineKm(a: Coordinate, b: Coordinate): number
isInsideZone(p: Coordinate, z: DisasterZone): boolean
capturePhoto(): Promise<string | null>                 // uri lokal
applyWatermark(uri: string, loc: Coordinate, date: Date): Promise<string>  // uri baru
fileVault.save(uri: string, name: string): Promise<VaultDocument>
fileVault.list(): Promise<VaultDocument[]>
fileVault.remove(doc: VaultDocument): Promise<void>
offlineQueue.enqueue(r: Omit<Report,'id'|'status'|'createdAt'>): Promise<void>
offlineQueue.flush(): Promise<void>
```

### 5.4 Database Supabase
```sql
reports(id uuid pk, user_id uuid, category text, description text, photo_url text,
        latitude float8, longitude float8, status text default 'baru', created_at timestamptz default now())
disaster_zones(id uuid pk, name text, type text, center_lat float8, center_lng float8,
               radius_meters int, risk_level text)
-- storage bucket: report-photos
-- RLS: semua user login bisa SELECT reports & zones; INSERT reports hanya user_id = auth.uid()
-- Realtime: aktifkan untuk tabel reports
```
Mapping snake_case DB ↔ camelCase type dilakukan di `src/services/supabase.ts` (Orang 1).

---

## 6. Jadwal Mingguan per Anggota

### Minggu 1 — 14–20 Nov · Setup + LBS & Peta (Milestone P9)
**Target akhir minggu:** app jalan di HP, login belum wajib, peta tampil dengan posisi user + marker dummy + jarak Haversine.

**Orang 1**
- [x] Init repo GitHub, Expo + TS strict, ESLint/Prettier, branch `main`/`dev`, `.env.example`, README awal.
- [x] Buat struktur folder §3.1.
- [x] Tulis `src/types/index.ts` persis §5.1.
- [x] Buat semua store §5.2 (immutable, precision selectors), isi data dummy laporan.
- [x] Expo Router: root layout (SafeAreaProvider), tab layout 5 tab, screen placeholder.
- [x] `src/services/supabase.ts` (client + mapper).

**Orang 2**
- [x] Install & konfigurasi `react-native-maps`, `expo-location` di `app.json` (izin + API key).
- [x] `useLocationTracking` dengan `watchPositionAsync`, `distanceInterval` adaptif (mis. diam 5 m, jalan 20 m, kendaraan 50 m berdasar `speed`), cleanup `remove()`.
- [x] `src/utils/haversine.ts` (`haversineKm`).
- [x] `components/map/ReportMarker.tsx` (ikon/warna per kategori, `React.memo`).
- [x] `app/(tabs)/map.tsx`: peta + marker dari `useReportStore` + jarak ke user di callout.

**Bersama**
- [ ] Buat proyek Supabase, tabel & bucket §5.4, RLS, aktifkan Realtime.
- [ ] Sepakati & freeze kontrak §5.

---

### Minggu 2 — 21–27 Nov · Auth, Kamera, Storage & Secure Store (Milestone P10)
**Target:** user bisa login, membuat laporan dengan foto ber-watermark, menyimpan dokumen di vault.

**Orang 1**
- [x] `services/secureStorage.ts`: get/set/delete token, NIK, kredensial (`expo-secure-store`).
- [x] `services/auth.ts` + `useAuthStore`: login/register Supabase, token di secure-store, `hydrate()` auto-login, auth gate di root layout.
- [x] Screen login & register.
- [x] `app/(tabs)/create.tsx`: form (kategori, deskripsi, foto, lokasi otomatis), `KeyboardAvoidingView`, upload foto ke bucket, insert ke `reports`.
- [x] `app/(tabs)/vault.tsx`: list dokumen, tambah, hapus, preview (memakai `fileVault`).

**Orang 2**
- [x] `usePermission`: alur Just-In-Time + layar penjelasan + tombol buka Settings jika ditolak permanen.
- [x] `services/camera.ts` (`capturePhoto`).
- [x] `services/watermark.ts` (`applyWatermark`): teks `lat, long` + `dd MMM yyyy HH:mm WIB` di pojok foto.
- [x] `services/fileVault.ts`: simpan/list/hapus di `documentDirectory + 'vault/'`, metadata ke `useVaultStore`.
- [x] Pastikan tolak izin **tidak** membuat app crash.

---

### Minggu 3 — 28 Nov–4 Des · Geofencing, RxJS, Real-time, Offline (Milestone P11)
**Target:** zona rawan tampil & memberi peringatan, filter reaktif, laporan baru muncul live, app tahan offline.

**Orang 1**
- [x] `app/(tabs)/reports.tsx`: `FlatList` laporan + search bar + chip kategori/status, terhubung `useReportFilter`.
- [x] `app/report/[id].tsx`: detail laporan (foto, peta mini, status).
- [x] Tambah action/field store yang diminta Orang 2 (realtime, offline queue, `pendingSync`).
- [x] Banner "Offline" global dari `useNetworkStore`.

**Orang 2**
- [ ] Isi `disaster_zones` (min. 5 zona contoh di Malang), load ke `useZoneStore`.
- [ ] `utils/geofence.ts` (`isInsideZone` berbasis Haversine) + `useGeofence` → notifikasi lokal saat masuk zona (sekali per masuk, bukan berulang).
- [ ] `components/map/ZoneCircle.tsx` (warna sesuai `riskLevel`).
- [ ] `useReportFilter`: `Subject<string>` → `debounceTime(300)` → `distinctUntilChanged()` → `switchMap(query Supabase / filter lokal)`; dukung `maxDistanceKm`; `unsubscribe` saat unmount.
- [ ] `useRealtimeReports`: channel `reports` (INSERT/UPDATE) → `upsertReport`; `removeChannel` saat unmount.
- [ ] `useNetworkStatus` + `offlineQueue` (simpan antrean di file-system, `flush()` saat online kembali).

---

### Minggu 4 — 5–11 Des · UI Polish, Performa & Audit (Milestone P12–P13)
**Target:** UI halus 60 FPS, responsif rotasi, checklist audit terisi lengkap.

**Orang 1**
- [ ] Responsif: `useWindowDimensions`, uji rotasi & 2 ukuran layar.
- [ ] Animasi `react-native-reanimated`: tombol lapor, transisi kartu, bottom sheet detail.
- [ ] Skeleton loader di list, detail, vault.
- [ ] Aksesibilitas: `accessibilityLabel`, target sentuh ≥ 44 px, kontras.
- [ ] Optimasi render: `React.memo` item, `useCallback` handler, `useMemo` data turunan, `FlatList` (`keyExtractor`, `getItemLayout`, `windowSize`).
- [ ] Pimpin **Architect's Audit Protocol** di `docs/audit-checklist.md`:
  - Check 1: Explicit Error Handling & Permissions
  - Check 2: Graceful Fallbacks & Skeleton UI
  - Check 3: Unsubscribe & Cleanup (Zero Memory Leak)
- [ ] Profiling dengan Perf Monitor/React DevTools Profiler, screenshot bukti.

**Orang 2**
- [ ] Optimasi peta: marker di-memo, `tracksViewChanges={false}`, clustering/batas jumlah marker.
- [ ] Audit cleanup semua kode miliknya (lokasi, geofence, RxJS, realtime, NetInfo) → isi bagian Check 3.
- [ ] Refactor kode via Antigravity IDE, simpan prompt di `docs/prompts/`.

**Bersama**
- [ ] Simpan bukti master prompting Antigravity (`docs/prompts/*.md`).

---

### Minggu 5 — 12–18 Des · Testing, APK, Laporan & Demo (Milestone P14–P15)
**Target:** semua test lulus, APK terpasang di HP fisik, laporan PDF final, siap demo.

**Orang 1**
- [ ] Unit test store Zustand (`__tests__/store/*`).
- [ ] `eas.json` profile `preview` (`buildType: apk`), build APK, uji di HP kedua anggota.
- [ ] Bersihkan repo: tidak ada credential, README lengkap (instalasi, arsitektur, cara menjalankan, struktur folder).

**Orang 2**
- [ ] Unit test `haversineKm`, `isInsideZone`, formatter watermark (`__tests__/utils/*`).
- [ ] Uji skenario lapangan: masuk zona, offline → online, foto watermark.

**Bersama**
- [ ] Integration test UI (min. form lapor & list + filter) dengan `@testing-library/react-native`.
- [ ] Laporan PDF: Bab I (SDG 11), Bab II (arsitektur & Zustand UDF), Bab III (audit & profiling 16 ms), Bab IV (AIK: Ikhlas, Itqan, Amanah), Bab V (kesimpulan).
- [ ] Skenario demo: lapor → muncul real-time di HP lain → masuk zona → filter → vault. Latihan tanya jawab, **kedua anggota menguasai semua fitur**.
- [ ] Kumpul di Moodle: link repo, APK, PDF.

---

## 7. Rubrik (untuk prioritas)
| Komponen | Bobot | Penanggung jawab utama |
|---|---|---|
| Arsitektur & Zustand UDF | 20% | Orang 1 |
| Hardware, Scoped Storage, Security, LBS | 25% | Orang 2 (security: Orang 1) |
| Performa 60 FPS & zero memory leak | 20% | Bersama |
| Vibe coding (Antigravity) & laporan AIK | 15% | Bersama |
| Testing & APK | 10% | Bersama |
| Presentasi & demo | 10% | Bersama |

---

## 8. Instruksi Khusus untuk AI Agent
1. Sebelum mengerjakan, tanyakan/konfirmasi: **"Saya membantu Orang 1 atau Orang 2, dan ini minggu ke berapa?"** Lalu kerjakan hanya checklist minggu itu untuk peran itu.
2. Gunakan **nama file, type, dan signature persis** seperti §3–§5. Jangan membuat nama alternatif.
3. Jika butuh sesuatu dari peran lain yang belum ada, buat **stub** dengan signature §5 dan beri komentar `// TODO(Orang X): implementasi asli`.
4. Jangan menambah library di luar §2 tanpa menyebutkannya ke user dan alasannya.
5. Jangan mengarang API library. Jika ragu dengan API Expo/library tertentu, katakan ragu dan sarankan cek dokumentasi versi SDK yang terpasang (`package.json`).
6. Setiap `useEffect` dengan subscription **harus** punya cleanup — sebutkan cleanup-nya di penjelasan.
7. Setiap selesai satu tugas, tuliskan: file yang diubah, cara menguji, dan item checklist yang bisa dicentang.
8. Jangan menulis credential, API key, atau NIK asli di kode maupun contoh.
