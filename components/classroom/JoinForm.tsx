"use client";

import { useState, useTransition } from "react";
import { joinWithCode } from "@/app/actions/classroom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function JoinForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="space-y-3"
      action={(formData) => {
        setError(null);
        startTransition(async () => {
          const result = await joinWithCode(formData);
          if (result?.error) {
            setError(result.error);
          }
        });
      }}
    >
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          name="code"
          placeholder="8-character join code"
          className="font-mono uppercase tracking-widest"
          autoComplete="off"
          disabled={pending}
        />
        <Button type="submit" variant="cta" disabled={pending}>
          Join section
        </Button>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </form>
  );
}
