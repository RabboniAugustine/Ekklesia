-- Migration 001: fix profiles schema gaps + real RLS policies
-- Run this in the Supabase SQL Editor after schema.sql.
--
-- Fixes two problems found while auditing the current database:
-- 1. profiles has RLS enabled but NO select policy at all, so every
--    getUserProfile() call was failing for every signed-in user.
-- 2. members/attendance_records/churches only had "using (true)" temp
--    policies -- open to any anonymous request. Replaced with policies
--    scoped to the caller's own church.

-- 1. Add columns the app already expects but the schema never created.
alter table profiles add column if not exists email text;
alter table profiles add column if not exists avatar_url text;
alter table profiles add column if not exists is_active boolean not null default true;
alter table profiles add column if not exists updated_at timestamptz not null default now();

alter table members add column if not exists updated_at timestamptz not null default now();

-- 2. Drop the temporary open policies.
drop policy if exists "Temporary public church read" on churches;
drop policy if exists "Temporary public member read" on members;
drop policy if exists "Temporary public member insert" on members;
drop policy if exists "Temporary public attendance read" on attendance_records;
drop policy if exists "Temporary public attendance insert" on attendance_records;

-- 3. profiles: a user can read and update their own row.
create policy "Users can read own profile"
  on profiles for select
  using (id = auth.uid());

create policy "Users can update own profile"
  on profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- 4. churches: readable by any authenticated member of that church.
create policy "Church readable by its members"
  on churches for select
  using (
    id in (select church_id from profiles where id = auth.uid())
  );

-- 5. members: scoped to the caller's own church.
create policy "Members readable within own church"
  on members for select
  using (
    church_id in (select church_id from profiles where id = auth.uid())
  );

create policy "Members insertable within own church"
  on members for insert
  with check (
    church_id in (select church_id from profiles where id = auth.uid())
  );

create policy "Members updatable within own church"
  on members for update
  using (
    church_id in (select church_id from profiles where id = auth.uid())
  )
  with check (
    church_id in (select church_id from profiles where id = auth.uid())
  );

-- 6. attendance_records: scoped to the caller's own church.
create policy "Attendance readable within own church"
  on attendance_records for select
  using (
    church_id in (select church_id from profiles where id = auth.uid())
  );

create policy "Attendance insertable within own church"
  on attendance_records for insert
  with check (
    church_id in (select church_id from profiles where id = auth.uid())
  );

-- Note: none of this restricts by role yet (admin vs usher vs finance, etc).
-- It only ensures people can't see or write another church's data. Role-based
-- write restrictions (e.g. only finance/admin can edit members) should be
-- added as a follow-up once each module defines what each role can do.
