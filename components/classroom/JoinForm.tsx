"use client";

import { useState, useTransition } from "react";
import { unstable_rethrow } from "next/navigation";
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
          try {
            const result = await joinWithCode(formData);
            if (result?.error) {
              setError(result.error);
            }
          } catch (error) {
            unstable_rethrow(error);
            setError("Could not join. Try again.");
          }
        });
      }}
    >
      <div className="flex flex-col sm:flex-row gap-2">
        <label htmlFor="join_code" className="text-xs font-bold uppercase text-text-muted sr-only">
          Join code
        </label>
        <Input
          id="join_code"
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
