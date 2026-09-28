import { Button, buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/Navbar";
import { createClient } from "@/lib/supabase/server";
import { ensureProfile } from "@/lib/profiles";
import { logout } from "@/app/actions";
import { PathMap, type NodeState } from "@/components/dashboard/PathMap";
import {
  getCurrentLessonKey,
  getOrderedLessonKeys,
  getPath,
} from "@/lib/curriculum/loader";
import {
  fetchUserLessonProgress,
  getCompletedKeys,
} from "@/lib/curriculum/progress";

const PATH_ID = "arrays";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const profile = user ? await ensureProfile(supabase, user) : null;
  const firstName = profile?.display_name?.split(" ")[0] ?? "there";

  const path = getPath(PATH_ID)!;
  const orderedKeys = getOrderedLessonKeys(PATH_ID);

  const progress = user
    ? await fetchUserLessonProgress(supabase, user.id)
    : new Map();
  const completedKeys = getCompletedKeys(progress);
  const completedCount = path.lessons.filter((lesson) =>
    completedKeys.has(`${PATH_ID}/${lesson.slug}`)
  ).length;

  const currentKey = getCurrentLessonKey(orderedKeys, completedKeys);
  const [currentPath, currentSlug] = currentKey.split("/");
  const currentLesson = path.lessons.find((l) => l.slug === currentSlug);
  const pathComplete = completedCount === path.lessons.length;

  const nodeStates: NodeState[] = path.lessons.map((lesson) => {
    const key = `${PATH_ID}/${lesson.slug}`;
    if (completedKeys.has(key)) return "completed";
    if (key === currentKey) return "current";
    return "locked";
  });

  const resumeHref = `/learn/${currentPath}/${currentSlug}`;
  const resumeLabel = pathComplete
    ? "Replay path"
    : completedCount === 0
      ? `Start: ${currentLesson?.title ?? "Lesson 1"}`
      : `Resume: ${currentLesson?.title ?? "Lesson"}`;

  const practiceHref = resumeHref;

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
                href={practiceHref}
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

            <PathMap
              path={path}
              nodeStates={nodeStates}
              completedCount={completedCount}
              resumeHref={resumeHref}
              resumeLabel={resumeLabel}
              pathComplete={pathComplete}
            />

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
                <p className="text-sm text-foreground font-bold mb-1">
                  {currentLesson?.title ?? "Arrays"}
                </p>
                <p className="text-xs text-text-secondary leading-relaxed mb-4">
                  {pathComplete
                    ? "You finished the Arrays path. Replay any lesson to stay sharp."
                    : `Your next lesson in the Arrays unit.`}
                </p>
                <Link
                  href={resumeHref}
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "w-full h-10 text-xs inline-flex"
                  )}
                >
                  Open lesson
                </Link>
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
