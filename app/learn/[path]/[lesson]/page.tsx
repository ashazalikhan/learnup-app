import Link from "next/link";
import { notFound } from "next/navigation";
import { LessonWorkspace } from "@/components/learn/LessonWorkspace";
import { RecordLessonOpen } from "@/components/learn/RecordLessonOpen";
import { buttonVariants } from "@/components/ui/button";
import {
  getLesson,
  getLessonIndex,
  getNextLesson,
  getOrderedLessonKeys,
  getPath,
  getPrevLesson,
  isLessonUnlocked,
} from "@/lib/curriculum/loader";
import {
  fetchUserLessonProgress,
  getCompletedKeys,
} from "@/lib/curriculum/progress";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

interface LearnLessonPageProps {
  params: Promise<{ path: string; lesson: string }>;
}

export default async function LearnLessonPage({ params }: LearnLessonPageProps) {
  const { path: pathId, lesson: lessonSlug } = await params;
  const lesson = getLesson(pathId, lessonSlug);
  const path = getPath(pathId);

  if (!lesson || !path) {
    notFound();
  }

  const lessonKey = `${pathId}/${lessonSlug}`;
  const orderedKeys = getOrderedLessonKeys(pathId);
  const lessonIndex = getLessonIndex(pathId, lessonSlug);
  const totalLessons = path.lessons.length;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const progress = user
    ? await fetchUserLessonProgress(supabase, user.id)
    : new Map();
  const completedKeys = getCompletedKeys(progress);

  const unlocked = isLessonUnlocked(orderedKeys, completedKeys, lessonKey);
  const prev = getPrevLesson(pathId, lessonSlug);
  const next = getNextLesson(pathId, lessonSlug);
  const nextUnlocked =
    next && isLessonUnlocked(orderedKeys, completedKeys, next.key);

  if (!unlocked) {
    const firstSlug = path.lessons[0]?.slug;
    const firstHref = `/learn/${pathId}/${firstSlug}`;

    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
        <div className="max-w-md w-full rounded-2xl border-2 border-border bg-card p-8 shadow-[0_4px_0_var(--border)] text-center space-y-4">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-energy">Locked</p>
          <h1 className="text-2xl font-extrabold text-foreground">{lesson.title}</h1>
          <p className="text-sm text-text-secondary leading-relaxed">
            {user
              ? "Finish the previous lesson to unlock this one."
              : "Log in and complete earlier lessons to unlock this one. Guests can play lesson 1 only."}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              href={firstHref}
              className={cn(buttonVariants({ variant: "cta" }), "h-11")}
            >
              {user ? "Go to current lesson" : "Start lesson 1"}
            </Link>
            {!user ? (
              <Link
                href="/login"
                className={cn(buttonVariants({ variant: "outline" }), "h-11")}
              >
                Log in
              </Link>
            ) : (
              <Link
                href="/dashboard"
                className={cn(buttonVariants({ variant: "outline" }), "h-11")}
              >
                Dashboard
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {user ? <RecordLessonOpen lessonKey={lessonKey} /> : null}
      <LessonWorkspace
        lesson={lesson}
        pathTitle={path.title}
        lessonNumber={lessonIndex + 1}
        totalLessons={totalLessons}
        prevLesson={prev}
        nextLesson={nextUnlocked ? next : null}
        isCompleted={completedKeys.has(lessonKey)}
      />
    </>
  );
}
