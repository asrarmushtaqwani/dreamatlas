-- DreamAtlas Database Schema
-- Run this in your Supabase SQL editor: supabase.com → your project → SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── PROFILES ──────────────────────────────────────────────
create table public.profiles (
  id            uuid references auth.users on delete cascade primary key,
  dream_name    text not null default 'wandering dreamer',
  avatar_color  text not null default '#8b6fff',
  dream_count   integer not null default 0,
  streak        integer not null default 0,
  last_logged   date,
  top_archetype text,
  created_at    timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
declare
  adjectives text[] := array['wandering','silver','twilight','hollow','drifting','forgotten','luminous','silent','velvet','ancient'];
  nouns text[]      := array['corridor','tide','mirror','compass','threshold','lantern','current','horizon','echo','vessel'];
  dream_name text;
begin
  dream_name := 'the ' ||
    adjectives[floor(random() * array_length(adjectives,1) + 1)] || ' ' ||
    nouns[floor(random() * array_length(nouns,1) + 1)];

  insert into public.profiles (id, dream_name)
  values (new.id, dream_name);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── DREAMS ────────────────────────────────────────────────
create table public.dreams (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid references auth.users on delete cascade not null,
  text            text not null,
  mood            text,
  archetypes      text[] not null default '{}',
  symbols         text[] not null default '{}',
  essence         text not null default '',
  map_x           float not null default 0.5,
  map_y           float not null default 0.5,
  is_public       boolean not null default true,
  resonance_count integer not null default 0,
  created_at      timestamptz not null default now()
);

alter table public.dreams enable row level security;

create policy "Public dreams are visible to all"
  on public.dreams for select using (is_public = true);

create policy "Users can see own private dreams"
  on public.dreams for select using (auth.uid() = user_id);

create policy "Users can insert own dreams"
  on public.dreams for insert with check (auth.uid() = user_id);

create policy "Users can update own dreams"
  on public.dreams for update using (auth.uid() = user_id);

create policy "Users can delete own dreams"
  on public.dreams for delete using (auth.uid() = user_id);

-- Index for fast map queries
create index dreams_public_created on public.dreams (is_public, created_at desc);
create index dreams_user_id on public.dreams (user_id, created_at desc);
create index dreams_archetypes on public.dreams using gin (archetypes);

-- Auto-update profile stats when dream is inserted
create or replace function public.update_profile_on_dream()
returns trigger as $$
declare
  today date := current_date;
  last  date;
  new_streak integer;
begin
  select last_logged, streak into last, new_streak
  from public.profiles where id = new.user_id;

  if last = today - interval '1 day' then
    new_streak := coalesce(new_streak, 0) + 1;
  elsif last = today then
    new_streak := coalesce(new_streak, 0);
  else
    new_streak := 1;
  end if;

  update public.profiles set
    dream_count  = dream_count + 1,
    last_logged  = today,
    streak       = new_streak,
    top_archetype = (
      select unnest(archetypes) as a
      from public.dreams
      where user_id = new.user_id
      group by a
      order by count(*) desc
      limit 1
    )
  where id = new.user_id;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_dream_inserted
  after insert on public.dreams
  for each row execute procedure public.update_profile_on_dream();

-- ── RESONANCES ────────────────────────────────────────────
create table public.resonances (
  id         uuid primary key default uuid_generate_v4(),
  dream_id   uuid references public.dreams on delete cascade not null,
  user_id    uuid references auth.users on delete cascade not null,
  created_at timestamptz not null default now(),
  unique (dream_id, user_id)
);

alter table public.resonances enable row level security;

create policy "Anyone can view resonances"
  on public.resonances for select using (true);

create policy "Users can resonate"
  on public.resonances for insert with check (auth.uid() = user_id);

create policy "Users can un-resonate"
  on public.resonances for delete using (auth.uid() = user_id);

-- Auto-update resonance count on dreams
create or replace function public.update_resonance_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update public.dreams set resonance_count = resonance_count + 1 where id = new.dream_id;
  elsif TG_OP = 'DELETE' then
    update public.dreams set resonance_count = resonance_count - 1 where id = old.dream_id;
  end if;
  return null;
end;
$$ language plpgsql security definer;

create trigger on_resonance_change
  after insert or delete on public.resonances
  for each row execute procedure public.update_resonance_count();
