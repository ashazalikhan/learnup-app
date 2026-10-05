-- Manual classroom isolation proofs (hosted SQL editor, after migrations). Not a migration.
-- Does not depend on demo-seed.sql. If the editor stops before the last line, run ROLLBACK; yourself.
-- Success: notice classroom isolation proofs passed, then this script's rollback.
--
-- Register faculty A, faculty B, student S, student T in the app and set the four emails below.
-- Students S and T must not already have faculty_grants rows before you run this script.

begin;

do $proof$
declare
  v_faculty_a_email text := 'REPLACE_FACULTY_A_EMAIL';
  v_faculty_b_email text := 'REPLACE_FACULTY_B_EMAIL';
  v_student_s_email text := 'REPLACE_STUDENT_S_EMAIL';
  v_student_t_email text := 'REPLACE_STUDENT_T_EMAIL';

  v_a uuid;
  v_b uuid;
  v_s uuid;
  v_t uuid;

  v_sqlstate text;
  v_sqlerrm text;
  v_invalid_msg text;

  v_inst_a uuid;
  v_inst_b uuid;
  v_course_a uuid;
  v_course_b uuid;
  v_section_a uuid;
  v_section_b uuid;
  v_session_a uuid;
  v_session_b uuid;
  v_code_a text;
  v_code_b text;
  v_old_code_a text;
  v_new_code_a text;
  v_joined uuid;
  v_cnt integer;
  v_questions jsonb;
  v_status text;
  v_inst_proof uuid := 'e7e7e7e7-e7e7-4e7e-8e7e-e7e7e7e7e7e1';
  v_inst_proof_name text := 'Proof Reuse Unique College';
  v_reuse_section uuid;
  v_stored_name text;
  v_stored_course text;
  v_session_new uuid;
  v_tbl text;
  v_tables text[] := array[
    'institutions','courses','sections','section_join_codes','section_memberships',
    'lab_sessions','lab_session_questions','curriculum_lesson_keys','lesson_opens','faculty_grants'
  ];
begin
  select u.id into v_a from auth.users as u where u.email = v_faculty_a_email;
  select u.id into v_b from auth.users as u where u.email = v_faculty_b_email;
  select u.id into v_s from auth.users as u where u.email = v_student_s_email;
  select u.id into v_t from auth.users as u where u.email = v_student_t_email;

  if v_a is null or v_b is null or v_s is null or v_t is null then
    raise exception 'proof setup stopped: register four distinct accounts and set their emails';
  end if;
  if v_a in (v_b, v_s, v_t) or v_b in (v_s, v_t) or v_s = v_t then
    raise exception 'proof setup stopped: register four distinct accounts and set their emails';
  end if;
  if exists (select 1 from public.faculty_grants as fg where fg.user_id in (v_s, v_t)) then
    raise exception 'proof setup stopped: students S and T must not already hold faculty grants';
  end if;

  foreach v_tbl in array v_tables loop
    if not has_table_privilege('authenticated', 'public.' || v_tbl, 'SELECT') then
      raise exception 'authenticated missing SELECT on %', v_tbl;
    end if;
    if v_tbl = 'lesson_opens' then
      if not has_table_privilege('authenticated', 'public.lesson_opens', 'INSERT')
        or not has_table_privilege('authenticated', 'public.lesson_opens', 'UPDATE')
        or has_table_privilege('authenticated', 'public.lesson_opens', 'DELETE')
        or has_table_privilege('authenticated', 'public.lesson_opens', 'TRUNCATE') then
        raise exception 'lesson_opens privilege mismatch';
      end if;
    elsif has_table_privilege('authenticated', 'public.' || v_tbl, 'INSERT')
      or has_table_privilege('authenticated', 'public.' || v_tbl, 'UPDATE')
      or has_table_privilege('authenticated', 'public.' || v_tbl, 'DELETE')
      or has_table_privilege('authenticated', 'public.' || v_tbl, 'TRUNCATE') then
      raise exception 'authenticated has unexpected write on %', v_tbl;
    end if;
    if has_table_privilege('anon', 'public.' || v_tbl, 'SELECT')
      or has_table_privilege('anon', 'public.' || v_tbl, 'INSERT') then
      raise exception 'anon has privilege on %', v_tbl;
    end if;
  end loop;

  insert into public.faculty_grants (user_id) values (v_a) on conflict do nothing;
  insert into public.faculty_grants (user_id) values (v_b) on conflict do nothing;

  insert into public.institutions (name) values ('Proof Iso College A') returning id into v_inst_a;
  insert into public.institutions (name) values ('Proof Iso College B') returning id into v_inst_b;
  insert into public.courses (institution_id, code, name)
  values (v_inst_a, 'DSA', 'Proof DSA A') returning id into v_course_a;
  insert into public.courses (institution_id, code, name)
  values (v_inst_b, 'DSA', 'Proof DSA B') returning id into v_course_b;

  insert into public.sections (course_id, name, created_by)
  values (v_course_a, 'Proof Section A', v_a) returning id into v_section_a;
  insert into public.sections (course_id, name, created_by)
  values (v_course_b, 'Proof Section B', v_b) returning id into v_section_b;

  v_code_a := public.generate_join_code();
  v_code_b := public.generate_join_code();
  insert into public.section_join_codes (section_id, code, enabled)
  values (v_section_a, v_code_a, true), (v_section_b, v_code_b, true);

  insert into public.section_memberships (section_id, user_id, role) values
    (v_section_a, v_a, 'faculty'),
    (v_section_b, v_b, 'faculty'),
    (v_section_a, v_s, 'student'),
    (v_section_b, v_t, 'student');

  insert into public.lab_sessions (section_id, week_no, title, starts_at, status)
  values (v_section_a, 1, 'Proof Session A', now(), 'live') returning id into v_session_a;
  insert into public.lab_sessions (section_id, week_no, title, starts_at, status)
  values (v_section_b, 1, 'Proof Session B', now(), 'live') returning id into v_session_b;

  insert into public.lab_session_questions (session_id, lesson_key, position) values
    (v_session_a, 'arrays/what-is-an-array', 1),
    (v_session_a, 'arrays/indexing', 2),
    (v_session_b, 'arrays/traversal', 1),
    (v_session_b, 'arrays/sum', 2);

  -- join_section: bad format
  perform set_config('request.jwt.claim.sub', v_s::text, true);
  perform set_config('request.jwt.claims', json_build_object('sub', v_s, 'role', 'authenticated')::text, true);
  set local role authenticated;
  v_sqlstate := null; v_sqlerrm := null;
  begin perform public.join_section('BADCODE1'); exception when others then v_sqlstate := sqlstate; v_sqlerrm := sqlerrm; end;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true); perform set_config('request.jwt.claims', '', true);
  if v_sqlstate is null then raise exception 'expected denial was missing'; end if;
  v_invalid_msg := v_sqlerrm;

  -- valid format, nonexistent code
  perform set_config('request.jwt.claim.sub', v_s::text, true);
  perform set_config('request.jwt.claims', json_build_object('sub', v_s, 'role', 'authenticated')::text, true);
  set local role authenticated;
  v_sqlstate := null; v_sqlerrm := null;
  begin perform public.join_section('ABCDEFGH'); exception when others then v_sqlstate := sqlstate; v_sqlerrm := sqlerrm; end;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true); perform set_config('request.jwt.claims', '', true);
  if v_sqlstate is null or v_sqlerrm <> v_invalid_msg or v_sqlstate <> 'P0001' then
    raise exception 'nonexistent code message mismatch';
  end if;

  -- S joins A (already member) idempotent
  perform set_config('request.jwt.claim.sub', v_s::text, true);
  perform set_config('request.jwt.claims', json_build_object('sub', v_s, 'role', 'authenticated')::text, true);
  set local role authenticated;
  v_joined := public.join_section(v_code_a);
  if v_joined <> v_section_a then raise exception 'join A failed'; end if;
  v_joined := public.join_section(v_code_a);
  if v_joined <> v_section_a then raise exception 'join A idempotent failed'; end if;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true); perform set_config('request.jwt.claims', '', true);

  -- S cannot see B assets
  perform set_config('request.jwt.claim.sub', v_s::text, true);
  perform set_config('request.jwt.claims', json_build_object('sub', v_s, 'role', 'authenticated')::text, true);
  set local role authenticated;
  select count(*) into v_cnt from public.sections as s where s.id = v_section_b;
  if v_cnt <> 0 then raise exception 'S saw section B'; end if;
  select count(*) into v_cnt from public.lab_sessions as ls where ls.section_id = v_section_b;
  if v_cnt <> 0 then raise exception 'S saw session B'; end if;
  select count(*) into v_cnt from public.lab_session_questions as lq where lq.session_id = v_session_b;
  if v_cnt <> 0 then raise exception 'S saw questions B'; end if;
  select count(*) into v_cnt from public.section_join_codes as jc where jc.section_id = v_section_b;
  if v_cnt <> 0 then raise exception 'S saw join code B'; end if;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true); perform set_config('request.jwt.claims', '', true);

  -- roster denials for S
  perform set_config('request.jwt.claim.sub', v_s::text, true);
  perform set_config('request.jwt.claims', json_build_object('sub', v_s, 'role', 'authenticated')::text, true);
  set local role authenticated;
  v_sqlstate := null;
  begin perform public.session_roster(v_session_a); exception when others then v_sqlstate := sqlstate; end;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true); perform set_config('request.jwt.claims', '', true);
  if v_sqlstate is null then raise exception 'expected denial was missing'; end if;

  -- faculty_grants / membership insert denials for S
  perform set_config('request.jwt.claim.sub', v_s::text, true);
  perform set_config('request.jwt.claims', json_build_object('sub', v_s, 'role', 'authenticated')::text, true);
  set local role authenticated;
  v_sqlstate := null;
  begin insert into public.faculty_grants (user_id) values (v_s); exception when others then v_sqlstate := sqlstate; end;
  if v_sqlstate is null or v_sqlstate <> '42501' then raise exception 'expected denial was missing'; end if;
  v_sqlstate := null;
  begin insert into public.section_memberships (section_id, user_id, role) values (v_section_b, v_s, 'faculty');
  exception when others then v_sqlstate := sqlstate; end;
  if v_sqlstate is null or v_sqlstate <> '42501' then raise exception 'expected denial was missing'; end if;
  v_sqlstate := null;
  begin update public.section_memberships as sm set role = 'faculty' where sm.section_id = v_section_a and sm.user_id = v_s;
  exception when others then v_sqlstate := sqlstate; end;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true); perform set_config('request.jwt.claims', '', true);
  if v_sqlstate is null or v_sqlstate <> '42501' then raise exception 'expected denial was missing'; end if;
  if exists (
    select 1 from public.section_memberships as sm
    where sm.section_id = v_section_a and sm.user_id = v_s and sm.role <> 'student'
  ) then
    raise exception 'S role changed';
  end if;

  -- A roster on A session
  perform set_config('request.jwt.claim.sub', v_a::text, true);
  perform set_config('request.jwt.claims', json_build_object('sub', v_a, 'role', 'authenticated')::text, true);
  set local role authenticated;
  select count(*) into v_cnt from public.session_roster(v_session_a) as r;
  if v_cnt <> 1 then raise exception 'roster row count'; end if;
  select r.questions into v_questions from public.session_roster(v_session_a) as r limit 1;
  if jsonb_array_length(v_questions) <> 2 then raise exception 'roster questions length'; end if;
  insert into public.lesson_attempts (user_id, lesson_key, language, passed) values
    (v_s, 'arrays/what-is-an-array', 'javascript', false),
    (v_s, 'arrays/what-is-an-array', 'javascript', false),
    (v_s, 'arrays/what-is-an-array', 'javascript', true);
  select r.questions into v_questions from public.session_roster(v_session_a) as r limit 1;
  if jsonb_array_length(v_questions) <> 2 then raise exception 'roster length after attempts'; end if;
  select (elem->>'status') into v_status
  from public.session_roster(v_session_a) as r,
  lateral jsonb_array_elements(r.questions) as elem
  where elem->>'lesson_key' = 'arrays/what-is-an-array' limit 1;
  if v_status not in ('passed', 'submitted') then raise exception 'roster status after attempts'; end if;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true); perform set_config('request.jwt.claims', '', true);

  delete from public.profiles as p where p.id = v_s;
  perform set_config('request.jwt.claim.sub', v_a::text, true);
  perform set_config('request.jwt.claims', json_build_object('sub', v_a, 'role', 'authenticated')::text, true);
  set local role authenticated;
  select r.display_name into v_stored_name from public.session_roster(v_session_a) as r limit 1;
  if v_stored_name <> 'Student' then raise exception 'missing profile display_name'; end if;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true); perform set_config('request.jwt.claims', '', true);

  -- A cannot roster B
  perform set_config('request.jwt.claim.sub', v_a::text, true);
  perform set_config('request.jwt.claims', json_build_object('sub', v_a, 'role', 'authenticated')::text, true);
  set local role authenticated;
  v_sqlstate := null;
  begin perform public.session_roster(v_session_b); exception when others then v_sqlstate := sqlstate; end;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true); perform set_config('request.jwt.claims', '', true);
  if v_sqlstate is null then raise exception 'expected denial was missing'; end if;

  -- A cannot read T profile or attempts
  perform set_config('request.jwt.claim.sub', v_a::text, true);
  perform set_config('request.jwt.claims', json_build_object('sub', v_a, 'role', 'authenticated')::text, true);
  set local role authenticated;
  select count(*) into v_cnt from public.profiles as p where p.id = v_t;
  if v_cnt <> 0 then raise exception 'A read T profile'; end if;
  select count(*) into v_cnt from public.lesson_attempts as la where la.user_id = v_t;
  if v_cnt <> 0 then raise exception 'A read T attempts'; end if;
  select count(*) into v_cnt from public.section_join_codes as jc where jc.section_id = v_section_b;
  if v_cnt <> 0 then raise exception 'A read B join code'; end if;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true); perform set_config('request.jwt.claims', '', true);

  -- disabled code same message
  perform public.set_join_enabled(v_section_a, false);
  perform set_config('request.jwt.claim.sub', v_s::text, true);
  perform set_config('request.jwt.claims', json_build_object('sub', v_s, 'role', 'authenticated')::text, true);
  set local role authenticated;
  v_sqlstate := null; v_sqlerrm := null;
  begin perform public.join_section(v_code_a); exception when others then v_sqlstate := sqlstate; v_sqlerrm := sqlerrm; end;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true); perform set_config('request.jwt.claims', '', true);
  if v_sqlerrm <> v_invalid_msg then raise exception 'disabled code message mismatch'; end if;
  perform public.set_join_enabled(v_section_a, true);

  -- rotate: old code invalid, new works for fresh student T on A? T already on B - use B code rotate test on B instead
  v_old_code_a := v_code_a;
  perform set_config('request.jwt.claim.sub', v_a::text, true);
  perform set_config('request.jwt.claims', json_build_object('sub', v_a, 'role', 'authenticated')::text, true);
  set local role authenticated;
  v_new_code_a := public.rotate_join_code(v_section_a);
  if v_new_code_a = v_old_code_a then raise exception 'rotate returned same code'; end if;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true); perform set_config('request.jwt.claims', '', true);

  perform set_config('request.jwt.claim.sub', v_t::text, true);
  perform set_config('request.jwt.claims', json_build_object('sub', v_t, 'role', 'authenticated')::text, true);
  set local role authenticated;
  v_sqlstate := null; v_sqlerrm := null;
  begin perform public.join_section(v_old_code_a); exception when others then v_sqlstate := sqlstate; v_sqlerrm := sqlerrm; end;
  if v_sqlerrm <> v_invalid_msg then raise exception 'rotated-out code message mismatch'; end if;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true); perform set_config('request.jwt.claims', '', true);

  -- grant removal blocks A management
  delete from public.faculty_grants as fg where fg.user_id = v_a;
  perform set_config('request.jwt.claim.sub', v_a::text, true);
  perform set_config('request.jwt.claims', json_build_object('sub', v_a, 'role', 'authenticated')::text, true);
  set local role authenticated;
  v_sqlstate := null;
  begin perform public.session_roster(v_session_a); exception when others then v_sqlstate := sqlstate; end;
  if v_sqlstate is null then raise exception 'expected denial was missing'; end if;
  v_sqlstate := null;
  begin perform public.rotate_join_code(v_section_a); exception when others then v_sqlstate := sqlstate; end;
  if v_sqlstate is null then raise exception 'expected denial was missing'; end if;
  v_sqlstate := null;
  begin perform 1 from public.my_faculty_sections() limit 1; exception when others then v_sqlstate := sqlstate; end;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true); perform set_config('request.jwt.claims', '', true);
  if v_sqlstate is null then raise exception 'expected denial was missing'; end if;
  insert into public.faculty_grants (user_id) values (v_a) on conflict do nothing;

  -- create_section as S denied
  perform set_config('request.jwt.claim.sub', v_s::text, true);
  perform set_config('request.jwt.claims', json_build_object('sub', v_s, 'role', 'authenticated')::text, true);
  set local role authenticated;
  v_sqlstate := null;
  begin perform 1 from public.create_section('X', 'DSA', 'Y') limit 1; exception when others then v_sqlstate := sqlstate; end;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true); perform set_config('request.jwt.claims', '', true);
  if v_sqlstate is null then raise exception 'expected denial was missing'; end if;

  -- create_lab_session validations as A
  perform set_config('request.jwt.claim.sub', v_a::text, true);
  perform set_config('request.jwt.claims', json_build_object('sub', v_a, 'role', 'authenticated')::text, true);
  set local role authenticated;
  v_sqlstate := null;
  begin perform public.create_lab_session(v_section_a, 1, 'T', now(), array['arrays/indexing/garbage']); exception when others then v_sqlstate := sqlstate; end;
  if v_sqlstate is null then raise exception 'expected invalid questions'; end if;
  v_sqlstate := null;
  begin perform public.create_lab_session(v_section_a, 1, 'T', now(), array['arrays/indexing','arrays/indexing']); exception when others then v_sqlstate := sqlstate; end;
  v_sqlstate := null;
  begin perform public.create_lab_session(v_section_a, 1, 'T', now(), array[null::text]); exception when others then v_sqlstate := sqlstate; end;
  v_sqlstate := null;
  begin perform public.create_lab_session(v_section_a, 1, 'T', now(), array['arrays/not-real']); exception when others then v_sqlstate := sqlstate; end;
  v_sqlstate := null;
  begin perform public.create_lab_session(v_section_a, 1, 'T', now(), array[]::text[]); exception when others then v_sqlstate := sqlstate; end;
  v_sqlstate := null;
  begin perform public.create_lab_session(v_section_a, 0, 'T', now(), array['arrays/sum']); exception when others then v_sqlstate := sqlstate; end;
  v_sqlstate := null;
  begin perform public.create_lab_session(v_section_a, 1, '   ', now(), array['arrays/sum']); exception when others then v_sqlstate := sqlstate; end;
  v_sqlstate := null;
  begin perform public.create_lab_session(v_section_a, 1, 'T', null, array['arrays/sum']); exception when others then v_sqlstate := sqlstate; end;
  v_session_new := public.create_lab_session(
    v_section_a, 2, 'Valid', now(), array['arrays/sum', 'arrays/find-max']
  );
  select ls.status into v_status from public.lab_sessions as ls where ls.id = v_session_new;
  if v_status <> 'live' then raise exception 'create session status'; end if;
  select count(*) into v_cnt from public.lab_session_questions as lq where lq.session_id = v_session_new;
  if v_cnt <> 2 then raise exception 'create session question count'; end if;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true); perform set_config('request.jwt.claims', '', true);

  -- institution reuse (proof-only name, not DEMO College)
  insert into public.institutions (id, name) values (v_inst_proof, v_inst_proof_name);
  insert into public.courses (institution_id, code, name)
  values (v_inst_proof, 'DSA', 'Existing Proof DSA Name');
  perform set_config('request.jwt.claim.sub', v_a::text, true);
  perform set_config('request.jwt.claims', json_build_object('sub', v_a, 'role', 'authenticated')::text, true);
  set local role authenticated;
  select cs.section_id into v_reuse_section
  from public.create_section('  PROOF REUSE UNIQUE COLLEGE  ', 'DSA', 'Reuse Section') as cs;
  select i.name into v_stored_name from public.institutions as i where i.id = v_inst_proof;
  if v_stored_name <> v_inst_proof_name then raise exception 'institution display name changed'; end if;
  select c.name into v_stored_course from public.courses as c
  where c.institution_id = v_inst_proof and c.code = 'DSA';
  if v_stored_course <> 'Existing Proof DSA Name' then raise exception 'course name changed'; end if;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true); perform set_config('request.jwt.claims', '', true);

  raise notice 'classroom isolation proofs passed';
end $proof$ language plpgsql;

rollback;
