# App flow: screens and navigation

Every screen, who sees it, where it goes next

> Extracted from the six build docs written 8 October 2026. Historical snapshot, not a fresh repo audit. The Master Plan wins on scope and order. Read design-rules.md first for the design decisions locked on 12 October; those supersede the older colour choices, accent placeholders and lesson-layout assumptions below. EXISTS refers to feature/09-classroom-core at the original review, not necessarily main today.

The app flow is the map of screens and how a person moves between them. The route list below comes from the real app/ folder on feature/09-classroom-core.

## Screen map (what exists)

| Route | Who | What it does | Goes to |
| --- | --- | --- | --- |
| / | Anyone | Landing page. | /login, /register, /dashboard |
| /login | Logged out | Email or Google sign-in. | /dashboard |
| /register | Logged out | Create account, confirmation email sent. | /login (known gap: should land logged in) |
| /auth/callback | System | Handles the confirmation and Google redirect, sets the session. | /dashboard |
| /dashboard | Logged in | PathMap of the 10 Arrays lessons, XP and streak, sequential unlock. | /learn/[path]/[lesson], /join |
| /learn/[path]/[lesson] | Logged in | Editor, Run, Run tests, Submit, failure reason. Records a lesson "open" for the roster. | Next lesson, /dashboard |
| /join | Logged in | Enter an 8-character code. "My labs" lists joined sections and their live sessions. | Lesson links for the session's questions |
| /faculty | Faculty | List of the faculty member's sections; create a section. | /faculty/sections/[sectionId] |
| /faculty/sections/[sectionId] | Faculty of that section | Join code (rotate, enable or disable), create a lab session (week, title, start, questions), session list. | /faculty/sessions/[sessionId] |
| /faculty/sessions/[sessionId] | Faculty of that section | Live roster per student per question. Close or reopen the session. | Back to section |

Why /faculty needs two checks: the proxy only checks you are logged in. The page and the database functions then check you have a faculty grant and belong to that section as faculty. A student typing /faculty in the URL bar gets nothing useful.

## Flow 1: student joins and works a lab (EXISTS)

```text
Register -> confirm email (hand-confirmed for tests) -> Login
  -> /dashboard
  -> /join: enter code -> join_section -> My labs
  -> open live session -> question 1 (/learn/arrays/...)
       recordLessonOpen  (roster sees "opened")
       write code -> Run / Run tests -> Submit (graded on server)
       pass: next question unlocks     fail: reason shown
  -> idle 12 min on shared PC -> signed out
```

Edge cases handled today: wrong code, disabled code, already a member, signed out mid-lab. Not handled yet: session closed while a student is mid-question (needs a rule, see Implementation Plan).

## Flow 2: faculty runs a section (EXISTS)

```text
Login -> /faculty -> create section (institution, course DSA/DAA, name)
  -> section page: copy join code, share with students
  -> create lab session (week, title, start time, picked questions)
  -> session page: roster polls, each student shows per question:
       not_started / opened / submitted / passed
  -> close session when lab ends
```

Today faculty still creates the section and session by hand. Your north star removes that: the session should appear from the curriculum and lab hours (PLANNED, after the professor walkthrough). Keep these screens as scaffolding; do not polish them.

## Flow 3: the 90-minute lab session (PLANNED, designed here)

### These are PROPOSED defaults

The plan says define late, absent and reopen rules BEFORE building timers. The rules below are my suggested starting point for you to accept or change. Nothing here is built.

```text
Session created (live) with starts_at, ends_at = starts_at + 90 min
  Student opens lab -> sees countdown (server time, not browser clock)
  Minute 0-10   : on time
  Minute 10-90  : "late" tag on roster, can still submit
  After minute 90: session auto-closes -> no new submissions
  Never opened any question -> "absent" in the record
  Faculty may reopen for one student with a reason (PROPOSED)
```

Why server time: lab PC clocks are wrong more often than you would guess, and a student could change theirs. The server decides on time, late and closed.

## Flow 4: reference record unlock (PLANNED)

```text
Student passes every question in a session (server-verified)
  -> reference record for that experiment unlocks
  -> student sees it on their lab page; faculty roster shows "record unlocked"
```

Depends on server-owned progression, otherwise a forged pass unlocks it. Also depends on having manual content you may legally show.

## Empty, loading and error states to design for

| Where | State | What the user should see |
| --- | --- | --- |
| /join | Student in no section | One box for the code and one sentence on where to get it from the teacher. |
| My labs | Section but no live session | "No live lab right now" with the next scheduled session if known. |
| Roster | No students joined | Join code shown large with an instruction line. |
| Roster | Poll fails | A visible "refresh failed" with time of last good update, not a silently frozen list. |
| Editor Submit | Runner down or timeout | Plain reason and "your code is kept". |
| Any page | Supabase paused (free tier idle) | For you: restore from dashboard. For users: a generic "try again" page (PROPOSED). |

## Source

Six build docs: https://files.instinct.com/pzttn9nvst48-learnup-the-six-build-docs
Master Plan: https://files.instinct.com/file-01M3MQKF6WCVPAYMN9EYY2Z2N2
Session-evidence brief: https://files.instinct.com/zeudmkp14sdm-learnup-008-session-evidence
