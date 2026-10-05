"use client";

import { returnToLab } from "@/app/actions/classroom";

export function LabReturnButton() {
  return (
    <form action={returnToLab}>
      <button
        type="submit"
        className="text-xs font-bold uppercase tracking-wide text-text-muted hover:text-foreground"
      >
        Lab
      </button>
    </form>
  );
}
