-- Run in Supabase SQL Editor when provisioning the shared backend.
create type public.participant_role as enum ('exec', 'jit');

create table public.polls (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  poll_date date not null,
  timezone text not null default 'America/Toronto',
  organizer_secret_hash text not null
);
create table public.responses (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.polls(id) on delete cascade,
  name text not null,
  role public.participant_role,
  organizer_role public.participant_role,
  edit_token_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.availability_slots (
  response_id uuid not null references public.responses(id) on delete cascade,
  slot_time timestamptz not null,
  primary key (response_id, slot_time)
);
alter table public.polls enable row level security;
alter table public.responses enable row level security;
alter table public.availability_slots enable row level security;
-- Add RLS policies/functions that validate the private edit secret and response edit token
-- before exposing these tables through the Supabase client.
