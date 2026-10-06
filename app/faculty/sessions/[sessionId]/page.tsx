import { notFound } from "next/navigation";
import { SessionRoster } from "@/components/classroom/SessionRoster";
import { createClient } from "@/lib/supabase/server";

type FacultySectionRow = {
  section_id: string;
  section_name: string;
};

interface SessionPageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function FacultySessionPage({ params }: SessionPageProps) {
  const { sessionId } = await params;
  const supabase = await createClient();

  const { data: session, error: sessionError } = await supabase
    .from("lab_sessions")
    .select("id, section_id, week_no, title, starts_at, status")
    .eq("id", sessionId)
    .maybeSingle();

  if (sessionError) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <p className="text-sm text-destructive">Could not load this session.</p>
      </div>
    );
  }
  if (!session) notFound();

  const { data: overview, error: overviewError } = await supabase.rpc("my_faculty_sections");
  if (overviewError) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <p className="text-sm text-destructive">Could not load faculty access for this session.</p>
      </div>
    );
  }

  const sections = (overview ?? []) as FacultySectionRow[];
  const section = sections.find((s) => s.section_id === session.section_id);
  if (!section) notFound();

  const { data: questions, error: questionsError } = await supabase
    .from("lab_session_questions")
    .select("lesson_key, position")
    .eq("session_id", sessionId)
    .order("position");

  if (questionsError) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <p className="text-sm text-destructive">Could not load session questions.</p>
      </div>
    );
  }

  const questionKeys = (questions ?? []).map((q) => q.lesson_key);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <header>
        <p className="text-xs font-bold uppercase text-accent-green">{section.section_name}</p>
        <h1 className="text-2xl font-extrabold text-foreground">{session.title}</h1>
        <p className="text-xs text-text-muted">Week {session.week_no}</p>
      </header>

      <SessionRoster
        key={sessionId}
        sessionId={sessionId}
        questionKeys={questionKeys}
        initialStatus={session.status}
        initialTitle={session.title}
      />
    </div>
  );
}
