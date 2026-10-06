import { notFound } from "next/navigation";
import { CreateLabSessionForm } from "@/components/classroom/CreateLabSessionForm";
import { FacultySectionManage } from "@/components/classroom/FacultySectionManage";
import { SessionStatusForm } from "@/components/classroom/SessionStatusForm";
import { formatInIst } from "@/lib/classroom/time";
import { getLessonByKey } from "@/lib/curriculum/loader";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

type FacultySectionRow = {
  section_id: string;
  section_name: string;
  institution_name: string;
  course_code: string;
  course_name: string;
  join_code: string;
  join_enabled: boolean;
  student_count: number;
};

interface SectionPageProps {
  params: Promise<{ sectionId: string }>;
}

export default async function FacultySectionPage({ params }: SectionPageProps) {
  const { sectionId } = await params;
  const supabase = await createClient();

  const { data: overview, error: overviewError } = await supabase.rpc("my_faculty_sections");
  if (overviewError) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <p className="text-sm text-destructive">Could not load this section.</p>
      </div>
    );
  }

  const sections = (overview ?? []) as FacultySectionRow[];
  const section = sections.find((s) => s.section_id === sectionId);
  if (!section) notFound();

  const { data: sessions, error: sessionsError } = await supabase
    .from("lab_sessions")
    .select("id, week_no, title, starts_at, status")
    .eq("section_id", sectionId)
    .order("week_no")
    .order("starts_at");

  const sessionIds = (sessions ?? []).map((s) => s.id);
  const questionsResult =
    sessionIds.length > 0
      ? await supabase
          .from("lab_session_questions")
          .select("session_id, lesson_key, position")
          .in("session_id", sessionIds)
          .order("position")
      : { data: [], error: null };

  type QuestionRow = { session_id: string; lesson_key: string; position: number };
  const questionsBySession = new Map<string, QuestionRow[]>();
  if (!questionsResult.error) {
    for (const q of (questionsResult.data ?? []) as QuestionRow[]) {
      const list = questionsBySession.get(q.session_id) ?? [];
      list.push(q);
      questionsBySession.set(q.session_id, list);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <header className="space-y-3">
        <h1 className="text-2xl font-extrabold text-foreground">{section.section_name}</h1>
        <p className="text-sm text-text-secondary">
          {section.institution_name} · {section.course_code} {section.course_name}
        </p>
        <p className="text-xs text-text-muted">
          {section.student_count} student{section.student_count === 1 ? "" : "s"}
        </p>
        <FacultySectionManage
          sectionId={sectionId}
          joinCode={section.join_code}
          joinEnabled={section.join_enabled}
        />
      </header>

      <section className="rounded-2xl border-2 border-border bg-card p-5 space-y-4">
        <h2 className="text-sm font-extrabold uppercase tracking-wide">Create lab session</h2>
        <CreateLabSessionForm sectionId={sectionId} />
      </section>

      {sessionsError || questionsResult.error ? (
        <p className="text-sm text-destructive">Could not load lab sessions for this section.</p>
      ) : null}

      <div className="space-y-4">
        {(sessions ?? []).map((session) => {
          const sessionQuestions = questionsBySession.get(session.id) ?? [];
          return (
            <article
              key={session.id}
              className="rounded-2xl border-2 border-border bg-surface p-5 space-y-3"
            >
              <div className="flex flex-wrap justify-between gap-2">
                <div>
                  <h3 className="font-extrabold">{session.title}</h3>
                  <p className="text-xs text-text-secondary">
                    Week {session.week_no} · {formatInIst(session.starts_at)} ·{" "}
                    <span className={cn(session.status === "closed" && "text-text-muted")}>
                      {session.status}
                    </span>
                  </p>
                </div>
                <a
                  href={`/faculty/sessions/${session.id}`}
                  className="text-xs font-bold uppercase text-accent-green"
                >
                  Roster
                </a>
              </div>
              <ul className="text-sm space-y-1">
                {sessionQuestions.map((q) => {
                  const lesson = getLessonByKey(q.lesson_key);
                  return <li key={q.lesson_key}>{lesson?.title ?? q.lesson_key}</li>;
                })}
              </ul>
              <SessionStatusForm
                sessionId={session.id}
                sectionId={sectionId}
                currentStatus={session.status}
              />
              <p className="text-xs text-text-muted">Closing does not lock lessons.</p>
            </article>
          );
        })}
      </div>
    </div>
  );
}
