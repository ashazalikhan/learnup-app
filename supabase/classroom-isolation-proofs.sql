-- Manual classroom isolation proofs (hosted SQL editor, after migrations). Not a migration.
-- Does not depend on demo-seed.sql. If an uncaught error stops the editor before the last line,
-- run ROLLBACK; yourself. Success: notice classroom isolation proofs passed, then rollback.
--
-- Register faculty A, faculty B, student S, student T in the app and set the four emails below.
-- Students S and T must not already have faculty_grants rows before you run this script.
--
-- Concurrency recipe (two SQL editor tabs): register a fifth account U with no memberships.
-- In both tabs set U's JWT claims, then call join_section(valid_code) simultaneously.
-- Both calls must return the same section_id; U must end with one student membership row.

begin;

create or replace function pg_temp.proof_impersonate(p_user uuid)
returns void
language plpgsql
security invoker
as $imp$
begin
  perform set_config('request.jwt.claim.sub', p_user::text, true);
  perform set_config(
    'request.jwt.claims',
    json_build_object('sub', p_user, 'role', 'authenticated')::text,
    true
  );
  set local role authenticated;
  if current_user <> 'authenticated' or auth.uid() is distinct from p_user then
    raise exception 'impersonation failed for %', p_user;
  end if;
end;
$imp$;

create or replace function pg_temp.proof_clear()
returns void
language plpgsql
security invoker
as $clr$
begin
  reset role;
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claims', '', true);
end;
$clr$;

create or replace function pg_temp.proof_assert_msg(
  p_sqlstate text,
  p_sqlerrm text,
  p_exp_state text,
  p_exp_msg text
)
returns void
language plpgsql
security invoker
as $assert$
begin
  if p_sqlstate is null or p_sqlerrm is null then
    raise exception 'expected denial was missing (wanted % / %)', p_exp_state, p_exp_msg;
  end if;
  if p_sqlstate <> p_exp_state or p_sqlerrm <> p_exp_msg then
    raise exception 'expected % / % but got % / %', p_exp_state, p_exp_msg, p_sqlstate, p_sqlerrm;
  end if;
end;
$assert$;

revoke all on function pg_temp.proof_impersonate(uuid) from public;
revoke all on function pg_temp.proof_clear() from public;
revoke all on function pg_temp.proof_assert_msg(text, text, text, text) from public;
do $temp_acl$
declare
  v_temp_schema text;
begin
  select n.nspname into v_temp_schema
  from pg_catalog.pg_namespace as n
  where n.oid = pg_catalog.pg_my_temp_schema();

  if v_temp_schema is null then
    raise exception 'proof setup stopped: temporary schema was not initialized';
  end if;

  execute pg_catalog.format(
    'grant usage on schema %I to authenticated',
    v_temp_schema
  );
end $temp_acl$;
grant execute on function pg_temp.proof_impersonate(uuid) to authenticated;
grant execute on function pg_temp.proof_clear() to authenticated;
grant execute on function pg_temp.proof_assert_msg(text, text, text, text) to authenticated;

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
  v_invalid_msg text := 'invalid join code';

  v_inst_a uuid;
  v_inst_b uuid;
  v_course_a uuid;
  v_course_b uuid;
  v_section_a uuid;
  v_section_b uuid;
  v_session_a uuid;
  v_session_b uuid;
  v_session_status uuid;
  v_code_a text;
  v_code_b text;
  v_absent_code text;
  v_old_code_a text;
  v_new_code_a text;
  v_joined uuid;
  v_role text;
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
  v_priv text;
  v_tables text[] := array[
    'institutions','courses','sections','section_join_codes','section_memberships',
    'lab_sessions','lab_session_questions','curriculum_lesson_keys','lesson_opens','faculty_grants'
  ];
  v_privs text[] := array['SELECT','INSERT','UPDATE','DELETE','TRUNCATE'];
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
    foreach v_priv in array v_privs loop
      if has_table_privilege('anon', 'public.' || v_tbl, v_priv) then
        raise exception 'anon must not have % on %', v_priv, v_tbl;
      end if;

      if v_priv = 'SELECT' then
        if not has_table_privilege('authenticated', 'public.' || v_tbl, v_priv) then
          raise exception 'authenticated missing % on %', v_priv, v_tbl;
        end if;
      elsif v_tbl = 'lesson_opens' and v_priv in ('INSERT', 'UPDATE') then
        if not has_table_privilege('authenticated', 'public.lesson_opens', v_priv) then
          raise exception 'lesson_opens missing % for authenticated', v_priv;
        end if;
      elsif v_priv in ('INSERT', 'UPDATE', 'DELETE', 'TRUNCATE') then
        if has_table_privilege('authenticated', 'public.' || v_tbl, v_priv) then
          raise exception 'authenticated must not have % on %', v_priv, v_tbl;
        end if;
      end if;
    end loop;
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

  loop
    v_absent_code := public.generate_join_code();
    if not exists (
      select 1 from public.section_join_codes as jc where jc.code = v_absent_code
    ) then
      exit;
    end if;
  end loop;

  -- invalid join code variants (same message)
  perform pg_temp.proof_impersonate(v_s);
  v_sqlstate := null; v_sqlerrm := null;
  begin perform public.join_section('BADCODE1'); exception when others then v_sqlstate := sqlstate; v_sqlerrm := sqlerrm; end;
  perform pg_temp.proof_clear();
  perform pg_temp.proof_assert_msg(v_sqlstate, v_sqlerrm, 'P0001', v_invalid_msg);

  perform pg_temp.proof_impersonate(v_s);
  v_sqlstate := null; v_sqlerrm := null;
  begin perform public.join_section(v_absent_code); exception when others then v_sqlstate := sqlstate; v_sqlerrm := sqlerrm; end;
  perform pg_temp.proof_clear();
  perform pg_temp.proof_assert_msg(v_sqlstate, v_sqlerrm, 'P0001', v_invalid_msg);

  -- faculty duplicate join preserves faculty role
  perform pg_temp.proof_impersonate(v_a);
  v_joined := public.join_section(v_code_a);
  if v_joined <> v_section_a then raise exception 'faculty join returned wrong section'; end if;
  select sm.role into v_role from public.section_memberships as sm
  where sm.section_id = v_section_a and sm.user_id = v_a;
  if v_role <> 'faculty' then raise exception 'faculty role changed on join'; end if;
  perform pg_temp.proof_clear();

  -- S idempotent join
  perform pg_temp.proof_impersonate(v_s);
  v_joined := public.join_section(v_code_a);
  if v_joined <> v_section_a then raise exception 'join A failed'; end if;
  v_joined := public.join_section(v_code_a);
  if v_joined <> v_section_a then raise exception 'join A idempotent failed'; end if;
  select sm.role into v_role from public.section_memberships as sm
  where sm.section_id = v_section_a and sm.user_id = v_s;
  if v_role <> 'student' then raise exception 'student role changed on duplicate join'; end if;
  perform pg_temp.proof_clear();

  -- S positive reads on own section chain
  perform pg_temp.proof_impersonate(v_s);
  select count(*) into v_cnt from public.institutions as i where i.id = v_inst_a;
  if v_cnt <> 1 then raise exception 'S cannot read own institution'; end if;
  select count(*) into v_cnt from public.courses as c where c.id = v_course_a;
  if v_cnt <> 1 then raise exception 'S cannot read own course'; end if;
  select count(*) into v_cnt from public.sections as s where s.id = v_section_a;
  if v_cnt <> 1 then raise exception 'S cannot read own section'; end if;
  select count(*) into v_cnt from public.lab_sessions as ls where ls.id = v_session_a;
  if v_cnt <> 1 then raise exception 'S cannot read own session'; end if;
  select count(*) into v_cnt from public.lab_session_questions as lq where lq.session_id = v_session_a;
  if v_cnt <> 2 then raise exception 'S cannot read own questions'; end if;
  perform pg_temp.proof_clear();

  -- S cannot see B
  perform pg_temp.proof_impersonate(v_s);
  select count(*) into v_cnt from public.sections as s where s.id = v_section_b;
  if v_cnt <> 0 then raise exception 'S saw section B'; end if;
  select count(*) into v_cnt from public.lab_sessions as ls where ls.section_id = v_section_b;
  if v_cnt <> 0 then raise exception 'S saw session B'; end if;
  select count(*) into v_cnt from public.lab_session_questions as lq where lq.session_id = v_session_b;
  if v_cnt <> 0 then raise exception 'S saw questions B'; end if;
  select count(*) into v_cnt from public.section_join_codes as jc where jc.section_id = v_section_b;
  if v_cnt <> 0 then raise exception 'S saw join code B'; end if;
  perform pg_temp.proof_clear();

  -- roster denials for S (both sessions)
  perform pg_temp.proof_impersonate(v_s);
  v_sqlstate := null; v_sqlerrm := null;
  begin perform public.session_roster(v_session_a); exception when others then v_sqlstate := sqlstate; v_sqlerrm := sqlerrm; end;
  perform pg_temp.proof_clear();
  perform pg_temp.proof_assert_msg(v_sqlstate, v_sqlerrm, 'P0001', 'not allowed');

  perform pg_temp.proof_impersonate(v_s);
  v_sqlstate := null; v_sqlerrm := null;
  begin perform public.session_roster(v_session_b); exception when others then v_sqlstate := sqlstate; v_sqlerrm := sqlerrm; end;
  perform pg_temp.proof_clear();
  perform pg_temp.proof_assert_msg(v_sqlstate, v_sqlerrm, 'P0001', 'not allowed');

  -- ACL denials for S
  perform pg_temp.proof_impersonate(v_s);
  v_sqlstate := null; v_sqlerrm := null;
  begin insert into public.faculty_grants (user_id) values (v_s); exception when others then v_sqlstate := sqlstate; v_sqlerrm := sqlerrm; end;
  perform pg_temp.proof_clear();
  if v_sqlstate is null or v_sqlstate <> '42501' then
    raise exception 'expected denial was missing on faculty_grants insert';
  end if;

  perform pg_temp.proof_impersonate(v_s);
  v_sqlstate := null; v_sqlerrm := null;
  begin truncate public.faculty_grants; exception when others then v_sqlstate := sqlstate; v_sqlerrm := sqlerrm; end;
  perform pg_temp.proof_clear();
  if v_sqlstate is null or v_sqlstate <> '42501' then raise exception 'expected denial was missing on faculty_grants truncate'; end if;

  perform pg_temp.proof_impersonate(v_s);
  v_sqlstate := null; v_sqlerrm := null;
  begin insert into public.sections (course_id, name, created_by) values (v_course_a, 'X', v_s);
  exception when others then v_sqlstate := sqlstate; v_sqlerrm := sqlerrm; end;
  perform pg_temp.proof_clear();
  if v_sqlstate is null or v_sqlstate <> '42501' then raise exception 'expected denial was missing on sections insert'; end if;

  perform pg_temp.proof_impersonate(v_s);
  v_sqlstate := null; v_sqlerrm := null;
  begin truncate public.sections; exception when others then v_sqlstate := sqlstate; v_sqlerrm := sqlerrm; end;
  perform pg_temp.proof_clear();
  if v_sqlstate is null or v_sqlstate <> '42501' then raise exception 'expected denial was missing on sections truncate'; end if;

  perform pg_temp.proof_impersonate(v_s);
  v_sqlstate := null; v_sqlerrm := null;
  begin insert into public.section_memberships (section_id, user_id, role) values (v_section_b, v_s, 'faculty');
  exception when others then v_sqlstate := sqlstate; v_sqlerrm := sqlerrm; end;
  perform pg_temp.proof_clear();
  if v_sqlstate is null or v_sqlstate <> '42501' then raise exception 'expected denial was missing on membership insert'; end if;

  perform pg_temp.proof_impersonate(v_s);
  v_sqlstate := null; v_sqlerrm := null;
  begin update public.section_memberships as sm set role = 'faculty' where sm.section_id = v_section_a and sm.user_id = v_s;
  exception when others then v_sqlstate := sqlstate; v_sqlerrm := sqlerrm; end;
  perform pg_temp.proof_clear();
  if v_sqlstate is null or v_sqlstate <> '42501' then raise exception 'expected denial was missing on membership update'; end if;

  -- owner fixtures for roster (S attempts)
  insert into public.lesson_attempts (user_id, lesson_key, language, passed) values
    (v_s, 'arrays/what-is-an-array', 'javascript', false),
    (v_s, 'arrays/what-is-an-array', 'javascript', false),
    (v_s, 'arrays/what-is-an-array', 'javascript', true);

  perform pg_temp.proof_impersonate(v_a);
  select count(*) into v_cnt from public.session_roster(v_session_a) as r;
  if v_cnt <> 1 then raise exception 'roster row count'; end if;
  select r.questions into v_questions from public.session_roster(v_session_a) as r limit 1;
  if jsonb_array_length(v_questions) <> 2 then raise exception 'roster questions length'; end if;
  select (elem->>'status') into v_status
  from public.session_roster(v_session_a) as r,
  lateral jsonb_array_elements(r.questions) as elem
  where elem->>'lesson_key' = 'arrays/what-is-an-array' limit 1;
  if v_status not in ('passed', 'submitted') then raise exception 'roster status after attempts'; end if;
  perform pg_temp.proof_clear();

  delete from public.profiles as p where p.id = v_s;
  perform pg_temp.proof_impersonate(v_a);
  select r.display_name into v_stored_name from public.session_roster(v_session_a) as r limit 1;
  if v_stored_name <> 'Student' then raise exception 'missing profile display_name'; end if;
  perform pg_temp.proof_clear();

  perform pg_temp.proof_impersonate(v_a);
  v_sqlstate := null; v_sqlerrm := null;
  begin perform public.session_roster(v_session_b); exception when others then v_sqlstate := sqlstate; v_sqlerrm := sqlerrm; end;
  perform pg_temp.proof_clear();
  perform pg_temp.proof_assert_msg(v_sqlstate, v_sqlerrm, 'P0001', 'not allowed');

  perform pg_temp.proof_impersonate(v_a);
  select count(*) into v_cnt from public.profiles as p where p.id = v_t;
  if v_cnt <> 0 then raise exception 'A read T profile'; end if;
  select count(*) into v_cnt from public.lesson_attempts as la where la.user_id = v_t;
  if v_cnt <> 0 then raise exception 'A read T attempts'; end if;
  select count(*) into v_cnt from public.section_join_codes as jc where jc.section_id = v_section_b;
  if v_cnt <> 0 then raise exception 'A read B join code'; end if;
  perform pg_temp.proof_clear();

  -- disabled code
  perform pg_temp.proof_impersonate(v_a);
  perform public.set_join_enabled(v_section_a, false);
  perform pg_temp.proof_clear();

  perform pg_temp.proof_impersonate(v_s);
  v_sqlstate := null; v_sqlerrm := null;
  begin perform public.join_section(v_code_a); exception when others then v_sqlstate := sqlstate; v_sqlerrm := sqlerrm; end;
  perform pg_temp.proof_clear();
  perform pg_temp.proof_assert_msg(v_sqlstate, v_sqlerrm, 'P0001', v_invalid_msg);

  perform pg_temp.proof_impersonate(v_a);
  perform public.set_join_enabled(v_section_a, true);
  v_old_code_a := v_code_a;
  v_new_code_a := public.rotate_join_code(v_section_a);
  if v_new_code_a = v_old_code_a then raise exception 'rotate returned same code'; end if;
  if not exists (
    select 1 from public.section_join_codes as jc
    where jc.section_id = v_section_a and jc.code = v_new_code_a and jc.enabled is true
  ) then
    raise exception 'rotate did not preserve enabled state';
  end if;
  perform pg_temp.proof_clear();

  perform pg_temp.proof_impersonate(v_s);
  v_sqlstate := null; v_sqlerrm := null;
  begin perform public.join_section(v_old_code_a); exception when others then v_sqlstate := sqlstate; v_sqlerrm := sqlerrm; end;
  perform pg_temp.proof_clear();
  perform pg_temp.proof_assert_msg(v_sqlstate, v_sqlerrm, 'P0001', v_invalid_msg);

  -- T joins A with rotated code (new member)
  delete from public.section_memberships as sm where sm.section_id = v_section_b and sm.user_id = v_t;
  perform pg_temp.proof_impersonate(v_t);
  v_joined := public.join_section(v_new_code_a);
  if v_joined <> v_section_a then raise exception 'rotated code join failed'; end if;
  v_joined := public.join_section(v_new_code_a);
  if v_joined <> v_section_a then raise exception 'rotated code duplicate join failed'; end if;
  select sm.role into v_role from public.section_memberships as sm
  where sm.section_id = v_section_a and sm.user_id = v_t;
  if v_role <> 'student' then raise exception 'new member role wrong'; end if;
  perform pg_temp.proof_clear();

  -- grant removal blocks A management
  delete from public.faculty_grants as fg where fg.user_id = v_a;
  perform pg_temp.proof_impersonate(v_a);
  v_sqlstate := null; v_sqlerrm := null;
  begin perform public.session_roster(v_session_a); exception when others then v_sqlstate := sqlstate; v_sqlerrm := sqlerrm; end;
  perform pg_temp.proof_assert_msg(v_sqlstate, v_sqlerrm, 'P0001', 'not allowed');
  v_sqlstate := null; v_sqlerrm := null;
  begin perform public.rotate_join_code(v_section_a); exception when others then v_sqlstate := sqlstate; v_sqlerrm := sqlerrm; end;
  perform pg_temp.proof_assert_msg(v_sqlstate, v_sqlerrm, 'P0001', 'not allowed');
  v_sqlstate := null; v_sqlerrm := null;
  begin perform 1 from public.my_faculty_sections() limit 1; exception when others then v_sqlstate := sqlstate; v_sqlerrm := sqlerrm; end;
  perform pg_temp.proof_assert_msg(v_sqlstate, v_sqlerrm, 'P0001', 'not allowed');
  perform pg_temp.proof_clear();
  insert into public.faculty_grants (user_id) values (v_a) on conflict do nothing;

  -- create_section as S
  perform pg_temp.proof_impersonate(v_s);
  v_sqlstate := null; v_sqlerrm := null;
  begin perform 1 from public.create_section('X', 'DSA', 'Y') limit 1; exception when others then v_sqlstate := sqlstate; v_sqlerrm := sqlerrm; end;
  perform pg_temp.proof_clear();
  perform pg_temp.proof_assert_msg(v_sqlstate, v_sqlerrm, 'P0001', 'not allowed');

  -- create_lab_session validations as A
  perform pg_temp.proof_impersonate(v_a);
  v_sqlstate := null; v_sqlerrm := null;
  begin perform public.create_lab_session(v_section_a, 1, 'T', now(), array['arrays/indexing/garbage']); exception when others then v_sqlstate := sqlstate; v_sqlerrm := sqlerrm; end;
  perform pg_temp.proof_assert_msg(v_sqlstate, v_sqlerrm, 'P0001', 'invalid questions');
  v_sqlstate := null; v_sqlerrm := null;
  begin perform public.create_lab_session(v_section_a, 1, 'T', now(), array['arrays/indexing','arrays/indexing']); exception when others then v_sqlstate := sqlstate; v_sqlerrm := sqlerrm; end;
  perform pg_temp.proof_assert_msg(v_sqlstate, v_sqlerrm, 'P0001', 'invalid questions');
  v_sqlstate := null; v_sqlerrm := null;
  begin perform public.create_lab_session(v_section_a, 1, 'T', now(), array[null::text]); exception when others then v_sqlstate := sqlstate; v_sqlerrm := sqlerrm; end;
  perform pg_temp.proof_assert_msg(v_sqlstate, v_sqlerrm, 'P0001', 'invalid questions');
  v_sqlstate := null; v_sqlerrm := null;
  begin perform public.create_lab_session(v_section_a, 1, 'T', now(), array['arrays/not-real']); exception when others then v_sqlstate := sqlstate; v_sqlerrm := sqlerrm; end;
  perform pg_temp.proof_assert_msg(v_sqlstate, v_sqlerrm, 'P0001', 'invalid questions');
  v_sqlstate := null; v_sqlerrm := null;
  begin perform public.create_lab_session(v_section_a, 1, 'T', now(), array[]::text[]); exception when others then v_sqlstate := sqlstate; v_sqlerrm := sqlerrm; end;
  perform pg_temp.proof_assert_msg(v_sqlstate, v_sqlerrm, 'P0001', 'invalid questions');
  v_sqlstate := null; v_sqlerrm := null;
  begin perform public.create_lab_session(v_section_a, 0, 'T', now(), array['arrays/sum']); exception when others then v_sqlstate := sqlstate; v_sqlerrm := sqlerrm; end;
  perform pg_temp.proof_assert_msg(v_sqlstate, v_sqlerrm, 'P0001', 'invalid session');
  v_sqlstate := null; v_sqlerrm := null;
  begin perform public.create_lab_session(v_section_a, 1, '   ', now(), array['arrays/sum']); exception when others then v_sqlstate := sqlstate; v_sqlerrm := sqlerrm; end;
  perform pg_temp.proof_assert_msg(v_sqlstate, v_sqlerrm, 'P0001', 'invalid session');
  v_sqlstate := null; v_sqlerrm := null;
  begin perform public.create_lab_session(v_section_a, 1, 'T', null, array['arrays/sum']); exception when others then v_sqlstate := sqlstate; v_sqlerrm := sqlerrm; end;
  perform pg_temp.proof_assert_msg(v_sqlstate, v_sqlerrm, 'P0001', 'invalid session');
  v_session_new := public.create_lab_session(
    v_section_a, 2, 'Valid', now(), array['arrays/sum', 'arrays/find-max']
  );
  select ls.status into v_status from public.lab_sessions as ls where ls.id = v_session_new;
  if v_status <> 'live' then raise exception 'create session status'; end if;
  if not exists (
    select 1 from public.lab_session_questions as lq
    where lq.session_id = v_session_new and lq.lesson_key = 'arrays/sum' and lq.position = 1
  ) then
    raise exception 'create session position 1';
  end if;
  if not exists (
    select 1 from public.lab_session_questions as lq
    where lq.session_id = v_session_new and lq.lesson_key = 'arrays/find-max' and lq.position = 2
  ) then
    raise exception 'create session position 2';
  end if;
  perform pg_temp.proof_clear();

  -- roster status precedences (owner fixtures, rollback-only transaction)
  delete from public.lesson_attempts as la
  where la.user_id = v_s
    and la.lesson_key in (
      'arrays/linear-search',
      'arrays/update-in-place',
      'arrays/reverse-an-array',
      'arrays/two-pointer-swap'
    );
  delete from public.user_lesson_progress as ulp
  where ulp.user_id = v_s
    and ulp.lesson_key in (
      'arrays/linear-search',
      'arrays/update-in-place',
      'arrays/reverse-an-array',
      'arrays/two-pointer-swap'
    );
  delete from public.lesson_opens as lo
  where lo.user_id = v_s
    and lo.lesson_key in (
      'arrays/linear-search',
      'arrays/update-in-place',
      'arrays/reverse-an-array',
      'arrays/two-pointer-swap'
    );

  perform pg_temp.proof_impersonate(v_a);
  v_session_status := public.create_lab_session(
    v_section_a, 3, 'Status Session', now(),
    array['arrays/linear-search', 'arrays/update-in-place', 'arrays/reverse-an-array', 'arrays/two-pointer-swap']
  );
  perform pg_temp.proof_clear();

  -- not_started: arrays/linear-search has no opens, progress, or attempts
  insert into public.lesson_opens (user_id, lesson_key)
  values (v_s, 'arrays/update-in-place');
  insert into public.user_lesson_progress (user_id, lesson_key, status, attempts, updated_at)
  values (v_s, 'arrays/reverse-an-array', 'in_progress', 1, now());
  insert into public.lesson_attempts (user_id, lesson_key, language, passed)
  values (v_s, 'arrays/two-pointer-swap', 'javascript', true);

  perform pg_temp.proof_impersonate(v_a);
  select count(*) into v_cnt
  from public.session_roster(v_session_status) as r
  where r.user_id = v_s;
  if v_cnt is distinct from 1 then
    raise exception 'status roster missing S';
  end if;

  select r.questions into v_questions
  from public.session_roster(v_session_status) as r
  where r.user_id = v_s;
  if v_questions is null
    or jsonb_typeof(v_questions) is distinct from 'array'
    or jsonb_array_length(v_questions) is distinct from 4 then
    raise exception 'status question count';
  end if;

  select jsonb_object_agg(elem->>'lesson_key', elem->>'status') into v_questions
  from public.session_roster(v_session_status) as r,
  lateral jsonb_array_elements(r.questions) as elem
  where r.user_id = v_s;
  if v_questions is null then
    raise exception 'status key count';
  end if;
  select count(*) into v_cnt from jsonb_object_keys(v_questions);
  if v_cnt is distinct from 4 then
    raise exception 'status key count';
  end if;
  if v_questions->>'arrays/linear-search' is distinct from 'not_started' then
    raise exception 'status not_started';
  end if;
  if v_questions->>'arrays/update-in-place' is distinct from 'opened' then
    raise exception 'status opened';
  end if;
  if v_questions->>'arrays/reverse-an-array' is distinct from 'submitted' then
    raise exception 'status submitted';
  end if;
  if v_questions->>'arrays/two-pointer-swap' is distinct from 'passed' then
    raise exception 'status passed';
  end if;
  perform pg_temp.proof_clear();

  -- institution reuse (proof-only name, not DEMO College)
  insert into public.institutions (id, name) values (v_inst_proof, v_inst_proof_name);
  insert into public.courses (institution_id, code, name)
  values (v_inst_proof, 'DSA', 'Existing Proof DSA Name');
  perform pg_temp.proof_impersonate(v_a);
  select cs.section_id into v_reuse_section
  from public.create_section('  PROOF REUSE UNIQUE COLLEGE  ', 'DSA', 'Reuse Section') as cs;
  select i.name into v_stored_name from public.institutions as i where i.id = v_inst_proof;
  if v_stored_name <> v_inst_proof_name then raise exception 'institution display name changed'; end if;
  select c.name into v_stored_course from public.courses as c
  where c.institution_id = v_inst_proof and c.code = 'DSA';
  if v_stored_course <> 'Existing Proof DSA Name' then raise exception 'course name changed'; end if;
  perform pg_temp.proof_clear();

  raise notice 'classroom isolation proofs passed';
end $proof$ language plpgsql;

rollback;
