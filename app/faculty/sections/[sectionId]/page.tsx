import { notFound } from "next/navigation";
import {
  createLabSessionFormAction,
  rotateJoinCodeFromForm,
  setJoinEnabledFromForm,
  setLabSessionStatusFromForm,
} from "@/app/actions/classroom";
import { CopyCodeButton } from "@/components/classroom/CopyCodeButton";
import { ARRAYS_LESSON_ALLOWLIST } from "@/lib/classroom/allowlist";
import { formatInIst } from "@/lib/classroom/time";
import { getLessonByKey } from "@/lib/curriculum/loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

  const { data: overview } = await supabase.rpc("my_faculty_sections");
  const sections = (overview ?? []) as FacultySectionRow[];
  const section = sections.find((s) => s.section_id === sectionId);
  if (!section) notFound();

  const { data: sessions } = await supabase
    .from("lab_sessions")
    .select("id, week_no, title, starts_at, status")
    .eq("section_id", sectionId)
    .order("week_no")
    .order("starts_at");

  const sessionIds = (sessions ?? []).map((s) => s.id);
  const { data: questions } =
    sessionIds.length > 0
      ? await supabase
          .from("lab_session_questions")
          .select("session_id, lesson_key, position")
          .in("session_id", sessionIds)
          .order("position")
      : { data: [] };

  type QuestionRow = { session_id: string; lesson_key: string; position: number };
  const questionsBySession = new Map<string, QuestionRow[]>();
  for (const q of (questions ?? []) as QuestionRow[]) {
    const list = questionsBySession.get(q.session_id) ?? [];
    list.push(q);
    questionsBySession.set(q.session_id, list);
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
        <div className="flex flex-wrap items-center gap-2">
          <code className="font-mono text-sm bg-muted px-2 py-1 rounded">{section.join_code}</code>
          <CopyCodeButton code={section.join_code} />
          <span className="text-xs font-bold uppercase">
            {section.join_enabled ? "Enabled" : "Disabled"}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <form action={rotateJoinCodeFromForm}>
            <input type="hidden" name="section_id" value={sectionId} />
            <Button type="submit" variant="outline" size="sm">Rotate code</Button>
          </form>
          {section.join_enabled ? (
            <form action={setJoinEnabledFromForm}>
              <input type="hidden" name="section_id" value={sectionId} />
              <input type="hidden" name="enabled" value="false" />
              <Button type="submit" variant="outline" size="sm">Disable code</Button>
            </form>
          ) : (
            <form action={setJoinEnabledFromForm}>
              <input type="hidden" name="section_id" value={sectionId} />
              <input type="hidden" name="enabled" value="true" />
              <Button type="submit" variant="outline" size="sm">Enable code</Button>
            </form>
          )}
        </div>
      </header>

      <section className="rounded-2xl border-2 border-border bg-card p-5 space-y-4">
        <h2 className="text-sm font-extrabold uppercase tracking-wide">Create lab session</h2>
        <form action={createLabSessionFormAction.bind(null, sectionId)} className="space-y-4">
          <Input name="title" placeholder="Session title" required />
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold uppercase text-text-muted">Week (1–16)</label>
              <Input name="week_no" type="number" min={1} max={16} required />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-text-muted">
                Starts (IST, Asia/Kolkata)
              </label>
              <Input name="starts_at" type="datetime-local" required />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase text-text-muted">Questions (Arrays allowlist)</p>
            {ARRAYS_LESSON_ALLOWLIST.map((key) => {
              const lesson = getLessonByKey(key);
              return (
                <label key={key} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name={`lesson_${key}`} />
                  {lesson?.title ?? key}
                </label>
              );
            })}
          </div>
          <Button type="submit" variant="cta">Create session (live)</Button>
        </form>
      </section>

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
              <form action={setLabSessionStatusFromForm}>
                <input type="hidden" name="session_id" value={session.id} />
                <input type="hidden" name="section_id" value={sectionId} />
                <input
                  type="hidden"
                  name="status"
                  value={session.status === "live" ? "closed" : "live"}
                />
                <Button type="submit" variant="outline" size="sm">
                  {session.status === "live" ? "Close session" : "Reopen session"}
                </Button>
              </form>
              <p className="text-xs text-text-muted">Closing does not lock lessons.</p>
            </article>
          );
        })}
      </div>
    </div>
  );
}
