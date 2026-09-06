import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { createClient } from "@/lib/supabase/server";
import { ensureProfile } from "@/lib/profiles";
import { logout } from "@/app/actions";
import { Progress } from "@/components/ui/progress";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const profile = user ? await ensureProfile(supabase, user) : null;
  const firstName = profile?.display_name?.split(" ")[0] ?? "there";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 pt-16 flex flex-col">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent-green mb-1">
                Today
              </p>
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
                Hi, {firstName}
              </h1>
            </div>
            <form action={logout} className="sm:hidden">
              <Button variant="outline" size="sm" type="submit" className="uppercase text-xs">
                Log out
              </Button>
            </form>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr_300px] gap-8 flex-1">
            <aside className="hidden lg:flex flex-col gap-1">
              <Link
                href="/dashboard"
                className="px-4 py-3 rounded-xl bg-accent-green/10 text-accent-green font-bold text-sm border-2 border-accent-green"
              >
                Learn
              </Link>
              <Link
                href="#"
                className="px-4 py-3 rounded-xl text-text-secondary hover:text-text-primary hover:bg-surface-secondary font-bold text-sm transition-colors"
              >
                Practice
              </Link>
              <Link
                href="#"
                className="px-4 py-3 rounded-xl text-text-secondary hover:text-text-primary hover:bg-surface-secondary font-bold text-sm transition-colors"
              >
                Leaderboard
              </Link>
            </aside>

            <div className="flex flex-col justify-center min-h-[420px] rounded-2xl bg-card border-2 border-border p-10 md:p-12 shadow-[0_4px_0_var(--border)]">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent-green mb-3">
                Unit 1
              </p>
              <h2 className="text-3xl font-extrabold text-foreground mb-3 tracking-tight">
                Arrays
              </h2>
              <p className="text-text-secondary max-w-md mb-6 leading-relaxed">
                Indexing, traversal, and in-place tricks. Editor and lessons land in the next phase — this card is the path you will resume.
              </p>
              <Progress value={0} className="mb-8 max-w-sm">
                <span className="text-xs font-bold text-text-muted">0 / 12 lessons</span>
              </Progress>
              <Button size="lg" variant="cta" className="w-fit px-8 h-12" disabled>
                Coming next: lessons
              </Button>
            </div>

            <div className="space-y-5">
              <div className="rounded-2xl border-2 border-border bg-surface p-5 shadow-[0_4px_0_var(--border)]">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-extrabold text-foreground uppercase tracking-wide">
                    Daily
                  </h3>
                  <span className="text-[10px] font-bold uppercase tracking-wide text-energy bg-energy/10 px-2 py-1 rounded-md">
                    Warm-up
                  </span>
                </div>
                <p className="text-sm text-foreground font-bold mb-1">Reverse a string in place</p>
                <p className="text-xs text-text-secondary leading-relaxed mb-4">
                  Array of characters. No extra buffer. Same idea as the Arrays unit.
                </p>
                <Button variant="outline" className="w-full h-10 text-xs" disabled>
                  Unlocks with the editor
                </Button>
              </div>

              <div className="rounded-2xl border-2 border-border bg-surface p-5 shadow-[0_4px_0_var(--border)]">
                <h3 className="text-sm font-extrabold text-foreground uppercase tracking-wide mb-4">
                  You
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-wide text-text-muted">XP</span>
                    <span className="text-sm font-extrabold tabular-nums text-accent-green">
                      {profile?.xp ?? 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-wide text-text-muted">Streak</span>
                    <span className="text-sm font-extrabold tabular-nums text-energy">
                      {profile?.streak ?? 0} day{(profile?.streak ?? 0) === 1 ? "" : "s"}
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-text-muted mt-4 leading-relaxed">
                  Idle 12 minutes and you are signed out. Use Log out before you leave the seat.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
