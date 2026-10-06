import { CreateSectionForm } from "@/components/classroom/CreateSectionForm";
import { FacultySectionCard } from "@/components/classroom/FacultySectionCard";
import { createClient } from "@/lib/supabase/server";

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

export default async function FacultyPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("my_faculty_sections");

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-extrabold text-foreground">Faculty</h1>
        <p className="text-sm text-destructive mt-4">
          {error.message.includes("not allowed")
            ? "You do not have faculty access."
            : "Could not load faculty sections."}
        </p>
      </div>
    );
  }

  const sections = (data ?? []) as FacultySectionRow[];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">Faculty</h1>
        <p className="text-sm text-text-secondary">Create sections and share join codes.</p>
      </div>

      <section className="rounded-2xl border-2 border-border bg-card p-5 space-y-4">
        <h2 className="text-sm font-extrabold uppercase tracking-wide">Create section</h2>
        <CreateSectionForm />
      </section>

      {sections.length === 0 ? (
        <p className="text-sm text-text-secondary">Create a section to get a join code.</p>
      ) : null}

      <div className="space-y-4">
        {sections.map((section) => (
          <FacultySectionCard key={section.section_id} section={section} />
        ))}
      </div>
    </div>
  );
}
