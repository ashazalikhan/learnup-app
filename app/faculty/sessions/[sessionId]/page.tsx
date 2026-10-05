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

  const { data: session } = await supabase
    .from("lab_sessions")
    .select("id, section_id, week_no, title, starts_at, status")
    .eq("id", sessionId)
    .maybeSingle();

  if (!session) notFound();

  const { data: overview } = await supabase.rpc("my_faculty_sections");
  const sections = (overview ?? []) as FacultySectionRow[];
  const section = sections.find((s) => s.section_id === session.section_id);
  if (!section) notFound();

  const { data: questions } = await supabase
    .from("lab_session_questions")
    .select("lesson_key, position")
    .eq("session_id", sessionId)
    .order("position");

  const questionKeys = (questions ?? []).map((q) => q.lesson_key);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <header>
        <p className="text-xs font-bold uppercase text-accent-green">{section.section_name}</p>
        <h1 className="text-2xl font-extrabold text-foreground">{session.title}</h1>
        <p className="text-xs text-text-muted">Week {session.week_no} · {session.status}</p>
      </header>

      <SessionRoster sessionId={sessionId} questionKeys={questionKeys} />
    </div>
  );
}
