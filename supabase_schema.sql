-- Jalankan perintah ini di SQL Editor Supabase Anda
create table if not exists public.respicare_accounts (
  id bigint generated always as identity primary key,
  role text not null,
  name text not null,
  email text,
  phone text,
  rm text,
  pairing_code text,
  condition text,
  age text,
  gender text,
  address text,
  emergency_contact text,
  updated_at timestamptz default now()
);

create table if not exists public.respicare_login_logs (
  id bigint generated always as identity primary key,
  role text not null,
  name text not null,
  email text,
  phone text,
  rm text,
  patient_name text,
  condition text,
  is_demo boolean default false,
  logged_in_at timestamptz default now()
);

create table if not exists public.respicare_schedules (
  rm text primary key,
  schedules_json jsonb not null default '[]'::jsonb,
  updated_at timestamptz default now()
);

alter table public.respicare_accounts enable row level security;
alter table public.respicare_login_logs enable row level security;
alter table public.respicare_schedules enable row level security;

drop policy if exists "Allow anon insert accounts" on public.respicare_accounts;
create policy "Allow anon insert accounts" on public.respicare_accounts
  for insert to anon with check (true);

drop policy if exists "Allow anon insert login logs" on public.respicare_login_logs;
create policy "Allow anon insert login logs" on public.respicare_login_logs
  for insert to anon with check (true);

drop policy if exists "Allow anon upsert schedules" on public.respicare_schedules;
create policy "Allow anon upsert schedules" on public.respicare_schedules
  for all to anon using (true) with check (true);