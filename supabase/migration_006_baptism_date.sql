-- Migration 006: baptism tracking on members
-- Run this in the Supabase SQL Editor after migration_005.

alter table members add column if not exists baptism_date date;
