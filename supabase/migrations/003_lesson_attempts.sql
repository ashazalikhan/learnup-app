-- Lesson pass/fail attempts (Phase 2). XP/streak wiring lands in Phase 3.

create table if not exists public.lesson_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_key text not null,
  language text not null,
  passed boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists lesson_attempts_user_id_idx
  on public.lesson_attempts (user_id, created_at desc);

alter table public.lesson_attempts enable row level security;

drop policy if exists "lesson_attempts_select_own" on public.lesson_attempts;
create policy "lesson_attempts_select_own"
  on public.lesson_attempts for select
  using (auth.uid() = user_id);

drop policy if exists "lesson_attempts_insert_own" on public.lesson_attempts;
create policy "lesson_attempts_insert_own"
  on public.lesson_attempts for insert
  with check (auth.uid() = user_id);
