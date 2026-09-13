-- Per-lesson progress (Phase 3). lesson_attempts remains the audit log.

create table if not exists public.user_lesson_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_key text not null,
  status text not null check (status in ('in_progress', 'completed')),
  attempts integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, lesson_key)
);

create index if not exists user_lesson_progress_user_id_idx
  on public.user_lesson_progress (user_id, updated_at desc);

alter table public.user_lesson_progress enable row level security;

drop policy if exists "user_lesson_progress_select_own" on public.user_lesson_progress;
create policy "user_lesson_progress_select_own"
  on public.user_lesson_progress for select
  using (auth.uid() = user_id);

drop policy if exists "user_lesson_progress_insert_own" on public.user_lesson_progress;
create policy "user_lesson_progress_insert_own"
  on public.user_lesson_progress for insert
  with check (auth.uid() = user_id);

drop policy if exists "user_lesson_progress_update_own" on public.user_lesson_progress;
create policy "user_lesson_progress_update_own"
  on public.user_lesson_progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
