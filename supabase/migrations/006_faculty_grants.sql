-- Faculty grants (postgres-managed); required by classroom RPC authorization.

create table if not exists public.faculty_grants (
  user_id uuid primary key references auth.users (id) on delete cascade,
  granted_at timestamptz not null default now()
);

alter table public.faculty_grants enable row level security;

drop policy if exists "faculty_grants_select_own" on public.faculty_grants;
create policy "faculty_grants_select_own"
  on public.faculty_grants for select
  to authenticated
  using (user_id = (select auth.uid()));

revoke all on public.faculty_grants from public, anon, authenticated;
grant select on public.faculty_grants to authenticated;

drop policy if exists "section_join_codes_select_faculty" on public.section_join_codes;
create policy "section_join_codes_select_faculty"
  on public.section_join_codes for select
  to authenticated
  using (
    exists (
      select 1
      from public.section_memberships as sm
      join public.faculty_grants as fg on fg.user_id = (select auth.uid())
      where sm.section_id = public.section_join_codes.section_id
        and sm.user_id = (select auth.uid())
        and sm.role = 'faculty'
    )
  );
