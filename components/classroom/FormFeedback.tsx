"use client";

import type { ClassroomActionResult } from "@/lib/classroom/action-result";

export function FormFeedback({
  result,
  pending,
}: {
  result: ClassroomActionResult | null;
  pending: boolean;
}) {
  if (pending) {
    return <p className="text-sm text-text-muted">Saving…</p>;
  }
  if (!result) return null;
  if (result.ok) {
    return result.message ? (
      <p className="text-sm text-accent-green">{result.message}</p>
    ) : null;
  }
  return (
    <p className={result.denied ? "text-sm text-destructive font-bold" : "text-sm text-destructive"}>
      {result.error}
    </p>
  );
}
