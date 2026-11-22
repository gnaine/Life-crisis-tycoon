-- Life Crisis Tycoon: account deletion (GDPR) and public leaderboard. Run after supabase.sql.

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

-- Score = stars across the 8 cities (0–3 each, known cities only), then cities reached.
-- Shows only the public username and the score, never an email or a user id.
create or replace function public.leaderboard(lim int default 50)
returns table(rank bigint, username text, stars int, cities int, me boolean)
language sql stable security definer set search_path = '' as $$
  with p as (
    select s.user_id, public.safe_jsonb(s.v) -> 'stars' as st
    from public.saves s where s.k = 'ahq_profile'
  ), sc as (
    select p.user_id,
      coalesce(sum(least(greatest(coalesce((e.value #>> '{}')::numeric, 0), 0), 3)::int), 0)::int as stars,
      count(e.key) filter (where coalesce((e.value #>> '{}')::numeric, 0) > 0)::int as cities
    from p
    left join lateral jsonb_each(case when jsonb_typeof(p.st) = 'object' then p.st else '{}'::jsonb end) e
      on e.key in ('london','lagos','mumbai','seoul','saopaulo','cairo','mexico','newyork') and jsonb_typeof(e.value) = 'number'
    group by p.user_id
  ), r as (
    select rank() over (order by sc.stars desc, sc.cities desc) as rank, pr.username, sc.stars, sc.cities,
      (sc.user_id = auth.uid()) as me, pr.created_at
    from sc join public.profiles pr on pr.user_id = sc.user_id
  )
  select rank, username, stars, cities, me from r
  where rank <= greatest(1, least(coalesce(lim, 50), 100)) or me
  order by rank, created_at;
$$;
revoke all on function public.leaderboard(int) from public;
grant execute on function public.leaderboard(int) to anon, authenticated;
