"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_override");
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function enableAdminMode() {
  const cookieStore = await cookies();
  cookieStore.set("admin_override", "true", { path: "/" });
  redirect("/dashboard");
}

export async function disableAdminMode() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_override");
  redirect("/");
}
