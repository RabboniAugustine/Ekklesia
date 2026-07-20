-- Migration 002: events table
-- Run this in the Supabase SQL Editor after migration_001.
--
-- Note on RSVP: this app has no member-facing login (only staff/admin
-- profiles authenticate), so "RSVP" here is a count staff track manually
-- rather than individual member sign-ups, consistent with how the rest
-- of the app works today. If a member self-service portal gets built
-- later, this can be replaced with a proper event_rsvps table.

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  church_id uuid references churches(id) on delete cascade not null,
  title text not null,
  description text,
  location text,
  event_type text not null default 'service',
  start_at timestamptz not null,
  end_at timestamptz,
  capacity int,
  rsvp_count int not null default 0,
  status text not null default 'scheduled',
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint events_type_check check (event_type in ('service', 'study', 'rehearsal', 'outreach', 'meeting', 'other')),
  constraint events_status_check check (status in ('scheduled', 'cancelled', 'completed')),
  constraint events_rsvp_nonnegative check (rsvp_count >= 0),
  constraint events_capacity_nonnegative check (capacity is null or capacity >= 0)
);

create index if not exists events_church_start_idx on events (church_id, start_at);

alter table events enable row level security;

create policy "Events readable within own church"
  on events for select
  using (
    church_id in (select church_id from profiles where id = auth.uid())
  );

create policy "Events insertable within own church"
  on events for insert
  with check (
    church_id in (select church_id from profiles where id = auth.uid())
  );

create policy "Events updatable within own church"
  on events for update
  using (
    church_id in (select church_id from profiles where id = auth.uid())
  )
  with check (
    church_id in (select church_id from profiles where id = auth.uid())
  );
