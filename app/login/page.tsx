"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { ensureCurrentProfile } from "@/app/actions";
import { AuthAside } from "@/components/AuthAside";
import { GoogleMark } from "@/components/GoogleMark";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading("email");
    setErrorMsg("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
      setIsLoading(null);
      return;
    }

    await ensureCurrentProfile();
    router.replace("/dashboard");
    router.refresh();
  };

  const handleOAuth = async () => {
    setIsLoading("google");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setErrorMsg(error.message);
      setIsLoading(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="p-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-text-muted hover:text-text-primary transition-colors duration-150 ease-[var(--ease-out)]"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Home
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center max-w-5xl w-full">
          <div className="w-full max-w-md mx-auto lg:mx-0 animate-enter">
            <div className="bg-surface rounded-2xl border-2 border-border p-8 space-y-6 shadow-[0_4px_0_var(--border)]">
              <div className="space-y-1">
                <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">Log in</h1>
                <p className="text-sm text-text-muted">
                  Use email on lab PCs — Google often does not load on college Wi‑Fi.
                </p>
              </div>

              <form className="space-y-4" onSubmit={handleEmailLogin}>
                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-xs font-bold uppercase tracking-wide text-text-muted">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@college.edu"
                    className="w-full h-11"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="password" className="text-xs font-bold uppercase tracking-wide text-text-muted">
                    Password
                  </label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Password"
                    className="w-full h-11"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                {errorMsg && <p className="text-xs text-destructive font-medium">{errorMsg}</p>}

                <Button variant="cta" size="lg" className="w-full h-12" type="submit" disabled={!!isLoading}>
                  {isLoading === "email" ? (
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  ) : (
                    "Log in"
                  )}
                </Button>
              </form>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-border" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                  or
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <button
                type="button"
                onClick={handleOAuth}
                disabled={!!isLoading}
                className="w-full flex items-center justify-center gap-3 h-11 rounded-xl bg-surface border-2 border-border text-sm font-bold text-text-primary transition-transform duration-150 ease-[var(--ease-out)] hover:bg-surface-hover active:scale-[0.97] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading === "google" ? (
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-text-primary" />
                ) : (
                  <GoogleMark />
                )}
                Continue with Google
              </button>

              <p className="text-xs text-text-muted text-center leading-relaxed">
                Shared computer? Log out when you stand up. Sessions expire after 12 minutes idle.
              </p>

              <div className="pt-4 text-center border-t-2 border-border">
                <p className="text-sm text-text-muted">
                  New here?{" "}
                  <Link href="/register" className="text-accent-green hover:underline font-bold">
                    Create an account
                  </Link>
                </p>
              </div>
            </div>
          </div>

          <AuthAside />
        </div>
      </div>
    </div>
  );
}
