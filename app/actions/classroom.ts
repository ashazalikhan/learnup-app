"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getLessonByKey, getOrderedLessonKeys, isLessonUnlocked } from "@/lib/curriculum/loader";
import { ARRAYS_LESSON_ALLOWLIST, arraysAllowlistMatches } from "@/lib/classroom/allowlist";
import {
  type ClassroomActionResult,
  actionError,
  actionSuccess,
} from "@/lib/classroom/action-result";
import { fetchUserLessonProgress, getCompletedKeys } from "@/lib/curriculum/progress";
import { istLocalInputToIso, parseStrictWeek } from "@/lib/classroom/time";

export async function returnToLab() {
  revalidatePath("/join");
  redirect("/join");
}

export async function joinWithCode(formData: FormData): Promise<{ error?: string }> {
  const raw = formData.get("code");
  const code = typeof raw === "string" ? raw : "";

  const supabase = await createClient();
  const { data: sectionId, error } = await supabase.rpc("join_section", { p_code: code });

  if (error || !sectionId) {
    return { error: "That code didn't work." };
  }

  const { data: section, error: sectionError } = await supabase
    .from("sections")
    .select("name")
    .eq("id", sectionId)
    .maybeSingle();

  if (sectionError || !section?.name) {
    return { error: "That code didn't work." };
  }

  revalidatePath("/join");
  redirect(`/join?joined=${encodeURIComponent(section.name)}`);
}

export async function createSectionAction(formData: FormData): Promise<ClassroomActionResult> {
  const institutionName = String(formData.get("institution_name") ?? "");
  const courseCode = String(formData.get("course_code") ?? "");
  const sectionName = String(formData.get("section_name") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.rpc("create_section", {
    p_institution_name: institutionName,
    p_course_code: courseCode,
    p_section_name: sectionName,
  });

  if (error) {
    if (error.message.includes("not allowed")) {
      return actionError("You do not have faculty access to create sections.", true);
    }
    if (error.message.includes("invalid section")) {
      return actionError("Check institution, course, and section name.");
    }
    return actionError("Could not create section.");
  }

  revalidatePath("/faculty");
  return actionSuccess("Section created.");
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
): Promise<ClassroomActionResult> {
  const title = String(formData.get("title") ?? "");
  const weekRaw = String(formData.get("week_no") ?? "");
  const weekNo = parseStrictWeek(weekRaw);
  const startsLocal = String(formData.get("starts_at") ?? "");
  const startsAt = istLocalInputToIso(startsLocal);

  const ordered = getOrderedLessonKeys("arrays");
  if (!arraysAllowlistMatches(ordered)) {
    return actionError("Curriculum allowlist mismatch.");
  }

  const keys: string[] = [];
  for (const allowKey of ARRAYS_LESSON_ALLOWLIST) {
    if (formData.get(`lesson_${allowKey}`) === "on") {
      keys.push(allowKey);
    }
  }

  const keyError = validateLessonKeys(keys);
  if (keyError) {
    return actionError("Select valid questions in allowlist order.");
  }
  if (weekNo === null) {
    return actionError("Week must be an integer from 1 to 16.");
  }
  if (!startsAt) {
    return actionError("Enter a valid start date and time (IST).");
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("create_lab_session", {
    p_section_id: sectionId,
    p_week_no: weekNo,
    p_title: title,
    p_starts_at: startsAt,
    p_lesson_keys: keys,
  });

  if (error) {
    if (error.message.includes("not allowed")) {
      return actionError("You do not have faculty access to this section.", true);
    }
    if (error.message.includes("invalid session")) {
      return actionError("Check session title, week, and start time.");
    }
    if (error.message.includes("invalid questions")) {
      return actionError("Check selected questions.");
    }
    return actionError("Could not create session.");
  }

  revalidatePath(`/faculty/sections/${sectionId}`);
  revalidatePath("/join");
  return actionSuccess("Lab session created (live).");
}

export async function rotateJoinCodeFromForm(formData: FormData): Promise<ClassroomActionResult> {
  const sectionId = String(formData.get("section_id") ?? "");
  return rotateJoinCodeAction(sectionId);
}

export async function setJoinEnabledFromForm(formData: FormData): Promise<ClassroomActionResult> {
  const sectionId = String(formData.get("section_id") ?? "");
  const enabled = formData.get("enabled") === "true";
  return setJoinEnabledAction(sectionId, enabled);
}

export async function rotateJoinCodeAction(sectionId: string): Promise<ClassroomActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("rotate_join_code", { p_section_id: sectionId });
  if (error) {
    if (error.message.includes("not allowed")) {
      return actionError("You do not have faculty access to this section.", true);
    }
    return actionError("Could not rotate join code.");
  }
  revalidatePath("/faculty");
  revalidatePath(`/faculty/sections/${sectionId}`);
  return actionSuccess("Join code rotated.");
}

export async function setJoinEnabledAction(
  sectionId: string,
  enabled: boolean
): Promise<ClassroomActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("set_join_enabled", {
    p_section_id: sectionId,
    p_enabled: enabled,
  });
  if (error) {
    if (error.message.includes("not allowed")) {
      return actionError("You do not have faculty access to this section.", true);
    }
    if (error.message.includes("invalid section")) {
      return actionError("Could not update join code.");
    }
    return actionError("Could not update join code.");
  }
  revalidatePath("/faculty");
  revalidatePath(`/faculty/sections/${sectionId}`);
  return actionSuccess(enabled ? "Join code enabled." : "Join code disabled.");
}

export async function setLabSessionStatusFromForm(
  formData: FormData
): Promise<ClassroomActionResult> {
  const sessionId = String(formData.get("session_id") ?? "");
  const sectionId = String(formData.get("section_id") ?? "");
  const status = formData.get("status") === "closed" ? "closed" : "live";
  return setLabSessionStatusAction(sessionId, sectionId, status);
}

export async function createLabSessionFormAction(
  sectionId: string,
  formData: FormData
): Promise<ClassroomActionResult> {
  return createLabSessionAction(sectionId, formData);
}

export async function setLabSessionStatusAction(
  sessionId: string,
  sectionId: string,
  status: "live" | "closed"
): Promise<ClassroomActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("set_lab_session_status", {
    p_session_id: sessionId,
    p_status: status,
  });
  if (error) {
    if (error.message.includes("not allowed")) {
      return actionError("You do not have faculty access to this session.", true);
    }
    if (error.message.includes("invalid session")) {
      return actionError("Could not update session status.");
    }
    return actionError("Could not update session status.");
  }
  revalidatePath(`/faculty/sections/${sectionId}`);
  revalidatePath(`/faculty/sessions/${sessionId}`);
  revalidatePath("/join");
  return actionSuccess(status === "closed" ? "Session closed." : "Session reopened.");
}

export type RosterRow = {
  user_id: string;
  display_name: string;
  questions: Array<{ lesson_key: string; position: number; status: string }>;
};

export async function pollFacultySession(sessionId: string): Promise<
  | {
      ok: true;
      rows: RosterRow[];
      refreshedAt: string;
      sessionStatus: string;
      sessionTitle: string;
    }
  | { ok: false; denied: boolean; error: string }
> {
  const supabase = await createClient();
  const { data: session, error: sessionError } = await supabase
    .from("lab_sessions")
    .select("title, status")
    .eq("id", sessionId)
    .maybeSingle();

  if (sessionError) {
    return { ok: false, denied: false, error: "Could not load session." };
  }
  if (!session) {
    return { ok: false, denied: true, error: "You don't have faculty access to this session." };
  }

  const roster = await pollSessionRoster(sessionId);
  if (!roster.ok) {
    return roster;
  }

  return {
    ok: true,
    rows: roster.rows,
    refreshedAt: roster.refreshedAt,
    sessionStatus: session.status,
    sessionTitle: session.title,
  };
}

export async function pollSessionRoster(sessionId: string): Promise<
  | { ok: true; rows: RosterRow[]; refreshedAt: string }
  | { ok: false; denied: boolean; error: string }
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

export async function recordLessonOpen(lessonKey: string): Promise<{ ok: boolean }> {
  const lesson = getLessonByKey(lessonKey);
  if (!lesson || lesson.key !== lessonKey) return { ok: false };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false };

  const orderedKeys = getOrderedLessonKeys(lesson.path);
  const progress = await fetchUserLessonProgress(supabase, user.id);
  const completedKeys = getCompletedKeys(progress);
  if (!isLessonUnlocked(orderedKeys, completedKeys, lessonKey)) return { ok: false };

  const { error } = await supabase.from("lesson_opens").upsert(
    { user_id: user.id, lesson_key: lessonKey, opened_at: new Date().toISOString() },
    { onConflict: "user_id,lesson_key" }
  );

  if (error) {
    console.error("lesson_opens upsert failed", error.message);
    return { ok: false };
  }
  return { ok: true };
}
