-- Executed by the Lovable/Supabase integration. RLS policies should only allow owner access.
create table if not exists careers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  state jsonb not null,
  updated_at timestamptz not null default now(),
  unique (user_id)
);

alter table careers enable row level security;
create policy "career owner can read" on careers for select using (auth.uid() = user_id);
create policy "career owner can insert" on careers for insert with check (auth.uid() = user_id);
create policy "career owner can update" on careers for update using (auth.uid() = user_id);

create table if not exists career_rankings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  score integer not null,
  name text not null,
  updated_at timestamptz not null default now()
);

alter table career_rankings enable row level security;
create policy "ranking owner can read" on career_rankings for select using (auth.uid() = user_id);
create policy "ranking owner can write" on career_rankings for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
