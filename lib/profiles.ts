import type { User } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

export type Profile = {
  id: string;
  display_name: string;
  xp: number;
  streak: number;
  last_active_date: string | null;
};

function displayNameFromUser(user: User) {
  const meta = user.user_metadata?.display_name;
  if (typeof meta === "string" && meta.trim()) return meta.trim();
  if (user.email) return user.email.split("@")[0] ?? "Learner";
  return "Learner";
}

/** Inserts a profile if the auth trigger did not run (older accounts). */
export async function ensureProfile(
  supabase: SupabaseClient,
  user: User
): Promise<Profile | null> {
  const { data: existing, error: selectError } = await supabase
    .from("profiles")
    .select("id, display_name, xp, streak, last_active_date")
    .eq("id", user.id)
    .maybeSingle();

  if (selectError) {
    console.error("profiles select failed", selectError.message);
    return null;
  }

  if (existing) return existing as Profile;

  const row = {
    id: user.id,
    display_name: displayNameFromUser(user),
    xp: 0,
    streak: 0,
    last_active_date: null as string | null,
  };

  const { data: inserted, error: insertError } = await supabase
    .from("profiles")
    .insert(row)
    .select("id, display_name, xp, streak, last_active_date")
    .single();

  if (insertError) {
    console.error("profiles insert failed", insertError.message);
    return null;
  }

  return inserted as Profile;
}
