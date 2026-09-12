import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { ensureProfile } from "@/lib/profiles";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) await ensureProfile(supabase, user);

      const isRelativePath = next.startsWith("/") && !next.startsWith("//");
      const safeNext = isRelativePath ? next : "/dashboard";
      return NextResponse.redirect(`${origin}${safeNext}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=Could not authenticate user`);
}
