-- Travel with Haru-chan: Supabase Database Setup
-- Run this SQL in your Supabase SQL Editor to create the required tables

-- ============================================
-- 1. TRIPS TABLE
-- ============================================
-- Stores each trip created from an Instagram link
create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  title text,
  instagram_url text,
  location_summary text
);

-- Index for fast ordering by newest trips first
create index if not exists trips_created_at_idx
  on public.trips (created_at desc);

-- ============================================
-- 2. LOCATIONS TABLE (for future use)
-- ============================================
-- Stores individual places within a trip
create table if not exists public.locations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  trip_id uuid not null
    references public.trips(id)
    on delete cascade,
  name text not null,
  address text,
  latitude numeric,
  longitude numeric,
  day integer,
  order_index integer,
  notes text
);

-- Index for fast lookups by trip
create index if not exists locations_trip_id_idx
  on public.locations (trip_id, day, order_index);

-- ============================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================
-- Enable RLS on trips table
alter table public.trips enable row level security;

-- Allow anyone to read trips (public access)
create policy "Trips - public select"
  on public.trips
  for select
  using (true);

-- Allow anyone to insert trips (public access)
create policy "Trips - public insert"
  on public.trips
  for insert
  with check (true);

-- Enable RLS on locations table
alter table public.locations enable row level security;

-- Allow anyone to read locations (public access)
create policy "Locations - public select"
  on public.locations
  for select
  using (true);

-- Allow anyone to insert locations (public access)
create policy "Locations - public insert"
  on public.locations
  for insert
  with check (true);

-- ============================================
-- VERIFICATION QUERIES (optional - run these to check)
-- ============================================
-- Check if tables exist:
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' AND table_name IN ('trips', 'locations');

-- Check trips table structure:
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'trips' AND table_schema = 'public';
