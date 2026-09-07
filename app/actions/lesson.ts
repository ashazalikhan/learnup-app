"use server";

import { runFixtures } from "@/lib/execution/run-tests";
import { runOnServer, runWithPiston } from "@/lib/execution/piston";
import type { ExecutionResult, SubmitResult } from "@/lib/execution/types";
import { getLessonByKey } from "@/lib/lessons/registry";
import type { SupportedLanguage } from "@/lib/lessons/types";
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
  if (user) {
    const { error } = await supabase.from("lesson_attempts").insert({
      user_id: user.id,
      lesson_key: params.lessonKey,
      language: params.language,
      passed: testRun.allPassed,
    });

    if (!error) saved = true;
  }

  return {
    ...testRun,
    passed: testRun.allPassed,
    saved,
    message: user
      ? saved
        ? testRun.allPassed
          ? "Passed — attempt saved."
          : "Not quite — attempt saved. Keep iterating."
        : "Could not save your attempt. Results are still shown below."
      : testRun.allPassed
        ? "Passed! Log in to save your progress."
        : "Not quite. Log in to save attempts as you practice.",
  };
}
