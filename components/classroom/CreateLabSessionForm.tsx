"use client";

import { useState, useTransition } from "react";
import { createLabSessionFormAction } from "@/app/actions/classroom";
import type { ClassroomActionResult } from "@/lib/classroom/action-result";
import { ARRAYS_LESSON_ALLOWLIST } from "@/lib/classroom/allowlist";
import { FormFeedback } from "@/components/classroom/FormFeedback";
import { getLessonByKey } from "@/lib/curriculum/loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function CreateLabSessionForm({ sectionId }: { sectionId: string }) {
  const [result, setResult] = useState<ClassroomActionResult | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        setResult(null);
        startTransition(async () => {
          const next = await createLabSessionFormAction(sectionId, formData);
          setResult(next);
        });
      }}
    >
      <div>
        <label htmlFor="session_title" className="text-xs font-bold uppercase text-text-muted">
          Title
        </label>
        <Input id="session_title" name="title" required disabled={pending} />
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor="week_no" className="text-xs font-bold uppercase text-text-muted">
            Week (1–16)
          </label>
          <Input id="week_no" name="week_no" type="text" inputMode="numeric" required disabled={pending} />
        </div>
        <div>
          <label htmlFor="starts_at" className="text-xs font-bold uppercase text-text-muted">
            Starts (IST, Asia/Kolkata)
          </label>
          <Input id="starts_at" name="starts_at" type="datetime-local" required disabled={pending} />
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-xs font-bold uppercase text-text-muted">Questions (Arrays allowlist)</p>
        {ARRAYS_LESSON_ALLOWLIST.map((key) => {
          const lesson = getLessonByKey(key);
          return (
            <label key={key} className="flex items-center gap-2 text-sm">
              <input type="checkbox" name={`lesson_${key}`} disabled={pending} />
              {lesson?.title ?? key}
            </label>
          );
        })}
      </div>
      <div className="space-y-2">
        <Button type="submit" variant="cta" disabled={pending}>Create session (live)</Button>
        <FormFeedback result={result} pending={pending} />
      </div>
    </form>
  );
}
