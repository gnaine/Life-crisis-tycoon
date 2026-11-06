-- Life Crisis Tycoon: one row per saved key per player. Row-level security: each player reads and writes only their own rows.
create table if not exists public.saves (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  k text not null check (k like 'ahq\_%'),
  v text not null check (length(v) < 2000000),
  at bigint not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, k)
);
alter table public.saves enable row level security;
drop policy if exists "own saves: read" on public.saves;
drop policy if exists "own saves: insert" on public.saves;
drop policy if exists "own saves: update" on public.saves;
drop policy if exists "own saves: delete" on public.saves;
create policy "own saves: read"   on public.saves for select using (auth.uid() = user_id);
create policy "own saves: insert" on public.saves for insert with check (auth.uid() = user_id);
create policy "own saves: update" on public.saves for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own saves: delete" on public.saves for delete using (auth.uid() = user_id);
create or replace function public.saves_touch() returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end $$;
drop trigger if exists saves_touch on public.saves;
create trigger saves_touch before update on public.saves for each row execute function public.saves_touch();
