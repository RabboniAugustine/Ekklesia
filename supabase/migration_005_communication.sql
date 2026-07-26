-- Migration 005: communication (announcements + prayer requests)
-- Run this in the Supabase SQL Editor after migration_004.

create table if not exists announcements (
  id uuid primary key default gen_random_uuid(),
  church_id uuid references churches(id) on delete cascade not null,
  title text not null,
  body text not null,
  created_by uuid references profiles(id) on delete set null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists prayer_requests (
  id uuid primary key default gen_random_uuid(),
  church_id uuid references churches(id) on delete cascade not null,
  requester_name text,
  is_private boolean not null default false,
  request text not null,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint prayer_requests_status_check check (status in ('open', 'answered'))
);

create index if not exists announcements_church_idx on announcements (church_id);
create index if not exists prayer_requests_church_idx on prayer_requests (church_id);

alter table announcements enable row level security;
alter table prayer_requests enable row level security;

create policy "Announcements readable within own church"
  on announcements for select
  using (church_id in (select church_id from profiles where id = auth.uid()));

create policy "Announcements insertable within own church"
  on announcements for insert
  with check (church_id in (select church_id from profiles where id = auth.uid()));

create policy "Announcements updatable within own church"
  on announcements for update
  using (church_id in (select church_id from profiles where id = auth.uid()))
  with check (church_id in (select church_id from profiles where id = auth.uid()));

create policy "Announcements deletable within own church"
  on announcements for delete
  using (church_id in (select church_id from profiles where id = auth.uid()));

create policy "Prayer requests readable within own church"
  on prayer_requests for select
  using (church_id in (select church_id from profiles where id = auth.uid()));

create policy "Prayer requests insertable within own church"
  on prayer_requests for insert
  with check (church_id in (select church_id from profiles where id = auth.uid()));

create policy "Prayer requests updatable within own church"
  on prayer_requests for update
  using (church_id in (select church_id from profiles where id = auth.uid()))
  with check (church_id in (select church_id from profiles where id = auth.uid()));

create policy "Prayer requests deletable within own church"
  on prayer_requests for delete
  using (church_id in (select church_id from profiles where id = auth.uid()));
