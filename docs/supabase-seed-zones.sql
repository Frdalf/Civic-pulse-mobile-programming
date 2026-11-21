-- Seed zona rawan bencana Malang (PROJECT_CONTEXT Minggu 3, min. 5 zona).
-- Jalankan di SQL Editor Supabase SETELAH supabase-schema.sql.
-- Data sama dengan fallback src/constants/dummyZones.ts.

insert into public.disaster_zones (name, type, center_lat, center_lng, radius_meters, risk_level)
values
  ('Bantaran Sungai Brantas (Jodipan / Kampung Warna-Warni)', 'banjir', -7.9839, 112.6378, 400, 'tinggi'),
  ('Kawasan Tebing Rajabasa (Klojen)', 'longsor', -7.9712, 112.6285, 300, 'sedang'),
  ('Koridor Genangan Air Soekarno-Hatta (Suhat)', 'banjir', -7.9431, 112.618, 500, 'tinggi'),
  ('Sesar Batuan Vulkanik Sukun', 'gempa', -7.9985, 112.619, 600, 'rendah'),
  ('Bantaran Kali Mewek (Tunjungsekar)', 'banjir', -7.9315, 112.6412, 350, 'sedang');
