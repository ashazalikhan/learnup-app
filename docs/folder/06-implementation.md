# Implementation plan: phases and build order

What to build next, in order, with an exit check each

> Extracted from the six build docs written 8 October 2026. Historical snapshot, not a fresh repo audit. The Master Plan wins on scope and order. Read design-rules.md first for the design decisions locked on 12 October; those supersede the older colour choices, accent placeholders and lesson-layout assumptions below. EXISTS refers to feature/09-classroom-core at the original review, not necessarily main today.

This does not replace the Master Plan. It zooms into the next stretch of Act 2 and Act 3 and shows build order and dependencies. Rule from the plan: a box is only done after the real pushed diff and behavior are reviewed.

> Update from the 12 October conversation: the demo seed has already run successfully. Remaining demo checks and the classroom-core merge still gate session-evidence implementation. The separate approved 008 brief is narrower than the source-storage step described below. Recheck current state before acting.

## Where things stand (8 Oct 2026)

| Item | State |
| --- | --- |
| Act 1 Foundation | Effectively closed: fixtures and grading proof, failure-reason UI, lockfile, lean agents.md. Fencing execution and server-owned progression deferred to pre-deployment. |
| Act 2 phase 1 classroom core (feature/09-classroom-core) | Code-complete, reviewed, migrations 005 and 006 applied, isolation proofs passed 6 Oct, head 73400e1 per memory. Remaining: run the demo seed, two-tab concurrent-join test, student join click-through, PR, merge, delete branch. |
| Act 2 phase 2 | Next: real MUJ questions, then the 90-minute session. |
| Parked | Confirm-email lands on login; feature/04-leaderboard-challenges (do not trust the logic). |

## Build order and why

| Step | What | Depends on | Exit check | Tag |
| --- | --- | --- | --- | --- |
| 0 | Finish phase 1: run demo seed, concurrent-join test, student click-through, open PR, merge to main, delete branch | Nothing | Faculty window sees student window progress live; main builds from clean clone | PLANNED |
| 1 | README repair to describe the tested app | Step 0 | README matches what runs | PLANNED (pre-demo) |
| 2 | Professor walkthrough on one laptop | Step 0 | Written list of objections and syllabus mismatches | PLANNED |
| 3 | Decide late, absent, reopen rules (a 15-minute decision, no code) | Step 2 feedback | Rules written in the plan doc | PLANNED |
| 4 | Real MUJ manual mapped week by week; replace placeholder Arrays | Authorized source, usage rights | Week N lab shows week N experiment questions | PLANNED |
| 5 | 90-minute session: window, countdown, auto-close (migration 007) | Steps 3 and 4 | Session closes at minute 90 on server time; late tag appears | PLANNED |
| 6 | Store submitted source and outcome (008) and faculty code view | Step 5 | Professor opens exactly what a student submitted | PLANNED |
| 7 | Roster activity states from server events: coding and stuck (009) | Step 6, a stuck definition | Roster reflects live activity; failure states visible | PLANNED |
| 8 | Rehearse a full lab with a faculty account and several student accounts, including disconnect and reconnect | Steps 5 to 7 | Records match server evidence | PLANNED |
| 9 | Pre-deployment hardening: auth and rate limits on execution, isolated JS runner, server-owned atomic progress (010) | Before any real student use | Forged XP or pass attempt fails; abuse limits hold | PLANNED |
| 10 | College Wi-Fi and runner failure behavior; hidden tests | Step 9 | Piston down: work kept, no false pass | PLANNED (Act 3) |
| 11 | Reference record unlock (011) | Steps 4 and 9 | Forged pass cannot unlock | PLANNED (Act 3) |
| 12 | Weekly section leaderboard (012) | Step 9, tie and absence rules set first | Resets weekly, section-only | PLANNED (Act 3) |
| 13 | UI direction locked and key screens rebuilt | Reference products picked | Screens pass the UI brief checks | PLANNED (Act 3) |
| 14 | Regression test suite | After features settle | Covers fixtures, auth, RLS, prerequisites, concurrency, attempt storage, grader failure | PLANNED |
| 15 | Pilot with ONE MUJ DSA/DAA section | All above | A full 12-week cycle | PLANNED |

Why this order: you cannot design timers until professors tell you what late means (steps 2 and 3). You cannot store a meaningful record until sessions have windows (5 before 6). You must harden before any real student touches it (9 before 15). Leaderboard comes last because it needs trustworthy completions.

## Phase brief pattern (your working loop)

- One brief: problem, exact behavior, non-goals, tests, exit check.
- One Cursor task, fresh chat. Strong model for design and security, Composer for mechanical fixes.
- One branch feature/NN-name (next number is 10 or above, since 09 is classroom core). Verify the remote branch and commit exist; pushes have failed silently before.
- One review on the real GitHub diff. Update the plan doc in place afterward.

## PROPOSED defaults for the late/absent decision

| Question | Suggested default | Why |
| --- | --- | --- |
| Window | 90 minutes from session start; server auto-closes. | Matches the fixed lab period. |
| Late | First open after minute 10. | Short grace for logging in on shared PCs. |
| Absent | No question opened during the window. | Uses the activity signal you already have. |
| Reopen | Faculty only, per student, with a reason, recorded. | Keeps evidence trustworthy. |
| Mid-question close | Allow the in-flight submit to finish if started before close. | Avoids punishing a student for slow Wi-Fi. |

### Your decision

These are suggestions only. Phase 2 does not start until you accept or change them.

## Risks to watch

| Risk | Why it matters | Mitigation |
| --- | --- | --- |
| Piston is local Docker | Fine for a one-laptop demo, not for 40 student PCs. | Pick a hosting plan in Act 3; test at class size. |
| Forgeable XP and passes | Anything built on completions (unlock, leaderboard) is untrustworthy. | Step 9 before steps 11 and 12. |
| Free Supabase pauses and email limits | A pilot could silently go down; signup mails never arrive. | Keep-alive plan, custom SMTP, or faculty pre-registering students. |
| Manual usage rights | You cannot distribute MUJ lab manual content without permission. | Get it from an authorized source first. |
| Scope creep | Coddy-style extras tempt you before the lab core works. | Plan rule: no leaderboard or glitter before Act 3; MUJ DSA/DAA only. |

## Source

Six build docs: https://files.instinct.com/pzttn9nvst48-learnup-the-six-build-docs
Master Plan: https://files.instinct.com/file-01M3MQKF6WCVPAYMN9EYY2Z2N2
Session-evidence brief: https://files.instinct.com/zeudmkp14sdm-learnup-008-session-evidence
