-- Migration 007: Settings support
-- Run this in the Supabase SQL Editor after migration_006.
--
-- Also closes a schema-drift gap: authService.ts has always selected
-- profiles.phone, but no prior migration actually added that column to
-- the tracked schema. Adding it here so a fresh database matches what
-- the app expects (harmless if it already exists in your live DB).

alter table profiles add column if not exists phone text;

-- Prior migrations only let a church be read (not updated) and only let a
-- user update their own profile row. Settings needs two more things:
-- admins editing the church name, and admins managing teammates' roles/
-- active status. Both are added as additional permissive UPDATE policies -
-- they don't replace the existing ones, so a non-admin can still update
-- their own profile via the policy from migration_001.

create policy "Admins can update own church"
  on churches for update
  using (
    id in (
      select church_id from profiles
      where id = auth.uid() and role in ('super_admin', 'admin', 'pastor')
    )
  )
  with check (
    id in (
      select church_id from profiles
      where id = auth.uid() and role in ('super_admin', 'admin', 'pastor')
    )
  );

create policy "Admins can update teammates within own church"
  on profiles for update
  using (
    church_id in (
      select church_id from profiles p2
      where p2.id = auth.uid() and p2.role in ('super_admin', 'admin', 'pastor')
    )
  )
  with check (
    church_id in (
      select church_id from profiles p2
      where p2.id = auth.uid() and p2.role in ('super_admin', 'admin', 'pastor')
    )
  );
