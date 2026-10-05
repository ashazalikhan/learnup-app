import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { JoinForm } from "@/components/classroom/JoinForm";
import { buttonVariants } from "@/components/ui/button";
import { getLessonByKey, getOrderedLessonKeys, isLessonUnlocked } from "@/lib/curriculum/loader";
import { fetchUserLessonProgress, getCompletedKeys } from "@/lib/curriculum/progress";
import { lessonCellStatus, statusLabel } from "@/lib/classroom/status";
import { formatInIst } from "@/lib/classroom/time";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function JoinPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const memberships = user
    ? (
        await supabase
          .from("section_memberships")
          .select("section_id, role")
          .eq("user_id", user.id)
      ).data ?? []
    : [];

  const sectionIds = memberships.map((m) => m.section_id);

  const sections =
    sectionIds.length > 0
      ? (await supabase.from("sections").select("id, name, course_id").in("id", sectionIds)).data ?? []
      : [];

  const courseIds = [...new Set(sections.map((s) => s.course_id))];
  const courses =
    courseIds.length > 0
      ? (await supabase.from("courses").select("id, code, name, institution_id").in("id", courseIds)).data ??
        []
      : [];

  const institutionIds = [...new Set(courses.map((c) => c.institution_id))];
  const institutions =
    institutionIds.length > 0
      ? (await supabase.from("institutions").select("id, name").in("id", institutionIds)).data ?? []
      : [];

  const sessions =
    sectionIds.length > 0
      ? (
          await supabase
            .from("lab_sessions")
            .select("id, section_id, week_no, title, starts_at, status")
            .in("section_id", sectionIds)
            .order("week_no")
            .order("starts_at")
        ).data ?? []
      : [];

  const sessionIds = sessions.map((s) => s.id);
  const questions =
    sessionIds.length > 0
      ? (
          await supabase
            .from("lab_session_questions")
            .select("session_id, lesson_key, position")
            .in("session_id", sessionIds)
            .order("position")
        ).data ?? []
      : [];

  const progressRows = user
    ? (await supabase.from("user_lesson_progress").select("lesson_key, status").eq("user_id", user.id))
        .data ?? []
    : [];
  const attemptRows = user
    ? (await supabase.from("lesson_attempts").select("lesson_key, passed").eq("user_id", user.id)).data ??
      []
    : [];
  const openRows = user
    ? (await supabase.from("lesson_opens").select("lesson_key").eq("user_id", user.id)).data ?? []
    : [];

  const completedKeys = new Set(
    progressRows.filter((r) => r.status === "completed").map((r) => r.lesson_key)
  );
  const passedAttemptKeys = new Set(
    attemptRows.filter((r) => r.passed).map((r) => r.lesson_key)
  );
  const anyAttemptKeys = new Set(attemptRows.map((r) => r.lesson_key));
  const anyProgressKeys = new Set(progressRows.map((r) => r.lesson_key));
  const openedKeys = new Set(openRows.map((r) => r.lesson_key));

  const orderedPathKeys = getOrderedLessonKeys("arrays");
  const progressMap = user ? await fetchUserLessonProgress(supabase, user.id) : new Map();
  const pathCompleted = getCompletedKeys(progressMap);

  const courseById = new Map(courses.map((c) => [c.id, c]));
  const institutionById = new Map(institutions.map((i) => [i.id, i]));
  const questionsBySession = new Map<string, typeof questions>();
  for (const q of questions) {
    const list = questionsBySession.get(q.session_id) ?? [];
    list.push(q);
    questionsBySession.set(q.session_id, list);
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-16">
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
          <div>
            <h1 className="text-2xl font-extrabold text-foreground">Lab</h1>
            <p className="text-sm text-text-secondary mt-1">
              Join a faculty section and work assigned questions on your path.
            </p>
          </div>

          <section className="rounded-2xl border-2 border-border bg-card p-5 space-y-3">
            <h2 className="text-sm font-extrabold uppercase tracking-wide">Join with code</h2>
            <JoinForm />
          </section>

          {sections.length === 0 ? (
            <p className="text-sm text-text-secondary">Enter a join code from your faculty.</p>
          ) : null}

          <p className="text-xs text-text-muted leading-relaxed">
            Existing lesson progress, including work before this session. Statuses come from
            student-side records and are not tamper-proof.
          </p>
          <p className="text-xs text-text-muted">
            These assigned questions are placeholder Arrays lessons, not the weekly MUJ curriculum.
          </p>

          {sections.map((section) => {
            const course = courseById.get(section.course_id);
            const institution = course ? institutionById.get(course.institution_id) : null;
            const sectionSessions = sessions.filter((s) => s.section_id === section.id);

            return (
              <div key={section.id} className="space-y-4">
                <h2 className="text-lg font-extrabold text-foreground">
                  {section.name}
                  {course ? (
                    <span className="text-sm font-normal text-text-secondary">
                      {" "}
                      · {institution?.name} · {course.code}
                    </span>
                  ) : null}
                </h2>

                {sectionSessions.length === 0 ? (
                  <p className="text-sm text-text-muted">No lab sessions yet.</p>
                ) : null}

                {sectionSessions.map((session) => {
                  const sessionQuestions = questionsBySession.get(session.id) ?? [];
                  const passedCount = sessionQuestions.filter(
                    (q) =>
                      lessonCellStatus(q.lesson_key, {
                        completedKeys,
                        passedAttemptKeys,
                        anyAttemptKeys,
                        anyProgressKeys,
                        openedKeys,
                      }) === "passed"
                  ).length;

                  return (
                    <article
                      key={session.id}
                      className="rounded-2xl border-2 border-border bg-surface p-5 space-y-4"
                    >
                      <div className="flex flex-wrap items-center gap-2 justify-between">
                        <div>
                          <h3 className="font-extrabold text-foreground">{session.title}</h3>
                          <p className="text-xs text-text-secondary">
                            Week {session.week_no} · Starts {formatInIst(session.starts_at)}
                          </p>
                        </div>
                        <span
                          className={cn(
                            "text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-md",
                            session.status === "closed"
                              ? "bg-muted text-text-muted"
                              : "bg-accent-green/10 text-accent-green"
                          )}
                        >
                          {session.status === "closed" ? "Closed" : "Live"}
                        </span>
                      </div>

                      {session.status === "closed" ? (
                        <p className="text-xs text-text-muted">
                          This session is closed. Closing does not lock lessons on your path.
                        </p>
                      ) : null}

                      <p className="text-xs font-bold text-text-secondary">
                        {passedCount}/{sessionQuestions.length} completed
                      </p>

                      <ul className="space-y-2">
                        {sessionQuestions.map((q) => {
                          const lesson = getLessonByKey(q.lesson_key);
                          const title = lesson?.title ?? q.lesson_key;
                          const status = lessonCellStatus(q.lesson_key, {
                            completedKeys,
                            passedAttemptKeys,
                            anyAttemptKeys,
                            anyProgressKeys,
                            openedKeys,
                          });
                          const unlocked = isLessonUnlocked(
                            orderedPathKeys,
                            pathCompleted,
                            q.lesson_key
                          );
                          const prevKey =
                            orderedPathKeys[orderedPathKeys.indexOf(q.lesson_key) - 1];
                          const prevLesson = prevKey ? getLessonByKey(prevKey) : null;

                          return (
                            <li
                              key={q.lesson_key}
                              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-t border-border pt-2 first:border-t-0 first:pt-0"
                            >
                              <div>
                                <p className="text-sm font-bold text-foreground">{title}</p>
                                <p className="text-xs text-text-muted">{statusLabel(status)}</p>
                              </div>
                              {unlocked ? (
                                <Link
                                  href={`/learn/${q.lesson_key.split("/")[0]}/${q.lesson_key.split("/")[1]}`}
                                  className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                                >
                                  {status === "passed" ? "Continue" : "Start"}
                                </Link>
                              ) : (
                                <span className="text-xs text-text-muted">
                                  Finish {prevLesson?.title ?? "the previous lesson"} on your path
                                  first.
                                </span>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </article>
                  );
                })}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
