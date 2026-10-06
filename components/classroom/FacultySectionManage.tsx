"use client";

import { useState, useTransition } from "react";
import { rotateJoinCodeFromForm, setJoinEnabledFromForm } from "@/app/actions/classroom";
import type { ClassroomActionResult } from "@/lib/classroom/action-result";
import { CopyCodeButton } from "@/components/classroom/CopyCodeButton";
import { FormFeedback } from "@/components/classroom/FormFeedback";
import { Button } from "@/components/ui/button";

export function FacultySectionManage({
  sectionId,
  joinCode,
  joinEnabled,
}: {
  sectionId: string;
  joinCode: string;
  joinEnabled: boolean;
}) {
  const [result, setResult] = useState<ClassroomActionResult | null>(null);
  const [pending, startTransition] = useTransition();

  const run = (formData: FormData) => {
    setResult(null);
    startTransition(async () => {
      const action =
        formData.get("_action") === "rotate" ? rotateJoinCodeFromForm : setJoinEnabledFromForm;
      setResult(await action(formData));
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <code className="font-mono text-sm bg-muted px-2 py-1 rounded">{joinCode}</code>
        <CopyCodeButton code={joinCode} />
        <span className="text-xs font-bold uppercase">{joinEnabled ? "Enabled" : "Disabled"}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            fd.set("_action", "rotate");
            run(fd);
          }}
        >
          <input type="hidden" name="section_id" value={sectionId} />
          <Button type="submit" variant="outline" size="sm" disabled={pending}>Rotate code</Button>
        </form>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            run(new FormData(e.currentTarget));
          }}
        >
          <input type="hidden" name="section_id" value={sectionId} />
          <input type="hidden" name="enabled" value={joinEnabled ? "false" : "true"} />
          <Button type="submit" variant="outline" size="sm" disabled={pending}>
            {joinEnabled ? "Disable code" : "Enable code"}
          </Button>
        </form>
      </div>
      <FormFeedback result={result} pending={pending} />
    </div>
  );
}
