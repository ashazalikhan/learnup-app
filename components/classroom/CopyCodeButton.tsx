"use client";

import { Button } from "@/components/ui/button";

export function CopyCodeButton({ code }: { code: string }) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => {
        void navigator.clipboard.writeText(code);
      }}
    >
      Copy
    </Button>
  );
}
