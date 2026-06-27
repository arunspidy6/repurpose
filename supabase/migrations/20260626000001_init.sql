-- Repurpose — native app schema
-- Each user owns their profile + their repurposes. Row-Level Security ensures a
-- user can only ever read/write their own rows, even though the client talks to
-- Postgres directly with the anon key.

-- ── PROFILES ────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  brand_voice text,
  preferences jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users read own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Users insert own profile"
  on public.profiles for insert with check (auth.uid() = id);
create policy "Users update own profile"
  on public.profiles for update using (auth.uid() = id);

-- ── REPURPOSES ──────────────────────────────────────────────────────────────
create table if not exists public.repurposes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  source_type text,
  source_text text,
  platforms text[] not null default '{}',
  outputs jsonb not null default '{}'::jsonb,
  voice text,
  created_at timestamptz not null default now()
);

create index if not exists idx_repurposes_user_created
  on public.repurposes(user_id, created_at desc);

alter table public.repurposes enable row level security;

create policy "Users manage own repurposes"
  on public.repurposes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── TRIGGERS ────────────────────────────────────────────────────────────────
-- Auto-create a profile row when a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Keep updated_at fresh on profile changes.
create or replace function public.tg_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.tg_set_updated_at();

-- Lock down helper functions.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.tg_set_updated_at() from public, anon, authenticated;
