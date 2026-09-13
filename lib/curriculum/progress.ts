import type { SupabaseClient } from "@supabase/supabase-js";

export type LessonProgressStatus = "in_progress" | "completed";

export interface LessonProgressRow {
  lesson_key: string;
  status: LessonProgressStatus;
  attempts: number;
}

export async function fetchUserLessonProgress(
  supabase: SupabaseClient,
  userId: string
): Promise<Map<string, LessonProgressRow>> {
  const { data, error } = await supabase
    .from("user_lesson_progress")
    .select("lesson_key, status, attempts")
    .eq("user_id", userId);

  if (error) {
    console.error("user_lesson_progress select failed", error.message);
    return new Map();
  }

  const map = new Map<string, LessonProgressRow>();
  for (const row of data ?? []) {
    map.set(row.lesson_key, row as LessonProgressRow);
  }
  return map;
}

export function getCompletedKeys(progress: Map<string, LessonProgressRow>): Set<string> {
  const completed = new Set<string>();
  for (const [key, row] of progress) {
    if (row.status === "completed") completed.add(key);
  }
  return completed;
}
