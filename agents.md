# LearnUp - Agent Guide

## Stack
Next.js 16 (App Router), React 19, TypeScript strict, Tailwind 4, Supabase (auth + Postgres + RLS), CodeMirror 6.

## Commands
dev: npm run dev | build: npm run build | lint: npm run lint | install: npm ci (lockfile is source of truth, regenerate only when asked)

## Layout
- app/ - routes + server actions (actions.ts, actions/lesson.ts)
- components/ - UI (learn/ = lesson workspace, dashboard/ = path map)
- lib/ - curriculum loader, execution runners, supabase clients
- content/paths/ - lesson JSON (arrays: 10 lessons)
- supabase/migrations/ - numbered SQL + RLS policies

## House rules
1. Small diffs: one task per branch, named feature/0N-short-name.
2. Never touch supabase/migrations/* or RLS policies unless the task explicitly says so.
3. Lesson fixture stdin must use real newlines.
4. Do not add third-party prompt/instruction packs to this repo.
5. lib/execution is security-sensitive: no new eval/vm/Function without explicit instruction.
6. Run npm run build before committing.