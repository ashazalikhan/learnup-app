-- Classroom core (Act 2): institutions, sections, lab sessions, lesson opens.

do $$
begin
  if to_regprocedure('extensions.gen_random_bytes(integer)') is null then
    raise exception 'classroom migration stopped: extensions.gen_random_bytes(integer) is not installed';
  end if;
end $$;

-- institutions
create table if not exists public.institutions (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 120),
  name_key text generated always as (lower(btrim(name))) stored,
  created_at timestamptz not null default now(),
  constraint institutions_name_key_key unique (name_key)
);

-- courses
create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions (id) on delete cascade,
  code text not null check (code in ('DSA', 'DAA')),
  name text not null check (char_length(btrim(name)) between 1 and 120),
  created_at timestamptz not null default now(),
  constraint courses_institution_id_code_key unique (institution_id, code)
);

-- sections
create table if not exists public.sections (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 120),
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now()
);

-- section_join_codes
create table if not exists public.section_join_codes (
  section_id uuid primary key references public.sections (id) on delete cascade,
  code text not null check (code ~ '^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{8}$'),
  enabled boolean not null default true,
  constraint section_join_codes_code_key unique (code)
);

-- section_memberships
create table if not exists public.section_memberships (
  section_id uuid not null references public.sections (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('student', 'faculty')),
  created_at timestamptz not null default now(),
  primary key (section_id, user_id)
);

create index if not exists section_memberships_user_id_idx
  on public.section_memberships (user_id);

-- lab_sessions
create table if not exists public.lab_sessions (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.sections (id) on delete cascade,
  week_no integer not null check (week_no between 1 and 16),
  title text not null check (char_length(btrim(title)) between 1 and 120),
  starts_at timestamptz not null,
  status text not null default 'live' check (status in ('live', 'closed')),
  created_at timestamptz not null default now()
);

create index if not exists lab_sessions_section_week_starts_idx
  on public.lab_sessions (section_id, week_no, starts_at);

-- curriculum_lesson_keys — placeholder Arrays content, not the weekly MUJ DSA/DAA curriculum
create table if not exists public.curriculum_lesson_keys (
  lesson_key text primary key,
  position integer not null unique check (position >= 1)
);

insert into public.curriculum_lesson_keys (lesson_key, position)
values
  ('arrays/what-is-an-array', 1),
  ('arrays/indexing', 2),
  ('arrays/traversal', 3),
  ('arrays/sum', 4),
  ('arrays/find-max', 5),
  ('arrays/linear-search', 6),
  ('arrays/update-in-place', 7),
  ('arrays/reverse-an-array', 8),
  ('arrays/two-pointer-swap', 9),
  ('arrays/capstone-second-largest', 10)
on conflict (lesson_key) do nothing;

-- lab_session_questions
create table if not exists public.lab_session_questions (
  session_id uuid not null references public.lab_sessions (id) on delete cascade,
  lesson_key text not null references public.curriculum_lesson_keys (lesson_key),
  position integer not null check (position >= 1),
  primary key (session_id, lesson_key),
  unique (session_id, position)
);

-- lesson_opens
create table if not exists public.lesson_opens (
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_key text not null references public.curriculum_lesson_keys (lesson_key),
  opened_at timestamptz not null default now(),
  primary key (user_id, lesson_key)
);

-- RLS
alter table public.institutions enable row level security;
alter table public.courses enable row level security;
alter table public.sections enable row level security;
alter table public.section_join_codes enable row level security;
alter table public.section_memberships enable row level security;
alter table public.lab_sessions enable row level security;
alter table public.lab_session_questions enable row level security;
alter table public.curriculum_lesson_keys enable row level security;
alter table public.lesson_opens enable row level security;

drop policy if exists "institutions_select_via_membership" on public.institutions;
create policy "institutions_select_via_membership"
  on public.institutions for select
  to authenticated
  using (
    exists (
      select 1
      from public.courses as c
      join public.sections as s on s.course_id = c.id
      join public.section_memberships as sm on sm.section_id = s.id
      where c.institution_id = public.institutions.id
        and sm.user_id = (select auth.uid())
    )
  );

drop policy if exists "courses_select_via_membership" on public.courses;
create policy "courses_select_via_membership"
  on public.courses for select
  to authenticated
  using (
    exists (
      select 1
      from public.sections as s
      join public.section_memberships as sm on sm.section_id = s.id
      where s.course_id = public.courses.id
        and sm.user_id = (select auth.uid())
    )
  );

drop policy if exists "sections_select_own_membership" on public.sections;
create policy "sections_select_own_membership"
  on public.sections for select
  to authenticated
  using (
    exists (
      select 1
      from public.section_memberships as sm
      where sm.section_id = public.sections.id
        and sm.user_id = (select auth.uid())
    )
  );

drop policy if exists "section_memberships_select_own" on public.section_memberships;
create policy "section_memberships_select_own"
  on public.section_memberships for select
  to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "lab_sessions_select_member" on public.lab_sessions;
create policy "lab_sessions_select_member"
  on public.lab_sessions for select
  to authenticated
  using (
    exists (
      select 1
      from public.section_memberships as sm
      where sm.section_id = public.lab_sessions.section_id
        and sm.user_id = (select auth.uid())
    )
  );

drop policy if exists "lab_session_questions_select_member" on public.lab_session_questions;
create policy "lab_session_questions_select_member"
  on public.lab_session_questions for select
  to authenticated
  using (
    exists (
      select 1
      from public.lab_sessions as ls
      join public.section_memberships as sm on sm.section_id = ls.section_id
      where ls.id = public.lab_session_questions.session_id
        and sm.user_id = (select auth.uid())
    )
  );

drop policy if exists "curriculum_lesson_keys_select_authenticated" on public.curriculum_lesson_keys;
create policy "curriculum_lesson_keys_select_authenticated"
  on public.curriculum_lesson_keys for select
  to authenticated
  using (true);

drop policy if exists "lesson_opens_select_own" on public.lesson_opens;
create policy "lesson_opens_select_own"
  on public.lesson_opens for select
  to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "lesson_opens_insert_own" on public.lesson_opens;
create policy "lesson_opens_insert_own"
  on public.lesson_opens for insert
  to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists "lesson_opens_update_own" on public.lesson_opens;
create policy "lesson_opens_update_own"
  on public.lesson_opens for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- Table grants (hosted defaults unknown; explicit revoke then grant)
revoke all on public.institutions from public, anon, authenticated;
grant select on public.institutions to authenticated;

revoke all on public.courses from public, anon, authenticated;
grant select on public.courses to authenticated;

revoke all on public.sections from public, anon, authenticated;
grant select on public.sections to authenticated;

revoke all on public.section_join_codes from public, anon, authenticated;
grant select on public.section_join_codes to authenticated;

revoke all on public.section_memberships from public, anon, authenticated;
grant select on public.section_memberships to authenticated;

revoke all on public.lab_sessions from public, anon, authenticated;
grant select on public.lab_sessions to authenticated;

revoke all on public.lab_session_questions from public, anon, authenticated;
grant select on public.lab_session_questions to authenticated;

revoke all on public.curriculum_lesson_keys from public, anon, authenticated;
grant select on public.curriculum_lesson_keys to authenticated;

revoke all on public.lesson_opens from public, anon, authenticated;
grant select, insert, update on public.lesson_opens to authenticated;

-- generate_join_code (no EXECUTE grant to callers)
create or replace function public.generate_join_code()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  v_bytes bytea;
  v_result text := '';
  v_i integer;
begin
  v_bytes := extensions.gen_random_bytes(8);
  for v_i in 0..7 loop
    v_result := v_result || substr(v_alphabet, (get_byte(v_bytes, v_i) % 32) + 1, 1);
  end loop;
  return v_result;
end;
$$;

revoke all on function public.generate_join_code() from public, anon, authenticated;

-- join_section
create or replace function public.join_section(p_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_normalized text;
  v_section_id uuid;
begin
  if auth.uid() is null then
    raise exception using errcode = 'P0001', message = 'invalid join code';
  end if;

  if p_code is null then
    raise exception using errcode = 'P0001', message = 'invalid join code';
  end if;

  v_normalized := upper(btrim(p_code));
  if v_normalized !~ '^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{8}$' then
    raise exception using errcode = 'P0001', message = 'invalid join code';
  end if;

  select public.section_join_codes.section_id
    into v_section_id
  from public.section_join_codes
  where public.section_join_codes.code = v_normalized
    and public.section_join_codes.enabled is true;

  if v_section_id is null then
    raise exception using errcode = 'P0001', message = 'invalid join code';
  end if;

  insert into public.section_memberships (section_id, user_id, role)
  values (v_section_id, auth.uid(), 'student')
  on conflict (section_id, user_id) do nothing;

  return v_section_id;
end;
$$;

revoke all on function public.join_section(text) from public, anon;
grant execute on function public.join_section(text) to authenticated;

-- create_section
create or replace function public.create_section(
  p_institution_name text,
  p_course_code text,
  p_section_name text
)
returns table(section_id uuid, join_code text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_institution_id uuid;
  v_course_id uuid;
  v_course_name text;
  v_section_id uuid;
  v_code text;
  v_attempt integer;
  v_constraint text;
begin
  if (select auth.uid()) is null then
    raise exception 'not allowed';
  end if;

  if not exists (
    select 1 from public.faculty_grants as fg where fg.user_id = auth.uid()
  ) then
    raise exception 'not allowed';
  end if;

  if p_institution_name is null
    or char_length(btrim(p_institution_name)) < 1
    or char_length(btrim(p_institution_name)) > 120 then
    raise exception 'invalid section';
  end if;

  if p_course_code is null or p_course_code not in ('DSA', 'DAA') then
    raise exception 'invalid section';
  end if;

  if p_section_name is null
    or char_length(btrim(p_section_name)) < 1
    or char_length(btrim(p_section_name)) > 120 then
    raise exception 'invalid section';
  end if;

  v_course_name := case p_course_code
    when 'DSA' then 'Data Structures and Algorithms'
    when 'DAA' then 'Design and Analysis of Algorithms'
  end;

  insert into public.institutions (name)
  values (btrim(p_institution_name))
  on conflict (name_key) do nothing
  returning public.institutions.id into v_institution_id;

  if v_institution_id is null then
    select public.institutions.id
      into v_institution_id
    from public.institutions
    where public.institutions.name_key = lower(btrim(p_institution_name));
  end if;

  insert into public.courses (institution_id, code, name)
  values (v_institution_id, p_course_code, v_course_name)
  on conflict on constraint courses_institution_id_code_key do nothing
  returning public.courses.id into v_course_id;

  if v_course_id is null then
    select public.courses.id
      into v_course_id
    from public.courses
    where public.courses.institution_id = v_institution_id
      and public.courses.code = p_course_code;
  end if;

  for v_attempt in 1..8 loop
    begin
      v_code := public.generate_join_code();
      insert into public.sections (course_id, name, created_by)
      values (v_course_id, btrim(p_section_name), auth.uid())
      returning public.sections.id into v_section_id;

      insert into public.section_join_codes (section_id, code, enabled)
      values (v_section_id, v_code, true);

      insert into public.section_memberships (section_id, user_id, role)
      values (v_section_id, auth.uid(), 'faculty');

      return query select v_section_id, v_code;
      return;
    exception
      when unique_violation then
        get stacked diagnostics v_constraint = constraint_name;
        if v_constraint = 'section_join_codes_code_key' then
          continue;
        end if;
        raise;
    end;
  end loop;

  raise exception 'could not allocate join code';
end;
$$;

revoke all on function public.create_section(text, text, text) from public, anon;
grant execute on function public.create_section(text, text, text) to authenticated;

-- rotate_join_code
create or replace function public.rotate_join_code(p_section_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_old_code text;
  v_code text;
  v_attempt integer;
  v_constraint text;
begin
  if (select auth.uid()) is null then
    raise exception 'not allowed';
  end if;

  if not exists (
    select 1 from public.faculty_grants as fg where fg.user_id = auth.uid()
  ) then
    raise exception 'not allowed';
  end if;

  if not exists (
    select 1
    from public.section_memberships as sm
    where sm.section_id = p_section_id
      and sm.user_id = auth.uid()
      and sm.role = 'faculty'
  ) then
    raise exception 'not allowed';
  end if;

  select public.section_join_codes.code
    into v_old_code
  from public.section_join_codes
  where public.section_join_codes.section_id = p_section_id;

  if v_old_code is null then
    raise exception 'not allowed';
  end if;

  for v_attempt in 1..8 loop
    begin
      loop
        v_code := public.generate_join_code();
        if v_code <> v_old_code then
          exit;
        end if;
      end loop;

      update public.section_join_codes as c
      set code = v_code
      where c.section_id = p_section_id;

      return v_code;
    exception
      when unique_violation then
        get stacked diagnostics v_constraint = constraint_name;
        if v_constraint = 'section_join_codes_code_key' then
          continue;
        end if;
        raise;
    end;
  end loop;

  raise exception 'could not allocate join code';
end;
$$;

revoke all on function public.rotate_join_code(uuid) from public, anon;
grant execute on function public.rotate_join_code(uuid) to authenticated;

-- set_join_enabled
create or replace function public.set_join_enabled(p_section_id uuid, p_enabled boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if (select auth.uid()) is null then
    raise exception 'not allowed';
  end if;

  if not exists (
    select 1 from public.faculty_grants as fg where fg.user_id = auth.uid()
  ) then
    raise exception 'not allowed';
  end if;

  if not exists (
    select 1
    from public.section_memberships as sm
    where sm.section_id = p_section_id
      and sm.user_id = auth.uid()
      and sm.role = 'faculty'
  ) then
    raise exception 'not allowed';
  end if;

  if p_enabled is null then
    raise exception 'invalid section';
  end if;

  update public.section_join_codes as c
  set enabled = p_enabled
  where c.section_id = p_section_id;
end;
$$;

revoke all on function public.set_join_enabled(uuid, boolean) from public, anon;
grant execute on function public.set_join_enabled(uuid, boolean) to authenticated;

-- create_lab_session
create or replace function public.create_lab_session(
  p_section_id uuid,
  p_week_no integer,
  p_title text,
  p_starts_at timestamptz,
  p_lesson_keys text[]
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session_id uuid;
  v_key text;
  v_pos integer;
  v_seen text[] := '{}';
begin
  if (select auth.uid()) is null then
    raise exception 'not allowed';
  end if;

  if not exists (
    select 1 from public.faculty_grants as fg where fg.user_id = auth.uid()
  ) then
    raise exception 'not allowed';
  end if;

  if not exists (
    select 1
    from public.section_memberships as sm
    where sm.section_id = p_section_id
      and sm.user_id = auth.uid()
      and sm.role = 'faculty'
  ) then
    raise exception 'not allowed';
  end if;

  if p_week_no is null or p_week_no < 1 or p_week_no > 16 then
    raise exception 'invalid session';
  end if;

  if p_title is null
    or char_length(btrim(p_title)) < 1
    or char_length(btrim(p_title)) > 120 then
    raise exception 'invalid session';
  end if;

  if p_starts_at is null then
    raise exception 'invalid session';
  end if;

  if p_lesson_keys is null
    or array_length(p_lesson_keys, 1) is null
    or array_length(p_lesson_keys, 1) < 1
    or array_length(p_lesson_keys, 1) > 10 then
    raise exception 'invalid questions';
  end if;

  foreach v_key in array p_lesson_keys loop
    if v_key is null then
      raise exception 'invalid questions';
    end if;
    if v_key = any (v_seen) then
      raise exception 'invalid questions';
    end if;
    if not exists (
      select 1
      from public.curriculum_lesson_keys as clk
      where clk.lesson_key = v_key
    ) then
      raise exception 'invalid questions';
    end if;
    v_seen := array_append(v_seen, v_key);
  end loop;

  insert into public.lab_sessions (section_id, week_no, title, starts_at, status)
  values (p_section_id, p_week_no, btrim(p_title), p_starts_at, 'live')
  returning public.lab_sessions.id into v_session_id;

  v_pos := 0;
  foreach v_key in array p_lesson_keys loop
    v_pos := v_pos + 1;
    insert into public.lab_session_questions (session_id, lesson_key, position)
    values (v_session_id, v_key, v_pos);
  end loop;

  return v_session_id;
end;
$$;

revoke all on function public.create_lab_session(uuid, integer, text, timestamptz, text[]) from public, anon;
grant execute on function public.create_lab_session(uuid, integer, text, timestamptz, text[]) to authenticated;

-- set_lab_session_status
create or replace function public.set_lab_session_status(p_session_id uuid, p_status text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_section_id uuid;
  v_stored text;
begin
  if (select auth.uid()) is null then
    raise exception 'not allowed';
  end if;

  if not exists (
    select 1 from public.faculty_grants as fg where fg.user_id = auth.uid()
  ) then
    raise exception 'not allowed';
  end if;

  select public.lab_sessions.section_id
    into v_section_id
  from public.lab_sessions
  where public.lab_sessions.id = p_session_id;

  if v_section_id is null then
    raise exception 'not allowed';
  end if;

  if not exists (
    select 1
    from public.section_memberships as sm
    where sm.section_id = v_section_id
      and sm.user_id = auth.uid()
      and sm.role = 'faculty'
  ) then
    raise exception 'not allowed';
  end if;

  if p_status is null or p_status not in ('live', 'closed') then
    raise exception 'invalid session';
  end if;

  update public.lab_sessions as ls
  set status = p_status
  where ls.id = p_session_id
  returning ls.status into v_stored;

  return v_stored;
end;
$$;

revoke all on function public.set_lab_session_status(uuid, text) from public, anon;
grant execute on function public.set_lab_session_status(uuid, text) to authenticated;

-- session_roster
create or replace function public.session_roster(p_session_id uuid)
returns table(user_id uuid, display_name text, questions jsonb)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_section_id uuid;
begin
  if (select auth.uid()) is null then
    raise exception 'not allowed';
  end if;

  if not exists (
    select 1 from public.faculty_grants as fg where fg.user_id = auth.uid()
  ) then
    raise exception 'not allowed';
  end if;

  select public.lab_sessions.section_id
    into v_section_id
  from public.lab_sessions
  where public.lab_sessions.id = p_session_id;

  if v_section_id is null then
    raise exception 'not allowed';
  end if;

  if not exists (
    select 1
    from public.section_memberships as sm
    where sm.section_id = v_section_id
      and sm.user_id = auth.uid()
      and sm.role = 'faculty'
  ) then
    raise exception 'not allowed';
  end if;

  return query
  select
    sm.user_id,
    coalesce(p.display_name, 'Student') as display_name,
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'lesson_key', lq.lesson_key,
            'position', lq.position,
            'status',
            case
              when exists (
                select 1
                from public.user_lesson_progress as ulp
                where ulp.user_id = sm.user_id
                  and ulp.lesson_key = lq.lesson_key
                  and ulp.status = 'completed'
              )
              or exists (
                select 1
                from public.lesson_attempts as la
                where la.user_id = sm.user_id
                  and la.lesson_key = lq.lesson_key
                  and la.passed is true
              ) then 'passed'
              when exists (
                select 1
                from public.lesson_attempts as la
                where la.user_id = sm.user_id
                  and la.lesson_key = lq.lesson_key
              )
              or exists (
                select 1
                from public.user_lesson_progress as ulp
                where ulp.user_id = sm.user_id
                  and ulp.lesson_key = lq.lesson_key
              ) then 'submitted'
              when exists (
                select 1
                from public.lesson_opens as lo
                where lo.user_id = sm.user_id
                  and lo.lesson_key = lq.lesson_key
              ) then 'opened'
              else 'not_started'
            end
          )
          order by lq.position
        )
        from public.lab_session_questions as lq
        where lq.session_id = p_session_id
      ),
      '[]'::jsonb
    ) as questions
  from public.section_memberships as sm
  left join public.profiles as p on p.id = sm.user_id
  where sm.section_id = v_section_id
    and sm.role = 'student';
end;
$$;

revoke all on function public.session_roster(uuid) from public, anon;
grant execute on function public.session_roster(uuid) to authenticated;

-- my_faculty_sections
create or replace function public.my_faculty_sections()
returns table(
  section_id uuid,
  section_name text,
  institution_name text,
  course_code text,
  course_name text,
  join_code text,
  join_enabled boolean,
  student_count integer
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if (select auth.uid()) is null then
    raise exception 'not allowed';
  end if;

  if not exists (
    select 1 from public.faculty_grants as fg where fg.user_id = auth.uid()
  ) then
    raise exception 'not allowed';
  end if;

  return query
  select
    s.id as section_id,
    s.name as section_name,
    i.name as institution_name,
    c.code as course_code,
    c.name as course_name,
    jc.code as join_code,
    jc.enabled as join_enabled,
    (
      select count(*)::integer
      from public.section_memberships as sm2
      where sm2.section_id = s.id
        and sm2.role = 'student'
    ) as student_count
  from public.section_memberships as sm
  join public.sections as s on s.id = sm.section_id
  join public.courses as c on c.id = s.course_id
  join public.institutions as i on i.id = c.institution_id
  left join public.section_join_codes as jc on jc.section_id = s.id
  where sm.user_id = auth.uid()
    and sm.role = 'faculty';
end;
$$;

revoke all on function public.my_faculty_sections() from public, anon;
grant execute on function public.my_faculty_sections() to authenticated;
