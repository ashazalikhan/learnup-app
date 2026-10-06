"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function CopyCodeButton({ code }: { code: string }) {
  const [label, setLabel] = useState("Copy");

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => {
        void navigator.clipboard.writeText(code).then(
          () => {
            setLabel("Copied");
            window.setTimeout(() => setLabel("Copy"), 2000);
          },
          () => {
            setLabel("Copy failed");
            window.setTimeout(() => setLabel("Copy"), 2000);
          }
        );
      }}
    >
      {label}
    </Button>
  );
}
