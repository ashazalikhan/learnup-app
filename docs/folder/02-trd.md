# TRD: stack and architecture

Technical requirements · how it is built

> Extracted from the six build docs written 8 October 2026. Historical snapshot, not a fresh repo audit. The Master Plan wins on scope and order. Read design-rules.md first for the design decisions locked on 12 October; those supersede the older colour choices, accent placeholders and lesson-layout assumptions below. EXISTS refers to feature/09-classroom-core at the original review, not necessarily main today.

The TRD explains what technology the app uses and why, so future-you does not re-decide it in every Cursor chat. Everything in the first two sections describes the repo as it is today.

## The stack and why each piece is there

| Piece | Version / detail | Why |
| --- | --- | --- |
| Next.js (App Router) | 16.3.4, React 19.2.8, TypeScript | One codebase for pages and server code. Server actions let the browser call server functions without you writing a separate REST API. |
| Supabase (hosted, free tier) | Auth + Postgres + Row Level Security. Project ref in package.json db:link script. | Gives login and a real database with per-row access rules, with no server to run. Free tier pauses after about 7 days idle; restore from the dashboard. |
| @supabase/ssr | 0.12.5 | Keeps the login session in cookies so server code can know who the user is. |
| Piston (self-hosted, Docker) | Container piston_api on port 2000, PISTON_RUN_TIMEOUT in milliseconds | Runs Python, C++, Java and others in an isolated runner. The public Piston went whitelist-only in Feb 2026, so self-hosting is required. |
| JavaScript grading | node:vm inside the Next server | Fast, but NOT a security boundary. Fine for a controlled demo, must move out before real students (PLANNED, pre-deployment). |
| CodeMirror 6 | Language packs for JS, Python, C++, Java | The in-browser code editor. |
| Tailwind 4, shadcn, @base-ui/react, lucide-react, next-themes | UI building blocks | Fast consistent UI. Visual polish is Act 3. |
| Cursor + Grok/Composer, GitHub | phase-and-push workflow | One branch per phase, reviewed on the real diff before merge. |

## How a request flows

```text
Browser (desktop)
   |  page load / form post / server action
   v
Next.js server
   proxy.ts            refresh Supabase cookie, redirect logged-out users
   app/ pages          render screens (server components)
   app/actions/*.ts    server actions: the "API"
   |
   |-- Supabase client (user cookie) --> Postgres + RLS + RPC functions
   |-- lib/execution/*  --------------> Piston (Docker, :2000) for non-JS
   |-- node:vm (JS only, in process)
```

Why this shape: the browser never holds a secret key and never talks to Piston directly. Anything that decides a grade runs on the server. Anything that decides who may see a row is decided by the database (RLS and RPC checks), so a bug in a page cannot leak another section's data.

## Auth and route protection

- EXISTS: email and Google sign-in; /auth/callback handles the confirmation redirect.
- EXISTS: proxy.ts (Next 16 name for middleware) refreshes the session and protects /dashboard, /join and /faculty. Logged-out users are sent to /login; logged-in users are kept off /login and /register.
- EXISTS: components/IdleLogout.tsx signs out after 12 minutes idle (lib/lab-session.ts) because lab PCs are shared.
- EXISTS: faculty status is a row in faculty_grants, written only by the database owner (you, in the SQL editor). Users cannot grant themselves.
- PLANNED (parked, post Act 2): the email confirmation link should land the user inside the app, logged in, not back on login.

## Database access model (the part most worth understanding)

Two layers protect data. RLS policies say which rows a signed-in user may read. For writes that need judgment (create a section, join with a code), the app calls RPC functions: Postgres functions marked security definer that check the caller's rights inside the function. Direct table writes by students are blocked for the classroom tables.

- Classroom tables (005): select-only for authenticated users, scoped by section membership. All writes go through RPCs.
- RPC authorization pattern: must be signed in, must have a faculty_grants row, must be faculty in that specific section. Otherwise the function raises "not allowed".
- Migrations are numbered SQL files in supabase/migrations, additive-only, applied by you in the hosted SQL editor after review. 001 to 006 are applied on hosted as of 6 Oct.
- Proof script supabase/classroom-isolation-proofs.sql checks isolation by hand; it keeps REPLACE_ placeholder emails in the repo on purpose.

### Known gap you already accepted

RLS on lesson_attempts and user_lesson_progress still lets a student write their own rows, so XP and passes can be forged. That is why LearnUp is for controlled local demos only until server-owned progression lands (PLANNED, pre-deployment).

## Code execution design

- Server actions in app/actions/lesson.ts: executeCodeAction, executeWithPistonAction, runLessonTestsAction, submitLessonAttempt.
- lib/execution/ holds the pieces: piston.ts (call the runner), run-javascript-server.ts, run-tests.ts, compare.ts, fixture-encoding.ts, failure-reason.ts (+ test), language-map.ts.
- Run can fall back to Pyodide in the browser; Submit must grade on the server.
- Piston run timeout is in milliseconds (default cap 3000). Sending seconds caused the September phantom-timeout bug.
- A runner failure must be reported as "runner unavailable", never as a failed solution (shipped in PR #4).
- PLANNED: auth and ownership checks, rate limits, isolated JS runner, hidden tests kept server-side. Deferred to pre-deployment.

## Environments and deploy

- Local: C:\Users\Ashaz\Desktop\learnup on Windows, npm run dev, Piston in Docker, hosted Supabase configured in .env.local. There is no local Supabase.
- Required env: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, PISTON_API_URL (http://localhost:2000/api/v2, no /piston suffix).
- Why hosted Supabase for the demo: one real database means the demo is the real system, and faculty plus student windows on one laptop behave exactly like production.
- PROPOSED: for the pilot, Piston needs a host reachable from the college network (a college lab server or a small VPS). Local-only Docker works for one-laptop demos but not for 40 student PCs. Decide this in Act 3, not now.

## Technical constraints for the pilot

- About 40 students on one section polling a roster: keep roster queries cheap (one RPC per poll, indexed by section). Current polling uses pollSessionRoster / pollFacultySession server actions.
- College Wi-Fi is unreliable: Act 3 needs preserved work and clear retry states (PLANNED).
- Free Supabase confirmation emails are slow and rate-limited; test accounts are confirmed by hand. For a real pilot, set up a custom SMTP sender or let faculty pre-register students (PROPOSED).
- Add tests only after features settle (your decision). Until then acceptance checks and proofs stand in for a suite.

## Source

Six build docs: https://files.instinct.com/pzttn9nvst48-learnup-the-six-build-docs
Master Plan: https://files.instinct.com/file-01M3MQKF6WCVPAYMN9EYY2Z2N2
Session-evidence brief: https://files.instinct.com/zeudmkp14sdm-learnup-008-session-evidence
