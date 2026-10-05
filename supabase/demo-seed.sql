-- Run the whole file in the hosted SQL editor as a privileged role.
-- A raised setup leaves nothing committed. A second successful run changes nothing
-- (does not rotate codes, reset session status/starts_at, or overwrite fixture names).

begin;

do $$
declare
  v_demo_email text := 'REPLACE_WITH_DEMO_EMAIL';
  v_demo_user uuid;
  v_role text;
  v_inst uuid := '11111111-1111-4111-8111-111111111111';
  v_dsa uuid := '22222222-2222-4222-8222-222222222221';
  v_daa uuid := '22222222-2222-4222-8222-222222222222';
  v_section uuid := '33333333-3333-4333-8333-333333333333';
  v_session uuid := '44444444-4444-4444-8444-444444444444';
  v_code text;
  v_attempt integer;
  v_constraint text;
  v_row record;
begin
  select u.id into v_demo_user from auth.users as u where u.email = v_demo_email;
  if v_demo_user is null then
    raise exception 'DEMO setup stopped: no auth user with email %', v_demo_email;
  end if;

  -- institution
  select * into v_row from public.institutions as i where i.id = v_inst;
  if not found then
    select * into v_row from public.institutions as i where i.name_key = 'demo college';
    if found then
      if v_row.id <> v_inst or v_row.name <> 'DEMO College' then
        raise exception 'DEMO setup stopped: fixture id or name_key collides with a nonmatching row';
      end if;
    else
      insert into public.institutions (id, name) values (v_inst, 'DEMO College');
    end if;
  elsif v_row.name <> 'DEMO College' or v_row.name_key <> 'demo college' then
    raise exception 'DEMO setup stopped: fixture id or name_key collides with a nonmatching row';
  end if;

  -- DSA course
  select * into v_row from public.courses as c where c.id = v_dsa;
  if not found then
    select * into v_row
    from public.courses as c
    where c.institution_id = v_inst and c.code = 'DSA';
    if found then
      if v_row.id <> v_dsa or v_row.name <> 'DEMO DSA' then
        raise exception 'DEMO setup stopped: fixture id or name_key collides with a nonmatching row';
      end if;
    else
      insert into public.courses (id, institution_id, code, name)
      values (v_dsa, v_inst, 'DSA', 'DEMO DSA');
    end if;
  elsif v_row.institution_id <> v_inst or v_row.code <> 'DSA' or v_row.name <> 'DEMO DSA' then
    raise exception 'DEMO setup stopped: fixture id or name_key collides with a nonmatching row';
  end if;

  -- DAA course
  select * into v_row from public.courses as c where c.id = v_daa;
  if not found then
    select * into v_row
    from public.courses as c
    where c.institution_id = v_inst and c.code = 'DAA';
    if found then
      if v_row.id <> v_daa or v_row.name <> 'DEMO DAA' then
        raise exception 'DEMO setup stopped: fixture id or name_key collides with a nonmatching row';
      end if;
    else
      insert into public.courses (id, institution_id, code, name)
      values (v_daa, v_inst, 'DAA', 'DEMO DAA');
    end if;
  elsif v_row.institution_id <> v_inst or v_row.code <> 'DAA' or v_row.name <> 'DEMO DAA' then
    raise exception 'DEMO setup stopped: fixture id or name_key collides with a nonmatching row';
  end if;

  -- section
  select * into v_row from public.sections as s where s.id = v_section;
  if not found then
    insert into public.sections (id, course_id, name, created_by)
    values (v_section, v_dsa, 'DEMO Section A', v_demo_user);
  elsif v_row.course_id <> v_dsa or v_row.name <> 'DEMO Section A' or v_row.created_by <> v_demo_user then
    raise exception 'DEMO setup stopped: fixture id or name_key collides with a nonmatching row';
  end if;

  -- session (leave status and starts_at unchanged on rerun)
  select * into v_row from public.lab_sessions as ls where ls.id = v_session;
  if not found then
    insert into public.lab_sessions (id, section_id, week_no, title, starts_at, status)
    values (
      v_session,
      v_section,
      1,
      'DEMO Arrays lab',
      timestamptz '2026-10-06 09:00:00+05:30',
      'live'
    );
  elsif v_row.section_id <> v_section
    or v_row.week_no <> 1
    or v_row.title <> 'DEMO Arrays lab' then
    raise exception 'DEMO setup stopped: fixture id or name_key collides with a nonmatching row';
  end if;

  -- questions
  perform 1 from public.lab_session_questions as lq
  where lq.session_id = v_session and lq.lesson_key = 'arrays/what-is-an-array' and lq.position = 1;
  if not found then
    if exists (
      select 1 from public.lab_session_questions as lq
      where lq.session_id = v_session and (lq.lesson_key, lq.position) <> ('arrays/what-is-an-array', 1)
    ) then
      raise exception 'DEMO setup stopped: fixture id or name_key collides with a nonmatching row';
    end if;
    insert into public.lab_session_questions (session_id, lesson_key, position)
    values (v_session, 'arrays/what-is-an-array', 1);
  end if;

  perform 1 from public.lab_session_questions as lq
  where lq.session_id = v_session and lq.lesson_key = 'arrays/indexing' and lq.position = 2;
  if not found then
    if exists (
      select 1 from public.lab_session_questions as lq
      where lq.session_id = v_session and lq.position = 2 and lq.lesson_key <> 'arrays/indexing'
    ) then
      raise exception 'DEMO setup stopped: fixture id or name_key collides with a nonmatching row';
    end if;
    insert into public.lab_session_questions (session_id, lesson_key, position)
    values (v_session, 'arrays/indexing', 2);
  end if;

  perform 1 from public.lab_session_questions as lq
  where lq.session_id = v_session and lq.lesson_key = 'arrays/traversal' and lq.position = 3;
  if not found then
    if exists (
      select 1 from public.lab_session_questions as lq
      where lq.session_id = v_session and lq.position = 3 and lq.lesson_key <> 'arrays/traversal'
    ) then
      raise exception 'DEMO setup stopped: fixture id or name_key collides with a nonmatching row';
    end if;
    insert into public.lab_session_questions (session_id, lesson_key, position)
    values (v_session, 'arrays/traversal', 3);
  end if;

  select sm.role into v_role
  from public.section_memberships as sm
  where sm.section_id = v_section and sm.user_id = v_demo_user;

  if v_role is not null and v_role <> 'faculty' then
    raise exception 'DEMO setup stopped: that user is already a non-faculty member of the demo section';
  end if;

  if not exists (select 1 from public.faculty_grants as fg where fg.user_id = v_demo_user) then
    insert into public.faculty_grants (user_id) values (v_demo_user);
  end if;

  if v_role is null then
    insert into public.section_memberships (section_id, user_id, role)
    values (v_section, v_demo_user, 'faculty');
  end if;

  if not exists (select 1 from public.section_join_codes as jc where jc.section_id = v_section) then
    for v_attempt in 1..8 loop
      begin
        v_code := public.generate_join_code();
        insert into public.section_join_codes (section_id, code, enabled)
        values (v_section, v_code, true);
        exit;
      exception
        when unique_violation then
          get stacked diagnostics v_constraint = constraint_name;
          if v_constraint = 'section_join_codes_code_key' then
            continue;
          end if;
          raise;
      end;
    end loop;
    if not exists (select 1 from public.section_join_codes as jc where jc.section_id = v_section) then
      raise exception 'could not allocate join code';
    end if;
  end if;
end $$;

commit;
