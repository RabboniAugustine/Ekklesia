-- Migration 003: remove RSVP tracking, add recurring event support
-- Run this in the Supabase SQL Editor after migration_002.

alter table events drop column if exists rsvp_count;

alter table events add column if not exists series_id uuid;

create index if not exists events_series_idx on events (series_id);
