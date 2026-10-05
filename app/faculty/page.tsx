import {
  createSectionAction,
  rotateJoinCodeFromForm,
  setJoinEnabledFromForm,
} from "@/app/actions/classroom";
import { CopyCodeButton } from "@/components/classroom/CopyCodeButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

  const sections = (error ? [] : data ?? []) as FacultySectionRow[];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">Faculty</h1>
        <p className="text-sm text-text-secondary">Create sections and share join codes.</p>
      </div>

      <section className="rounded-2xl border-2 border-border bg-card p-5 space-y-4">
        <h2 className="text-sm font-extrabold uppercase tracking-wide">Create section</h2>
        <form action={createSectionAction} className="grid gap-3 sm:grid-cols-2">
          <Input name="institution_name" placeholder="Institution name" required />
          <select
            name="course_code"
            required
            className="h-10 rounded-md border-2 border-border bg-background px-3 text-sm"
            defaultValue="DSA"
          >
            <option value="DSA">DSA</option>
            <option value="DAA">DAA</option>
          </select>
          <Input
            name="section_name"
            placeholder="Section name"
            className="sm:col-span-2"
            required
          />
          <Button type="submit" variant="cta" className="sm:col-span-2 w-full sm:w-auto">
            Create section
          </Button>
        </form>
      </section>

      {sections.length === 0 ? (
        <p className="text-sm text-text-secondary">Create a section to get a join code.</p>
      ) : null}

      <div className="space-y-4">
        {sections.map((section) => (
          <article
            key={section.section_id}
            className="rounded-2xl border-2 border-border bg-surface p-5 space-y-3"
          >
            <div className="flex flex-wrap justify-between gap-2">
              <div>
                <h3 className="font-extrabold text-foreground">{section.section_name}</h3>
                <p className="text-xs text-text-secondary">
                  {section.institution_name} · {section.course_code} {section.course_name}
                </p>
                <p className="text-xs text-text-muted mt-1">
                  {section.student_count} student{section.student_count === 1 ? "" : "s"}
                </p>
              </div>
              <a
                href={`/faculty/sections/${section.section_id}`}
                className="text-xs font-bold uppercase text-accent-green hover:underline"
              >
                Open section
              </a>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <code className="font-mono text-sm bg-muted px-2 py-1 rounded">
                {section.join_code}
              </code>
              <CopyCodeButton code={section.join_code} />
              <span className="text-xs font-bold uppercase text-text-muted">
                {section.join_enabled ? "Enabled" : "Disabled"}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              <form action={rotateJoinCodeFromForm}>
                <input type="hidden" name="section_id" value={section.section_id} />
                <Button type="submit" variant="outline" size="sm">Rotate code</Button>
              </form>
              {section.join_enabled ? (
                <form action={setJoinEnabledFromForm}>
                  <input type="hidden" name="section_id" value={section.section_id} />
                  <input type="hidden" name="enabled" value="false" />
                  <Button type="submit" variant="outline" size="sm">Disable code</Button>
                </form>
              ) : (
                <form action={setJoinEnabledFromForm}>
                  <input type="hidden" name="section_id" value={section.section_id} />
                  <input type="hidden" name="enabled" value="true" />
                  <Button type="submit" variant="outline" size="sm">Enable code</Button>
                </form>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
