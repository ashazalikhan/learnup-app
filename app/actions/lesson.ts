"use server";

import { runFixtures } from "@/lib/execution/run-tests";
import { runOnServer, runWithPiston } from "@/lib/execution/piston";
import type { ExecutionResult, SubmitResult } from "@/lib/execution/types";
import { getLessonByKey } from "@/lib/curriculum/loader";
import type { SupportedLanguage } from "@/lib/curriculum/types";
import { createClient } from "@/lib/supabase/server";

export async function executeCodeAction(params: {
  source: string;
  language: SupportedLanguage;
  stdin: string;
}): Promise<ExecutionResult> {
  return runOnServer({ ...params, timeoutMs: 5000 });
}

export async function executeWithPistonAction(params: {
  source: string;
  language: SupportedLanguage;
  stdin: string;
}): Promise<ExecutionResult> {
  return runWithPiston({ ...params, timeoutMs: 5000 });
}

export async function runLessonTestsAction(params: {
  source: string;
  language: SupportedLanguage;
  lessonKey: string;
}): Promise<SubmitResult> {
  const lesson = getLessonByKey(params.lessonKey);
  if (!lesson) {
    return {
      passed: false,
      saved: false,
      allPassed: false,
      results: [],
      error: "Lesson not found.",
    };
  }

  const testRun = await runFixtures(
    {
      source: params.source,
      language: params.language,
    },
    lesson.fixtures
  );

  return {
    ...testRun,
    passed: testRun.allPassed,
    saved: false,
    message: testRun.runnerUnavailable
      ? "Runner unavailable — tests could not be graded on the server."
      : undefined,
  };
}

function todayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayDateString(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

function computeStreak(
  currentStreak: number,
  lastActiveDate: string | null
): number {
  const today = todayDateString();
  if (lastActiveDate === today) return currentStreak;
  if (!lastActiveDate) return 1;
  if (lastActiveDate === yesterdayDateString()) return currentStreak + 1;
  return 1;
}

export async function submitLessonAttempt(params: {
  source: string;
  language: SupportedLanguage;
  lessonKey: string;
}): Promise<SubmitResult> {
  const lesson = getLessonByKey(params.lessonKey);
  if (!lesson) {
    return {
      passed: false,
      saved: false,
      allPassed: false,
      results: [],
      error: "Lesson not found.",
    };
  }

  const testRun = await runFixtures(
    {
      source: params.source,
      language: params.language,
    },
    lesson.fixtures
  );

  if (testRun.runnerUnavailable) {
    return {
      ...testRun,
      passed: false,
      saved: false,
      message:
        "Submit could not be graded — the server runner is unavailable. Try again when you have network access.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let saved = false;
  let xpAwarded = 0;
  let newlyCompleted = false;

  if (user) {
    const { error: attemptError } = await supabase.from("lesson_attempts").insert({
      user_id: user.id,
      lesson_key: params.lessonKey,
      language: params.language,
      passed: testRun.allPassed,
    });

    if (!attemptError) saved = true;

    const { data: existing } = await supabase
      .from("user_lesson_progress")
      .select("status, attempts")
      .eq("user_id", user.id)
      .eq("lesson_key", params.lessonKey)
      .maybeSingle();

    const wasCompleted = existing?.status === "completed";
    const nextAttempts = (existing?.attempts ?? 0) + 1;
    const nextStatus = testRun.allPassed ? "completed" : "in_progress";

    const { error: progressError } = await supabase
      .from("user_lesson_progress")
      .upsert(
        {
          user_id: user.id,
          lesson_key: params.lessonKey,
          status: wasCompleted ? "completed" : nextStatus,
          attempts: nextAttempts,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,lesson_key" }
      );

    if (!progressError) saved = true;

    if (testRun.allPassed && !wasCompleted) {
      newlyCompleted = true;
      xpAwarded = lesson.xp;

      const { data: profile } = await supabase
        .from("profiles")
        .select("xp, streak, last_active_date")
        .eq("id", user.id)
        .single();

      if (profile) {
        const today = todayDateString();
        const newStreak = computeStreak(profile.streak ?? 0, profile.last_active_date);

        await supabase
          .from("profiles")
          .update({
            xp: (profile.xp ?? 0) + lesson.xp,
            streak: newStreak,
            last_active_date: today,
          })
          .eq("id", user.id);
      }
    }
  }

  let message: string;
  if (!user) {
    message = testRun.allPassed
      ? "Passed! Log in to save your progress."
      : "Not quite. Log in to save attempts as you practice.";
  } else if (!saved) {
    message = "Could not save your attempt. Results are still shown below.";
  } else if (testRun.allPassed) {
    message = newlyCompleted
      ? `Passed — +${xpAwarded} XP saved.`
      : "Passed — attempt saved.";
  } else {
    message = "Not quite — attempt saved. Keep iterating.";
  }

  return {
    ...testRun,
    passed: testRun.allPassed,
    saved,
    message,
  };
}
