-- Life Crisis Tycoon: account deletion (GDPR) and public leaderboards. Run after supabase.sql.
-- Every board is built from the rows the game already syncs to public.saves; nothing extra is uploaded.
-- Boards show only the public username, the score and a stars badge — never an email or a user id.

-- A player deletes their own account. saves and profiles go with it (on delete cascade).
create or replace function public.delete_my_account() returns void
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  delete from auth.users where id = auth.uid();
end $$;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;

-- Reads a save without failing on a malformed one.
create or replace function public.safe_jsonb(t text) returns jsonb
language plpgsql immutable set search_path = '' as $$
begin return t::jsonb; exception when others then return null; end $$;
revoke all on function public.safe_jsonb(text) from public, anon, authenticated;

create or replace function public.safe_num(j jsonb) returns numeric
language plpgsql immutable set search_path = '' as $$
begin if jsonb_typeof(j) = 'number' then return (j #>> '{}')::numeric; end if; return null; exception when others then return null; end $$;
revoke all on function public.safe_num(jsonb) from public, anon, authenticated;

-- Stars badge: stars across the 8 cities (0–3 each, known cities only).
create or replace function public.player_stars() returns table(user_id uuid, stars int)
language sql stable security definer set search_path = '' as $$
  select s.user_id, coalesce(sum(least(greatest(public.safe_num(e.value), 0), 3)::int), 0)::int
  from public.saves s
  left join lateral jsonb_each(case when jsonb_typeof(public.safe_jsonb(s.v) -> 'stars') = 'object' then public.safe_jsonb(s.v) -> 'stars' else '{}'::jsonb end) e
    on e.key in ('london','lagos','mumbai','seoul','saopaulo','cairo','mexico','newyork')
  where s.k = 'ahq_profile'
  group by s.user_id;
$$;
revoke all on function public.player_stars() from public, anon, authenticated;

-- 1) Daily challenge: best score of the day (game key ahq_best_daily<YYYY-MM-DD>, the player's local date).
-- Anti-cheat: the 3-minute shift cannot reach the cap below, and a score must be written by the day after
-- (time zones included) — editing an old day's score later does not count.
create or replace function public.leaderboard_daily(d date, lim int default 50)
returns table(rank bigint, username text, score int, stars int, me boolean)
language sql stable security definer set search_path = '' as $$
  with sc as (
    select s.user_id, public.safe_num(public.safe_jsonb(s.v))::int as score, s.updated_at
    from public.saves s
    where s.k = 'ahq_best_daily' || to_char(d, 'YYYY-MM-DD')
  ), ok as (
    select * from sc
    where score between 1 and 20000
      and updated_at < (d + 2)::timestamptz and updated_at > (d - 1)::timestamptz
  ), r as (
    select rank() over (order by ok.score desc) as rank, pr.username, ok.score, coalesce(ps.stars, 0) as stars,
      coalesce(ok.user_id = auth.uid(), false) as me, ok.updated_at
    from ok join public.profiles pr on pr.user_id = ok.user_id
    left join public.player_stars() ps on ps.user_id = ok.user_id
  )
  select rank, username, score, stars, me from r
  where rank <= greatest(1, least(coalesce(lim, 50), 100)) or me
  order by rank, updated_at;
$$;
revoke all on function public.leaderboard_daily(date, int) from public;
grant execute on function public.leaderboard_daily(date, int) to anon, authenticated;

-- 2) One board per city, on live numbers from the career save (game key ahq_<city>_v2):
--   metric 'value'  = clinic value: cash + what the rooms cost to build
--   metric 'helped' = clients helped
--   metric 'vibes'  = mood (0–100)
-- Anti-cheat: a save is left out when its numbers are impossible for its day count
-- (real players stay far below: about 25 clients and 8,000 earned per day at most).
create or replace function public.leaderboard_city(city text, metric text default 'value', lim int default 50)
returns table(rank bigint, username text, score bigint, day int, stars int, me boolean)
language sql stable security definer set search_path = '' as $$
  with raw as (
    select s.user_id, s.updated_at, public.safe_jsonb(s.v) as j
    from public.saves s
    where city in ('london','lagos','mumbai','seoul','saopaulo','cairo','mexico','newyork')
      and s.k = 'ahq_' || city || '_v2'
  ), st as (
    select raw.user_id, raw.updated_at, raw.j,
      public.safe_num(raw.j -> 'day') as day, public.safe_num(raw.j -> 'cash') as cash,
      public.safe_num(raw.j -> 'earned') as earned, public.safe_num(raw.j -> 'served') as served,
      public.safe_num(raw.j -> 'vibes') as vibes,
      case when jsonb_typeof(raw.j -> 'rooms') = 'array' then raw.j -> 'rooms' else '[]'::jsonb end as rooms
    from raw where raw.j is not null
  ), ok as (
    select st.*,
      (select coalesce(sum(round(coalesce(c.cost, 2500) * case rm ->> 'size' when 's' then 0.7 when 'l' then 1.8 else 1 end / 50) * 50), 0)
         from jsonb_array_elements(st.rooms) rm
         left join (values ('budget',2500),('nap',3000),('detox',2200),('career',2800),('cafe',1800),('lab',4000),('social',2600),
           ('parent',2600),('moving',2400),('pharmacy',2000),('glowup',3000),('wedding',2800),('jjim',2800),('yoga',3000),('lucha',2800),
           ('ahwa',2700),('roda',2600),('garage',2600),('shop',2200),('staffroom',1500),('toilet',1200),('therapy',3200)) c(type, cost)
           on c.type = rm ->> 'type') as roomval
    from st
    where st.day between 1 and 100000 and st.cash is not null and st.served is not null and st.vibes is not null
      and st.served between 0 and 40 * st.day + 60
      and coalesce(st.earned, 0) between 0 and 15000 * st.day + 30000
      and st.cash between -100000 and coalesce(st.earned, 0) + 30000
      and st.vibes between 0 and 100
      and jsonb_array_length(st.rooms) <= 60
  ), sc as (
    select ok.user_id, ok.updated_at, ok.day::int as day,
      (case metric when 'helped' then ok.served when 'vibes' then round(ok.vibes) else round(ok.cash) + ok.roomval end)::bigint as score
    from ok
  ), r as (
    select rank() over (order by sc.score desc) as rank, pr.username, sc.score, sc.day, coalesce(ps.stars, 0) as stars,
      coalesce(sc.user_id = auth.uid(), false) as me, sc.updated_at
    from sc join public.profiles pr on pr.user_id = sc.user_id
    left join public.player_stars() ps on ps.user_id = sc.user_id
  )
  select rank, username, score, day, stars, me from r
  where rank <= greatest(1, least(coalesce(lim, 50), 100)) or me
  order by rank, updated_at;
$$;
revoke all on function public.leaderboard_city(text, text, int) from public;
grant execute on function public.leaderboard_city(text, text, int) to anon, authenticated;

-- The first stars-only board is replaced by the two boards above.
drop function if exists public.leaderboard(int);
