-- Manual demo teardown. Not auto-run.
-- If an uncaught error stops the editor before COMMIT, run ROLLBACK; yourself.
-- Does not delete faculty_grants, profiles, lesson_attempts, user_lesson_progress,
-- lesson_opens, or auth.users.

begin;

do $$
declare
  v_inst uuid := '11111111-1111-4111-8111-111111111111';
  v_dsa uuid := '22222222-2222-4222-8222-222222222221';
  v_daa uuid := '22222222-2222-4222-8222-222222222222';
  v_section uuid := '33333333-3333-4333-8333-333333333333';
  v_session uuid := '44444444-4444-4444-8444-444444444444';
  v_any boolean;
  v_row record;
  v_memberships integer;
  v_join_codes integer;
begin
  v_any := exists (select 1 from public.institutions as i where i.id = v_inst)
    or exists (select 1 from public.courses as c where c.id in (v_dsa, v_daa))
    or exists (select 1 from public.sections as s where s.id = v_section)
    or exists (select 1 from public.lab_sessions as ls where ls.id = v_session);

  if not v_any then
    raise notice 'DEMO cleanup: already absent';
    return;
  end if;

  if not exists (select 1 from public.institutions as i where i.id = v_inst) then
    raise exception 'DEMO cleanup stopped: partial or mismatched fixtures';
  end if;

  select * into v_row from public.institutions as i where i.id = v_inst for update;

  if v_row.name <> 'DEMO College' then
    raise exception 'DEMO cleanup stopped: partial or mismatched fixtures';
  end if;

  perform 1 from public.courses as c where c.id = v_dsa for update;
  perform 1 from public.courses as c where c.id = v_daa for update;
  perform 1 from public.sections as s where s.id = v_section for update;
  perform 1 from public.lab_sessions as ls where ls.id = v_session for update;

  if not exists (select 1 from public.courses as c where c.id = v_dsa) then
    raise exception 'DEMO cleanup stopped: partial or mismatched fixtures';
  end if;
  select * into v_row from public.courses as c where c.id = v_dsa;
  if v_row.institution_id <> v_inst or v_row.code <> 'DSA' or v_row.name <> 'DEMO DSA' then
    raise exception 'DEMO cleanup stopped: partial or mismatched fixtures';
  end if;

  if not exists (select 1 from public.courses as c where c.id = v_daa) then
    raise exception 'DEMO cleanup stopped: partial or mismatched fixtures';
  end if;
  select * into v_row from public.courses as c where c.id = v_daa;
  if v_row.institution_id <> v_inst or v_row.code <> 'DAA' or v_row.name <> 'DEMO DAA' then
    raise exception 'DEMO cleanup stopped: partial or mismatched fixtures';
  end if;

  if not exists (select 1 from public.sections as s where s.id = v_section) then
    raise exception 'DEMO cleanup stopped: partial or mismatched fixtures';
  end if;
  select * into v_row from public.sections as s where s.id = v_section;
  if v_row.course_id <> v_dsa or v_row.name <> 'DEMO Section A' then
    raise exception 'DEMO cleanup stopped: partial or mismatched fixtures';
  end if;

  if not exists (select 1 from public.lab_sessions as ls where ls.id = v_session) then
    raise exception 'DEMO cleanup stopped: partial or mismatched fixtures';
  end if;
  select * into v_row from public.lab_sessions as ls where ls.id = v_session;
  if v_row.section_id <> v_section or v_row.title <> 'DEMO Arrays lab' then
    raise exception 'DEMO cleanup stopped: partial or mismatched fixtures';
  end if;

  if not exists (
    select 1 from public.lab_session_questions as lq
    where lq.session_id = v_session and lq.lesson_key = 'arrays/what-is-an-array' and lq.position = 1
  ) then
    raise exception 'DEMO cleanup stopped: partial or mismatched fixtures';
  end if;
  if not exists (
    select 1 from public.lab_session_questions as lq
    where lq.session_id = v_session and lq.lesson_key = 'arrays/indexing' and lq.position = 2
  ) then
    raise exception 'DEMO cleanup stopped: partial or mismatched fixtures';
  end if;
  if not exists (
    select 1 from public.lab_session_questions as lq
    where lq.session_id = v_session and lq.lesson_key = 'arrays/traversal' and lq.position = 3
  ) then
    raise exception 'DEMO cleanup stopped: partial or mismatched fixtures';
  end if;

  if exists (
    select 1 from public.courses as c
    where c.institution_id = v_inst and c.id not in (v_dsa, v_daa)
  ) then
    raise exception 'DEMO cleanup stopped: partial or mismatched fixtures';
  end if;

  if exists (
    select 1 from public.sections as s
    where s.course_id in (v_dsa, v_daa) and s.id <> v_section
  ) then
    raise exception 'DEMO cleanup stopped: partial or mismatched fixtures';
  end if;

  if exists (
    select 1 from public.lab_sessions as ls
    where ls.section_id = v_section and ls.id <> v_session
  ) then
    raise exception 'DEMO cleanup stopped: partial or mismatched fixtures';
  end if;

  if exists (
    select 1 from public.lab_session_questions as lq
    where lq.session_id = v_session
      and (lq.lesson_key, lq.position) not in (
        ('arrays/what-is-an-array', 1),
        ('arrays/indexing', 2),
        ('arrays/traversal', 3)
      )
  ) then
    raise exception 'DEMO cleanup stopped: partial or mismatched fixtures';
  end if;

  select count(*) into v_memberships
  from public.section_memberships as sm
  where sm.section_id = v_section;

  select count(*) into v_join_codes
  from public.section_join_codes as jc
  where jc.section_id = v_section;

  raise notice 'DEMO cleanup preview: institution=%, courses=2, section=%, memberships=%, join_codes=%, session=%, questions=3',
    v_inst, v_section, v_memberships, v_join_codes, v_session;

  delete from public.institutions as i
  where i.id = v_inst and i.name = 'DEMO College';
end $$;

commit;
