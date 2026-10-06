"use client";

import { useState, useTransition } from "react";
import {
  rotateJoinCodeFromForm,
  setJoinEnabledFromForm,
} from "@/app/actions/classroom";
import type { ClassroomActionResult } from "@/lib/classroom/action-result";
import { CopyCodeButton } from "@/components/classroom/CopyCodeButton";
import { FormFeedback } from "@/components/classroom/FormFeedback";
import { Button } from "@/components/ui/button";

type SectionCard = {
  section_id: string;
  section_name: string;
  institution_name: string;
  course_code: string;
  course_name: string;
  join_code: string;
  join_enabled: boolean;
  student_count: number;
};

export function FacultySectionCard({ section }: { section: SectionCard }) {
  const [result, setResult] = useState<ClassroomActionResult | null>(null);
  const [pending, startTransition] = useTransition();

  const runForm = (formData: FormData) => {
    setResult(null);
    startTransition(async () => {
      const action =
        formData.get("_action") === "rotate"
          ? rotateJoinCodeFromForm
          : setJoinEnabledFromForm;
      const next = await action(formData);
      setResult(next);
    });
  };

  return (
    <article className="rounded-2xl border-2 border-border bg-surface p-5 space-y-3">
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
        <code className="font-mono text-sm bg-muted px-2 py-1 rounded">{section.join_code}</code>
        <CopyCodeButton code={section.join_code} />
        <span className="text-xs font-bold uppercase text-text-muted">
          {section.join_enabled ? "Enabled" : "Disabled"}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            fd.set("_action", "rotate");
            runForm(fd);
          }}
        >
          <input type="hidden" name="section_id" value={section.section_id} />
          <Button type="submit" variant="outline" size="sm" disabled={pending}>
            Rotate code
          </Button>
        </form>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            runForm(new FormData(e.currentTarget));
          }}
        >
          <input type="hidden" name="section_id" value={section.section_id} />
          <input type="hidden" name="enabled" value={section.join_enabled ? "false" : "true"} />
          <Button type="submit" variant="outline" size="sm" disabled={pending}>
            {section.join_enabled ? "Disable code" : "Enable code"}
          </Button>
        </form>
      </div>
      <FormFeedback result={result} pending={pending} />
    </article>
  );
}
