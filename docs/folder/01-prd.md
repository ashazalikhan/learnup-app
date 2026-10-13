# PRD: what LearnUp is and why

Product requirements · MUJ DSA/DAA labs

> Extracted from the six build docs written 8 October 2026. Historical snapshot, not a fresh repo audit. The Master Plan wins on scope and order. Read design-rules.md first for the design decisions locked on 12 October; those supersede the older colour choices, accent placeholders and lesson-layout assumptions below. EXISTS refers to feature/09-classroom-core at the original review, not necessarily main today.

A PRD says what you are building, for whom, and what "done" looks like, before anyone argues about how. This one restates the Master Plan in product terms. It adds nothing that contradicts the plan; anything new is marked PROPOSED.

## How to read these six docs

### One plan rule

The Master Plan file stays the single source of truth for scope and order. These six docs explain and detail it. If a doc here ever disagrees with the plan, the plan wins and the doc is wrong. Every item below is tagged EXISTS (in the repo today), PLANNED (already in the Master Plan) or PROPOSED (new, needs your yes before it goes anywhere).

Source of what EXISTS: the repo github.com/ashazalikhan/learnup-app, branch feature/09-classroom-core (migrations 001 to 006, app/, lib/, proxy.ts, package.json), read on 8 Oct 2026. I read the migrations, the server actions, the route list and the auth proxy. I did not read every component line by line, so UI details below are described at screen level.

## The problem

A CS lab at MUJ is about 1.5 hours once a week for 12 weeks. A lot of that time goes to games and chatting. The teacher cannot see 40 screens at once, so they walk from desk to desk. Students who want the lab manual hunt seniors for it or paste from AI.

Why this matters for the product: the value is not "a coding site". Plenty of those exist. The value is that the lab period itself becomes productive and visible, using the exact MUJ experiment for that week.

## North star (your words, 5 Oct)

### LearnUp is the physical CS lab, digitized

The teacher creates, configures and joins nothing. During lab hours the teacher opens LearnUp and sees the room: which machines are live, whose they are, and whether each student is actually working on code. Students open their assigned work and solve. The teacher is a spectator.

Be honest about the gap: today a teacher still creates a section and opens a session by hand (that is the Act 2 scaffolding). The north star is where it ends up, not where phase 1 stands. The Master Plan says the same.

## Who it is for

| Person | What they need | What they must never be able to do |
| --- | --- | --- |
| Student (MUJ, DSA or DAA lab) | Join their section with a code, see this week's assigned questions, write and run code, submit, see a clear reason when it fails. | Award themselves XP, see another student's code, see hidden test answers, edit a session. |
| Faculty (lab teacher) | See the section roster for a live session: who has not started, who is working, who submitted or passed. Review stored code later. | Change another teacher's section. Faculty status is granted in the database, not self-chosen at signup. |
| You (builder/admin) | Grant faculty access, apply migrations, run a demo on one laptop. | Nothing special beyond running the Supabase dashboard yourself. |

## Scope: in and out

| Item | Status | Note |
| --- | --- | --- |
| Email and Google sign-in, dashboard, 5-language editor (Run, Run tests, Submit) | EXISTS | From the audited baseline in the plan. |
| Server grading: JS in Node, other languages through self-hosted Piston | EXISTS | node:vm is not a security boundary; hardening is deferred to pre-deployment. |
| 10 placeholder Arrays lessons, sequential unlock, XP, streak, PathMap | EXISTS | Stand-ins until real MUJ questions go in. |
| Sections, join codes, "My labs" page, faculty roster, RLS isolation proofs | EXISTS | Code-complete on feature/09, proofs passed 6 Oct, demo seed being run. |
| 90-minute lab session: timer, late and absent handling, reopen | PLANNED | Act 2. Rules must be decided before coding timers (see Implementation Plan). |
| Real MUJ DSA/DAA manual mapped week by week | PLANNED | Needs an authorized source and usage rights. |
| Roster states not started, coding, stuck, submitted from server events | PLANNED | Today the roster has not started, opened, submitted, passed. "Coding" and "stuck" come later. |
| Store submitted source and outcome, faculty code review, student receipt | PLANNED | After Act 2 core. |
| Reference lab record unlock after verified completion | PLANNED | Say "reference record unlocked on completion" to faculty. |
| Weekly, section-relative, consistency-scored leaderboard | PLANNED | Act 3. Locked: weekly reset, no global XP race, no speed contest. |
| Auth, ownership checks, rate limits and isolation on code execution | PLANNED | Deferred to pre-deployment, not needed for a controlled local demo. |
| Server-owned atomic progression (no forging XP or passes) | PLANNED | Same deferral. |
| Mobile, ML lab, computer-network lab, other courses | OUT | Desktop-only, DSA and DAA only. |
| Coddy-style extras: daily missions, practice area, store | OUT for now | In no act yet. Your call later. |

## Requirements by feature

Each requirement has a test you can run by hand. A requirement without a check is a wish.

| ID | Requirement | Check (how you know it works) |
| --- | --- | --- |
| R1 | A student joins a section using an 8-character code. | Wrong code gives an error; right code lands on My labs with that section listed. Disabled code is refused. |
| R2 | Faculty only sees and manages sections they belong to as faculty. | Faculty B cannot open Faculty A's section or roster (the isolation proof script covers this). |
| R3 | A live session shows its assigned questions in curriculum order. | Student sees the same ordered questions the faculty created. |
| R4 | Faculty roster shows each student's state per question and refreshes without a manual reload. | Open a lesson as student S, watch roster move to opened, then passed after a correct submit. |
| R5 | A failed submission says why: timeout, runtime error, runner unavailable, or wrong answer. | Stop Piston, submit: message says runner unavailable, never "wrong answer". |
| R6 | Grading is trustworthy: known-correct solutions pass, known-wrong fail. | Proof PR #5: 50 of 50 correct pass, 50 of 50 wrong fail on real Piston. |
| R7 | Shared lab PCs sign out after idle time. | Idle for 12 minutes, you are signed out (IdleLogout in the app). |
| R8 (PLANNED) | A session has a 90-minute window with clear start and end. | Defined in the Phase 2 brief once late/absent rules are decided. |
| R9 (PLANNED) | Completing a session's questions unlocks that experiment's reference record. | A forged pass must not unlock it. |

## Success: what "real product" means

- One real MUJ DSA/DAA section completes a full 12-week cycle on it, not a demo.
- A professor can answer "who actually did the work this week?" from LearnUp alone, with evidence they trust.
- It survives college Wi-Fi: when the code runner or network fails, student work is kept and nothing falsely shows as passed.
- It is free for the pilot section. Do not claim a faculty dashboard is new; Coddy and CodeHS have them. Your edge is exact MUJ curriculum, the 90-minute lab shape, trustworthy in-session evidence, free pricing, and the manual unlock.

### Check before pitching

Competitor facts in the plan were checked 29 Sep 2026. Recheck pricing and features before using them with faculty.

## Open product questions (need your answer, not mine)

- What counts as late? Joining after minute 10? Submitting after minute 90? (PROPOSED defaults are in the Implementation Plan.)
- What counts as absent: never opened a question during the window?
- Can faculty reopen a closed session for a student who missed it?
- Do you have a legal copy of the MUJ lab manual you may load, or does a professor need to hand it over?

## Source

Six build docs: https://files.instinct.com/pzttn9nvst48-learnup-the-six-build-docs
Master Plan: https://files.instinct.com/file-01M3MQKF6WCVPAYMN9EYY2Z2N2
Session-evidence brief: https://files.instinct.com/zeudmkp14sdm-learnup-008-session-evidence
# PRD: what LearnUp is and why

Product requirements · MUJ DSA/DAA labs

> Extracted from the six build docs written 8 October 2026. Historical snapshot, not a fresh repo audit. The Master Plan wins on scope and order. Read design-rules.md first for the design decisions locked on 12 October; those supersede the older colour choices, accent placeholders and lesson-layout assumptions below. EXISTS refers to feature/09-classroom-core at the original review, not necessarily main today.

A PRD says what you are building, for whom, and what "done" looks like, before anyone argues about how. This one restates the Master Plan in product terms. It adds nothing that contradicts the plan; anything new is marked PROPOSED.

## How to read these six docs

### One plan rule

The Master Plan file stays the single source of truth for scope and order. These six docs explain and detail it. If a doc here ever disagrees with the plan, the plan wins and the doc is wrong. Every item below is tagged EXISTS (in the repo today), PLANNED (already in the Master Plan) or PROPOSED (new, needs your yes before it goes anywhere).

Source of what EXISTS: the repo github.com/ashazalikhan/learnup-app, branch feature/09-classroom-core (migrations 001 to 006, app/, lib/, proxy.ts, package.json), read on 8 Oct 2026. I read the migrations, the server actions, the route list and the auth proxy. I did not read every component line by line, so UI details below are described at screen level.

## The problem

A CS lab at MUJ is about 1.5 hours once a week for 12 weeks. A lot of that time goes to games and chatting. The teacher cannot see 40 screens at once, so they walk from desk to desk. Students who want the lab manual hunt seniors for it or paste from AI.

Why this matters for the product: the value is not "a coding site". Plenty of those exist. The value is that the lab period itself becomes productive and visible, using the exact MUJ experiment for that week.

## North star (your words, 5 Oct)

### LearnUp is the physical CS lab, digitized

The teacher creates, configures and joins nothing. During lab hours the teacher opens LearnUp and sees the room: which machines are live, whose they are, and whether each student is actually working on code. Students open their assigned work and solve. The teacher is a spectator.

Be honest about the gap: today a teacher still creates a section and opens a session by hand (that is the Act 2 scaffolding). The north star is where it ends up, not where phase 1 stands. The Master Plan says the same.

## Who it is for

| Person | What they need | What they must never be able to do |
| --- | --- | --- |
| Student (MUJ, DSA or DAA lab) | Join their section with a code, see this week's assigned questions, write and run code, submit, see a clear reason when it fails. | Award themselves XP, see another student's code, see hidden test answers, edit a session. |
| Faculty (lab teacher) | See the section roster for a live session: who has not started, who is working, who submitted or passed. Review stored code later. | Change another teacher's section. Faculty status is granted in the database, not self-chosen at signup. |
| You (builder/admin) | Grant faculty access, apply migrations, run a demo on one laptop. | Nothing special beyond running the Supabase dashboard yourself. |

## Scope: in and out

| Item | Status | Note |
| --- | --- | --- |
| Email and Google sign-in, dashboard, 5-language editor (Run, Run tests, Submit) | EXISTS | From the audited baseline in the plan. |
| Server grading: JS in Node, other languages through self-hosted Piston | EXISTS | node:vm is not a security boundary; hardening is deferred to pre-deployment. |
| 10 placeholder Arrays lessons, sequential unlock, XP, streak, PathMap | EXISTS | Stand-ins until real MUJ questions go in. |
| Sections, join codes, "My labs" page, faculty roster, RLS isolation proofs | EXISTS | Code-complete on feature/09, proofs passed 6 Oct, demo seed being run. |
| 90-minute lab session: timer, late and absent handling, reopen | PLANNED | Act 2. Rules must be decided before coding timers (see Implementation Plan). |
| Real MUJ DSA/DAA manual mapped week by week | PLANNED | Needs an authorized source and usage rights. |
| Roster states not started, coding, stuck, submitted from server events | PLANNED | Today the roster has not started, opened, submitted, passed. "Coding" and "stuck" come later. |
| Store submitted source and outcome, faculty code review, student receipt | PLANNED | After Act 2 core. |
| Reference lab record unlock after verified completion | PLANNED | Say "reference record unlocked on completion" to faculty. |
| Weekly, section-relative, consistency-scored leaderboard | PLANNED | Act 3. Locked: weekly reset, no global XP race, no speed contest. |
| Auth, ownership checks, rate limits and isolation on code execution | PLANNED | Deferred to pre-deployment, not needed for a controlled local demo. |
| Server-owned atomic progression (no forging XP or passes) | PLANNED | Same deferral. |
| Mobile, ML lab, computer-network lab, other courses | OUT | Desktop-only, DSA and DAA only. |
| Coddy-style extras: daily missions, practice area, store | OUT for now | In no act yet. Your call later. |

## Requirements by feature

Each requirement has a test you can run by hand. A requirement without a check is a wish.

| ID | Requirement | Check (how you know it works) |
| --- | --- | --- |
| R1 | A student joins a section using an 8-character code. | Wrong code gives an error; right code lands on My labs with that section listed. Disabled code is refused. |
| R2 | Faculty only sees and manages sections they belong to as faculty. | Faculty B cannot open Faculty A's section or roster (the isolation proof script covers this). |
| R3 | A live session shows its assigned questions in curriculum order. | Student sees the same ordered questions the faculty created. |
| R4 | Faculty roster shows each student's state per question and refreshes without a manual reload. | Open a lesson as student S, watch roster move to opened, then passed after a correct submit. |
| R5 | A failed submission says why: timeout, runtime error, runner unavailable, or wrong answer. | Stop Piston, submit: message says runner unavailable, never "wrong answer". |
| R6 | Grading is trustworthy: known-correct solutions pass, known-wrong fail. | Proof PR #5: 50 of 50 correct pass, 50 of 50 wrong fail on real Piston. |
| R7 | Shared lab PCs sign out after idle time. | Idle for 12 minutes, you are signed out (IdleLogout in the app). |
| R8 (PLANNED) | A session has a 90-minute window with clear start and end. | Defined in the Phase 2 brief once late/absent rules are decided. |
| R9 (PLANNED) | Completing a session's questions unlocks that experiment's reference record. | A forged pass must not unlock it. |

## Success: what "real product" means

- One real MUJ DSA/DAA section completes a full 12-week cycle on it, not a demo.
- A professor can answer "who actually did the work this week?" from LearnUp alone, with evidence they trust.
- It survives college Wi-Fi: when the code runner or network fails, student work is kept and nothing falsely shows as passed.
- It is free for the pilot section. Do not claim a faculty dashboard is new; Coddy and CodeHS have them. Your edge is exact MUJ curriculum, the 90-minute lab shape, trustworthy in-session evidence, free pricing, and the manual unlock.

### Check before pitching

Competitor facts in the plan were checked 29 Sep 2026. Recheck pricing and features before using them with faculty.

## Open product questions (need your answer, not mine)

- What counts as late? Joining after minute 10? Submitting after minute 90? (PROPOSED defaults are in the Implementation Plan.)
- What counts as absent: never opened a question during the window?
- Can faculty reopen a closed session for a student who missed it?
- Do you have a legal copy of the MUJ lab manual you may load, or does a professor need to hand it over?

## Source

Six build docs: https://files.instinct.com/pzttn9nvst48-learnup-the-six-build-docs
Master Plan: https://files.instinct.com/file-01M3MQKF6WCVPAYMN9EYY2Z2N2
Session-evidence brief: https://files.instinct.com/zeudmkp14sdm-learnup-008-session-evidence
