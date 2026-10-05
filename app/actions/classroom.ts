"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getLessonByKey, getOrderedLessonKeys, isLessonUnlocked } from "@/lib/curriculum/loader";
import { ARRAYS_LESSON_ALLOWLIST, arraysAllowlistMatches } from "@/lib/classroom/allowlist";
import { fetchUserLessonProgress, getCompletedKeys } from "@/lib/curriculum/progress";
import { istLocalInputToIso } from "@/lib/classroom/time";

export async function returnToLab() {
  revalidatePath("/join");
  redirect("/join");
}

export async function joinWithCode(formData: FormData): Promise<{ error?: string }> {
  const raw = formData.get("code");
  const code = typeof raw === "string" ? raw : "";

  const supabase = await createClient();
  const { error } = await supabase.rpc("join_section", { p_code: code });

  if (error) {
    return { error: "That code didn't work." };
  }

  revalidatePath("/join");
  redirect("/join");
}

export async function createSectionAction(formData: FormData): Promise<void> {
  const institutionName = String(formData.get("institution_name") ?? "");
  const courseCode = String(formData.get("course_code") ?? "");
  const sectionName = String(formData.get("section_name") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.rpc("create_section", {
    p_institution_name: institutionName,
    p_course_code: courseCode,
    p_section_name: sectionName,
  });

  if (!error) {
    revalidatePath("/faculty");
  }
}

function validateLessonKeys(keys: string[]): string | null {
  if (keys.length === 0 || keys.length > 10) return "invalid questions";
  const seen = new Set<string>();
  for (const key of keys) {
    if (!key) return "invalid questions";
    if (seen.has(key)) return "invalid questions";
    seen.add(key);
    const lesson = getLessonByKey(key);
    if (!lesson || lesson.key !== key) return "invalid questions";
  }
  return null;
}

export async function createLabSessionAction(
  sectionId: string,
  formData: FormData
): Promise<void> {
  const title = String(formData.get("title") ?? "");
  const weekRaw = formData.get("week_no");
  const weekNo = typeof weekRaw === "string" ? Number.parseInt(weekRaw, 10) : NaN;
  const startsLocal = String(formData.get("starts_at") ?? "");
  const startsAt = istLocalInputToIso(startsLocal);

  const ordered = getOrderedLessonKeys("arrays");
  if (!arraysAllowlistMatches(ordered)) {
    return;
  }

  const keys: string[] = [];
  for (const allowKey of ARRAYS_LESSON_ALLOWLIST) {
    if (formData.get(`lesson_${allowKey}`) === "on") {
      keys.push(allowKey);
    }
  }

  const keyError = validateLessonKeys(keys);
  if (keyError || !startsAt) {
    return;
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("create_lab_session", {
    p_section_id: sectionId,
    p_week_no: weekNo,
    p_title: title,
    p_starts_at: startsAt,
    p_lesson_keys: keys,
  });

  if (!error) {
    revalidatePath(`/faculty/sections/${sectionId}`);
    revalidatePath("/join");
  }
}

export async function rotateJoinCodeFromForm(formData: FormData): Promise<void> {
  const sectionId = String(formData.get("section_id") ?? "");
  await rotateJoinCodeAction(sectionId);
}

export async function setJoinEnabledFromForm(formData: FormData): Promise<void> {
  const sectionId = String(formData.get("section_id") ?? "");
  const enabled = formData.get("enabled") === "true";
  await setJoinEnabledAction(sectionId, enabled);
}

export async function rotateJoinCodeAction(sectionId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("rotate_join_code", { p_section_id: sectionId });
  if (!error) {
    revalidatePath("/faculty");
    revalidatePath(`/faculty/sections/${sectionId}`);
  }
}

export async function setJoinEnabledAction(sectionId: string, enabled: boolean): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("set_join_enabled", {
    p_section_id: sectionId,
    p_enabled: enabled,
  });
  if (!error) {
    revalidatePath("/faculty");
    revalidatePath(`/faculty/sections/${sectionId}`);
  }
}

export async function setLabSessionStatusFromForm(formData: FormData): Promise<void> {
  const sessionId = String(formData.get("session_id") ?? "");
  const sectionId = String(formData.get("section_id") ?? "");
  const status = formData.get("status") === "closed" ? "closed" : "live";
  await setLabSessionStatusAction(sessionId, sectionId, status);
}

export async function createLabSessionFormAction(
  sectionId: string,
  formData: FormData
): Promise<void> {
  await createLabSessionAction(sectionId, formData);
}

export async function setLabSessionStatusAction(
  sessionId: string,
  sectionId: string,
  status: "live" | "closed"
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("set_lab_session_status", {
    p_session_id: sessionId,
    p_status: status,
  });
  if (!error) {
    revalidatePath(`/faculty/sections/${sectionId}`);
    revalidatePath("/join");
  }
}

export type RosterRow = {
  user_id: string;
  display_name: string;
  questions: Array<{ lesson_key: string; position: number; status: string }>;
};

export async function pollSessionRoster(sessionId: string): Promise<
  | { ok: true; rows: RosterRow[]; refreshedAt: string }
  | { ok: false; denied: boolean; error: string; refreshedAt?: string; rows?: RosterRow[] }
> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("session_roster", { p_session_id: sessionId });

  if (error) {
    if (error.message.includes("not allowed")) {
      return { ok: false, denied: true, error: "You don't have faculty access to this session." };
    }
    return { ok: false, denied: false, error: "Could not load roster." };
  }

  const rows = (data ?? []) as RosterRow[];
  return { ok: true, rows, refreshedAt: new Date().toISOString() };
}

export async function recordLessonOpen(lessonKey: string): Promise<void> {
  const lesson = getLessonByKey(lessonKey);
  if (!lesson || lesson.key !== lessonKey) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const orderedKeys = getOrderedLessonKeys(lesson.path);
  const progress = await fetchUserLessonProgress(supabase, user.id);
  const completedKeys = getCompletedKeys(progress);
  if (!isLessonUnlocked(orderedKeys, completedKeys, lessonKey)) return;

  await supabase.from("lesson_opens").upsert(
    { user_id: user.id, lesson_key: lessonKey, opened_at: new Date().toISOString() },
    { onConflict: "user_id,lesson_key" }
  );
}
