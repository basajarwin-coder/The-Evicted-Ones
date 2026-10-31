-- TEO clan data for Supabase. Run this once in the Supabase SQL editor.
-- Server code reads and writes with SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
-- Do not put the service role key in the browser.

create extension if not exists pgcrypto;

create table if not exists media (
  id uuid primary key default gen_random_uuid(),
  alt text not null default '',
  url text,
  filename text,
  mime_type text,
  filesize integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists members (
  id uuid primary key default gen_random_uuid(),
  ign text not null,
  slug text not null unique,
  avatar_id uuid references media (id) on delete set null,
  position text not null default 'Player',
  mode text not null default 'MP',
  status text not null default 'active',
  description text,
  introduction text,
  highlights jsonb not null default '[]'::jsonb,
  achievements jsonb not null default '[]'::jsonb,
  socials jsonb not null default '{}'::jsonb,
  featured boolean not null default false,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists staff (
  id uuid primary key,
  name text not null,
  email text not null unique,
  role text not null default 'member-manager',
  active boolean not null default true,
  assigned_members uuid[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists gallery (
  id uuid primary key default gen_random_uuid(),
  image_id uuid references media (id) on delete set null,
  caption text,
  category text not null default 'team',
  member_id uuid references members (id) on delete set null,
  taken_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists scrims (
  id uuid primary key default gen_random_uuid(),
  opponent text not null,
  match_date timestamptz not null,
  mode text not null,
  map text not null,
  match_type text not null default 'scrim',
  teo_score integer not null default 0,
  opponent_score integer not null default 0,
  outcome text not null,
  screenshot_id uuid references media (id) on delete set null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists achievements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  date timestamptz not null,
  description text,
  image_id uuid references media (id) on delete set null,
  member_id uuid references members (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  description text not null,
  image_id uuid references media (id) on delete set null,
  published_at timestamptz not null,
  pinned boolean not null default false,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists applications (
  id uuid primary key default gen_random_uuid(),
  ign text not null,
  player_id text not null,
  mode text not null,
  rank text not null,
  previous_clans text,
  availability text not null,
  introduction text not null,
  status text not null default 'pending',
  review_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists site_settings (
  id integer primary key default 1 check (id = 1),
  tagline text not null default 'THE EVICTED ONES',
  intro text not null default 'TEO is a competitive Call of Duty: Mobile clan built on discipline, teamwork and relentless practice.',
  recruitment_open boolean not null default true,
  discord text,
  youtube text,
  instagram text,
  tiktok text,
  facebook text,
  updated_at timestamptz not null default now()
);

insert into site_settings (id)
values (1)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

alter table media enable row level security;
alter table members enable row level security;
alter table gallery enable row level security;
alter table scrims enable row level security;
alter table achievements enable row level security;
alter table announcements enable row level security;
alter table applications enable row level security;
alter table site_settings enable row level security;
alter table staff enable row level security;

-- Public pages are rendered on the server with the service role key.
-- These policies only cover a leaked anon key: visitors can read public content, not staff or applications.
do $$
begin
  if not exists (select 1 from pg_policies where policyname = 'teo_public_read_members') then
    create policy teo_public_read_members on members for select using (true);
    create policy teo_public_read_gallery on gallery for select using (true);
    create policy teo_public_read_scrims on scrims for select using (true);
    create policy teo_public_read_achievements on achievements for select using (true);
    create policy teo_public_read_announcements on announcements for select using (true);
    create policy teo_public_read_media on media for select using (true);
    create policy teo_public_read_settings on site_settings for select using (true);
    create policy teo_public_read_storage on storage.objects for select using (bucket_id = 'media');
  end if;
end $$;
