-- Run this in Supabase SQL Editor once.
-- This creates the table and applies Row Level Security policies.

create extension if not exists pgcrypto;

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null,
  language text not null check (language in ('javascript', 'python')),
  input_code text not null check (char_length(input_code) <= 20000),
  issues jsonb not null,
  score int not null check (score >= 0 and score <= 100),
  refactored_code text,
  created_at timestamptz not null default now()
);

alter table public.reviews enable row level security;

-- Keep reads private by default.
revoke all on public.reviews from anon, authenticated;

-- Allow anonymous/public client to create rows only.
create policy "anon can insert reviews"
on public.reviews
for insert
to anon
with check (
  score >= 0
  and score <= 100
  and char_length(input_code) <= 20000
);
