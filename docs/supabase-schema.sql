-- Civic Pulse — skema Supabase (PROJECT_CONTEXT §5.4). Jalankan di SQL Editor Supabase.

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  category text not null,
  description text not null,
  photo_url text,
  latitude float8 not null,
  longitude float8 not null,
  status text not null default 'baru',
  created_at timestamptz not null default now()
);

create table if not exists public.disaster_zones (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null,
  center_lat float8 not null,
  center_lng float8 not null,
  radius_meters int not null,
  risk_level text not null
);

alter table public.reports enable row level security;
alter table public.disaster_zones enable row level security;

create policy "reports_select_authenticated" on public.reports
  for select to authenticated using (true);
create policy "reports_insert_own" on public.reports
  for insert to authenticated with check (user_id = auth.uid());
create policy "zones_select_authenticated" on public.disaster_zones
  for select to authenticated using (true);

-- Realtime untuk tabel reports
alter publication supabase_realtime add table public.reports;

-- Storage bucket foto laporan
insert into storage.buckets (id, name, public)
values ('report-photos', 'report-photos', true)
on conflict (id) do nothing;

create policy "report_photos_read" on storage.objects
  for select to authenticated using (bucket_id = 'report-photos');
create policy "report_photos_upload_own_folder" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'report-photos' and (storage.foldername(name))[1] = auth.uid()::text);
