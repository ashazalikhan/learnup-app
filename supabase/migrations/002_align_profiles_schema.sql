-- Legacy projects may already have a profiles table (email, full_name, streak_count).
-- Migration 001 used CREATE TABLE IF NOT EXISTS, so the old shape stayed and the
-- handle_new_user trigger tried to insert display_name into a table that required email.

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'full_name'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'display_name'
  ) then
    alter table public.profiles rename column full_name to display_name;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'streak_count'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'streak'
  ) then
    alter table public.profiles rename column streak_count to streak;
  end if;
end $$;

alter table public.profiles add column if not exists display_name text;
alter table public.profiles add column if not exists xp integer not null default 0;
alter table public.profiles add column if not exists streak integer not null default 0;
alter table public.profiles add column if not exists last_active_date date;

-- email was required on the legacy table; auth.users already stores it.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'email'
  ) then
    alter table public.profiles alter column email drop not null;
  end if;
end $$;

update public.profiles
set display_name = coalesce(
  display_name,
  nullif(trim(email), ''),
  'Learner'
)
where display_name is null or display_name = '';

update public.profiles set streak = coalesce(streak, 0);
update public.profiles set xp = coalesce(xp, 0);

alter table public.profiles alter column display_name set default 'Learner';
alter table public.profiles alter column display_name set not null;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  name text := coalesce(
    nullif(new.raw_user_meta_data->>'display_name', ''),
    split_part(coalesce(new.email, ''), '@', 1),
    'Learner'
  );
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'email'
  ) then
    insert into public.profiles (id, email, display_name)
    values (new.id, new.email, name)
    on conflict (id) do nothing;
  else
    insert into public.profiles (id, display_name)
    values (new.id, name)
    on conflict (id) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
