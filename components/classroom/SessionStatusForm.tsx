"use client";

import { useState, useTransition } from "react";
import { setLabSessionStatusFromForm } from "@/app/actions/classroom";
import type { ClassroomActionResult } from "@/lib/classroom/action-result";
import { FormFeedback } from "@/components/classroom/FormFeedback";
import { Button } from "@/components/ui/button";

export function SessionStatusForm({
  sessionId,
  sectionId,
  currentStatus,
}: {
  sessionId: string;
  sectionId: string;
  currentStatus: string;
}) {
  const [result, setResult] = useState<ClassroomActionResult | null>(null);
  const [pending, startTransition] = useTransition();
  const nextStatus = currentStatus === "live" ? "closed" : "live";

  return (
    <form
      className="space-y-2"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        setResult(null);
        startTransition(async () => {
          const next = await setLabSessionStatusFromForm(formData);
          setResult(next);
        });
      }}
    >
      <input type="hidden" name="session_id" value={sessionId} />
      <input type="hidden" name="section_id" value={sectionId} />
      <input type="hidden" name="status" value={nextStatus} />
      <Button type="submit" variant="outline" size="sm" disabled={pending}>
        {currentStatus === "live" ? "Close session" : "Reopen session"}
      </Button>
      <FormFeedback result={result} pending={pending} />
    </form>
  );
}
