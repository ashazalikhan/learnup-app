# Backend schema: database and API shape

Tables, rules, functions · from migrations 001 to 006

> Extracted from the six build docs written 8 October 2026. Historical snapshot, not a fresh repo audit. The Master Plan wins on scope and order. Read design-rules.md first for the design decisions locked on 12 October; those supersede the older colour choices, accent placeholders and lesson-layout assumptions below. EXISTS refers to feature/09-classroom-core at the original review, not necessarily main today.

LearnUp has no separate REST API. Its "API" is two things: Postgres RPC functions that guard classroom actions, and Next.js server actions that call them. The schema below is read from the migration files on feature/09-classroom-core, plus clearly marked additions.

> 12 October scope note: the approved 008 task covers session-specific attempts and openings only. Source-code/result storage, timers and faculty code viewing remain outside that task. Follow the approved session-evidence brief, not this older broad 008 proposal.

## Tables that exist

| Table | Key columns | Purpose and access |
| --- | --- | --- |
| profiles (001, 002) | id (= auth user), display_name, xp, streak, last_active_date | One row per user, created by a trigger on signup. Select/update/insert own row. Note: update-own lets a user change their own xp (known gap). |
| lesson_attempts (003) | id, user_id, lesson_key, language, passed, created_at | Audit log of attempts. Select/insert own. Does NOT store the code yet (PLANNED). |
| user_lesson_progress (004) | user_id + lesson_key, status in_progress/completed, attempts, updated_at | Per-lesson progress. |
| institutions (005) | id, name, name_key (unique, lowercased) | Colleges. Read if you are in one of its sections. |
| courses (005) | id, institution_id, code in (DSA, DAA), name; unique per institution and code | Course per college. Locked to DSA and DAA by a check. |
| sections (005) | id, course_id, name, created_by | A class group. Read by members only. |
| section_join_codes (005) | section_id (pk), code (8 chars from an unambiguous alphabet, unique), enabled | Faculty can see their section's code (006 policy). Students never read it; they use the RPC. |
| section_memberships (005) | section_id + user_id, role in (student, faculty) | Who is in what. You can read your own rows only. |
| lab_sessions (005) | id, section_id, week_no 1-16, title, starts_at, status live/closed | One lab period. Readable by section members. |
| curriculum_lesson_keys (005) | lesson_key (pk), position | The 10 placeholder arrays lessons. Replaced by real MUJ experiments in Phase 2 of Act 2. |
| lab_session_questions (005) | session_id + lesson_key, position | Which questions a session assigns, in order. |
| lesson_opens (005) | user_id + lesson_key, opened_at | First activity signal the roster uses. Own rows only. |
| faculty_grants (006) | user_id (pk), granted_at | Who may act as faculty. Select own; writes only by the database owner. |

Why codes avoid some letters: the join code alphabet leaves out look-alikes (0/O, 1/I) so a student reading a code from a projector does not mistype it.

## RPC functions that exist (all security definer, authenticated only)

| Function | Who may call | What it does |
| --- | --- | --- |
| join_section(p_code text) returns uuid | Any signed-in user | Adds a student membership for an enabled code; returns section id. |
| create_section(...3 text args) returns section_id, join_code | Faculty grant holder | Creates the institution/course/section as needed and the code. |
| rotate_join_code(p_section_id) | Faculty of section | New code, old one stops working. |
| set_join_enabled(p_section_id, p_enabled) | Faculty of section | Turns joining on or off. |
| create_lab_session(section, week, title, starts_at, lesson_keys[]) | Faculty of section | Creates a live session and its ordered questions. |
| set_lab_session_status(p_session_id, p_status) | Faculty of section | live or closed. |
| session_roster(p_session_id) | Faculty of section | Per student, per question: not_started, opened, submitted or passed. Derived from lesson_opens, lesson_attempts and user_lesson_progress. |
| my_faculty_sections() | Faculty | Lists the caller's sections. |

## Server actions (the app-level API)

| File | Actions | Calls |
| --- | --- | --- |
| app/actions/classroom.ts | joinWithCode, returnToLab, createSectionAction, createLabSessionAction (+FormAction variants), rotateJoinCode*, setJoinEnabled*, setLabSessionStatus*, pollFacultySession, pollSessionRoster, recordLessonOpen | The RPCs above; recordLessonOpen writes lesson_opens |
| app/actions/lesson.ts | executeCodeAction, executeWithPistonAction, runLessonTestsAction, submitLessonAttempt | Piston / node:vm, then inserts into lesson_attempts and user_lesson_progress |

Why server actions, not REST: fewer moving parts for a solo build. If you ever need a mobile app or external integrations, add route handlers then. No mobile is in scope, so do not add them now.

## Relationships at a glance

```text
auth.users 1--1 profiles
institutions 1--* courses 1--* sections
sections 1--1 section_join_codes
sections *--* users   via section_memberships (role)
sections 1--* lab_sessions 1--* lab_session_questions *--1 curriculum_lesson_keys
users *--* curriculum_lesson_keys via lesson_opens, lesson_attempts, user_lesson_progress
users 0..1 faculty_grants
```

### One design wrinkle worth knowing

lesson_attempts and lesson_opens are keyed by user and lesson, not by lab session. So the roster's "passed" means passed ever, not passed during this lab window. Fine for the demo; for a real 90-minute record (late/absent, weekly leaderboard) attempts need a session link. See PROPOSED changes next.

## PROPOSED additions (not in the plan as tables yet, need your yes)

Write these as new numbered additive migrations (007 onward), never edit 001 to 006. The Master Plan already names the features; the table shapes below are my suggestions.

| Change | Shape | Why |
| --- | --- | --- |
| 007 session window | alter lab_sessions add duration_minutes int default 90, ends_at generated or set at create; close_at check | Phase 2 of Act 2: the 90-minute window. |
| 008 attempt storage | Add code text, session_id nullable fk, result jsonb, duration_ms to lesson_attempts (or a new submissions table) | Plan item "store submitted source"; professors can review what was submitted; links an attempt to a session for on-time and late. |
| 009 activity events | lab_events(id, session_id, user_id, kind in (open, run, submit), at) | Grows lesson_opens into the "coding" signal. Define "stuck" from these before building. |
| 010 server-owned progress | Revoke direct insert/update on user_lesson_progress and xp; one RPC records an attempt, completion and XP once, in a single transaction | Plan item pre-deployment hardening: stops forged XP and double awards. |
| 011 manual unlock | lab_records(experiment key, content ref) and record_unlocks(user_id, experiment, at) | Plan item reference record unlock. |
| 012 weekly leaderboard | A view or RPC over completions per section per week, consistency scored | Locked rules: weekly reset, section-only, no speed. |
| Curriculum | Replace curriculum_lesson_keys with experiments(course, week, title, questions) | Real MUJ manual mapped by week. |

## RLS rules to keep as the schema grows

- Every new table starts with RLS enabled and no policies, then add the narrowest select policy.
- Students write through RPCs only. Revoke table privileges first, grant back only what is needed (the 005 style).
- Hidden fixtures and expected outputs stay in server-only code or a table with no student select policy.
- Re-run the isolation proof script after every migration that touches classroom tables.

## Source

Six build docs: https://files.instinct.com/pzttn9nvst48-learnup-the-six-build-docs
Master Plan: https://files.instinct.com/file-01M3MQKF6WCVPAYMN9EYY2Z2N2
Session-evidence brief: https://files.instinct.com/zeudmkp14sdm-learnup-008-session-evidence
