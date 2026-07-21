-- Migration 004: ministries
-- Run this in the Supabase SQL Editor after migration_003.

create table if not exists ministries (
  id uuid primary key default gen_random_uuid(),
  church_id uuid references churches(id) on delete cascade not null,
  name text not null,
  description text,
  leader_member_id uuid references members(id) on delete set null,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ministries_status_check check (status in ('active', 'inactive'))
);

create table if not exists ministry_members (
  id uuid primary key default gen_random_uuid(),
  ministry_id uuid references ministries(id) on delete cascade not null,
  member_id uuid references members(id) on delete cascade not null,
  role_title text,
  created_at timestamptz not null default now(),
  unique (ministry_id, member_id)
);

create index if not exists ministries_church_idx on ministries (church_id);
create index if not exists ministry_members_ministry_idx on ministry_members (ministry_id);

alter table ministries enable row level security;
alter table ministry_members enable row level security;

create policy "Ministries readable within own church"
  on ministries for select
  using (
    church_id in (select church_id from profiles where id = auth.uid())
  );

create policy "Ministries insertable within own church"
  on ministries for insert
  with check (
    church_id in (select church_id from profiles where id = auth.uid())
  );

create policy "Ministries updatable within own church"
  on ministries for update
  using (
    church_id in (select church_id from profiles where id = auth.uid())
  )
  with check (
    church_id in (select church_id from profiles where id = auth.uid())
  );

-- ministry_members has no church_id of its own, so its policies check
-- church ownership through the parent ministry.
create policy "Ministry roster readable within own church"
  on ministry_members for select
  using (
    ministry_id in (
      select id from ministries where church_id in (
        select church_id from profiles where id = auth.uid()
      )
    )
  );

create policy "Ministry roster insertable within own church"
  on ministry_members for insert
  with check (
    ministry_id in (
      select id from ministries where church_id in (
        select church_id from profiles where id = auth.uid()
      )
    )
  );

create policy "Ministry roster deletable within own church"
  on ministry_members for delete
  using (
    ministry_id in (
      select id from ministries where church_id in (
        select church_id from profiles where id = auth.uid()
      )
    )
  );
