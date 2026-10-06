"use client";

import { useState, useTransition } from "react";
import { createSectionAction } from "@/app/actions/classroom";
import type { ClassroomActionResult } from "@/lib/classroom/action-result";
import { FormFeedback } from "@/components/classroom/FormFeedback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function CreateSectionForm() {
  const [result, setResult] = useState<ClassroomActionResult | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="grid gap-3 sm:grid-cols-2"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        setResult(null);
        startTransition(async () => {
          const next = await createSectionAction(formData);
          setResult(next);
        });
      }}
    >
      <div>
        <label htmlFor="institution_name" className="text-xs font-bold uppercase text-text-muted">
          Institution
        </label>
        <Input id="institution_name" name="institution_name" required disabled={pending} />
      </div>
      <div>
        <label htmlFor="course_code" className="text-xs font-bold uppercase text-text-muted">
          Course
        </label>
        <select
          id="course_code"
          name="course_code"
          required
          disabled={pending}
          className="h-10 w-full rounded-md border-2 border-border bg-background px-3 text-sm"
          defaultValue="DSA"
        >
          <option value="DSA">DSA</option>
          <option value="DAA">DAA</option>
        </select>
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="section_name" className="text-xs font-bold uppercase text-text-muted">
          Section name
        </label>
        <Input id="section_name" name="section_name" required disabled={pending} />
      </div>
      <div className="sm:col-span-2 space-y-2">
        <Button type="submit" variant="cta" disabled={pending} className="w-full sm:w-auto">
          Create section
        </Button>
        <FormFeedback result={result} pending={pending} />
      </div>
    </form>
  );
}
