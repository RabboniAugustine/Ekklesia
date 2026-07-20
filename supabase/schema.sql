-- Church Management System - Supabase starter schema
-- Run this in Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists churches (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  church_id uuid references churches(id) on delete cascade,
  full_name text not null,
  role text not null default 'usher',
  created_at timestamptz not null default now(),
  constraint profiles_role_check check (role in ('super_admin', 'pastor', 'admin', 'usher', 'finance', 'ministry_leader'))
);

create table if not exists members (
  id uuid primary key default gen_random_uuid(),
  church_id uuid references churches(id) on delete cascade not null,
  first_name text not null,
  last_name text not null,
  phone text,
  email text,
  member_type text not null default 'member',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint members_type_check check (member_type in ('member', 'visitor', 'child', 'staff', 'leader')),
  constraint members_status_check check (status in ('active', 'inactive', 'archived'))
);

create table if not exists attendance_records (
  id uuid primary key default gen_random_uuid(),
  church_id uuid references churches(id) on delete cascade not null,
  member_id uuid references members(id) on delete set null,
  service_date date not null default current_date,
  service_name text not null default 'Sunday Service',
  checked_in_by uuid references profiles(id) on delete set null,
  checked_in_at timestamptz not null default now(),
  notes text
);

create index if not exists members_church_name_idx on members (church_id, last_name, first_name);
create index if not exists attendance_church_date_idx on attendance_records (church_id, service_date);
create index if not exists attendance_member_date_idx on attendance_records (member_id, service_date);

-- Starter data. Replace the name with your actual church name.
insert into churches (name)
values ('Grace Community Church')
on conflict do nothing;

-- For early local testing only.
-- Before real production use, turn RLS on and add authenticated role policies.
alter table churches enable row level security;
alter table profiles enable row level security;
alter table members enable row level security;
alter table attendance_records enable row level security;

create policy "Temporary public church read"
  on churches for select
  using (true);

create policy "Temporary public member read"
  on members for select
  using (true);

create policy "Temporary public member insert"
  on members for insert
  with check (true);

create policy "Temporary public attendance read"
  on attendance_records for select
  using (true);

create policy "Temporary public attendance insert"
  on attendance_records for insert
  with check (true);
