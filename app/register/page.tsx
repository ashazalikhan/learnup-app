"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

/* ── Social Providers ──────────────────────────────────────── */

const socialProviders = [
  {
    name: "Google",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24">
        <path
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
          fill="#4285F4"
        />
        <path
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          fill="#34A853"
        />
        <path
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          fill="#FBBC05"
        />
        <path
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          fill="#EA4335"
        />
      </svg>
    ),
  }
];

/* ── Page ──────────────────────────────────────────────────── */

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const supabase = createClient();

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading("email");
    setErrorMsg("");
    setSuccessMsg("");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      }
    });

    if (error) {
      setErrorMsg(error.message);
    } else {
      setSuccessMsg("Check your email to confirm your account!");
    }
    
    setIsLoading(null);
  };

  const handleOAuth = async (provider: "google") => {
    setIsLoading(provider);
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-background">
      {/* Back Link */}
      <div className="p-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors duration-150 ease-[var(--ease-out)]"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center max-w-5xl w-full">

          {/* Auth Card */}
          <div className="w-full max-w-md mx-auto lg:mx-0 animate-enter">
            <div className="bg-surface-secondary rounded-2xl border border-border p-8 space-y-6">
              
              <div className="space-y-2 text-center pb-2">
                <h1 className="text-2xl font-bold text-text-primary">Register to get started with the learning path</h1>
                <p className="text-sm text-text-muted">Create an account to save your progress</p>
              </div>

              {/* Social Login */}
              <div className="space-y-3">
                {socialProviders.map((provider) => (
                  <button
                    key={provider.name}
                    onClick={() => handleOAuth(provider.name.toLowerCase() as "google")}
                    disabled={!!isLoading}
                    className="w-full flex items-center justify-center gap-3 h-11 rounded-lg bg-surface border border-border text-sm font-medium text-text-primary transition-colors duration-150 ease-[var(--ease-out)] hover:bg-surface-hover active:scale-[0.97] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading === provider.name.toLowerCase() ? (
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-text-primary"></span>
                    ) : (
                      provider.icon
                    )}
                    Sign up with {provider.name}
                  </button>
                ))}
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-text-muted uppercase tracking-wider">
                  or
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* Email Form */}
              <form className="space-y-4" onSubmit={handleEmailRegister}>
                <Input
                  type="email"
                  placeholder="Email Address"
                  className="w-full"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <Input
                  type="password"
                  placeholder="Password"
                  className="w-full"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />

                {errorMsg && <p className="text-xs text-destructive text-center">{errorMsg}</p>}
                {successMsg && <p className="text-xs text-accent-green text-center">{successMsg}</p>}

                <Button variant="default" size="lg" className="w-full" type="submit" disabled={isLoading === "email"}>
                  {isLoading === "email" ? <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span> : "Sign Up"}
                </Button>
              </form>

              {/* Terms */}
              <p className="text-xs text-text-muted text-center leading-relaxed">
                By continuing you confirm that you are at least 13 years old
                and agree to our{" "}
                <a href="#" className="text-brand-400 hover:underline">
                  Terms of Use
                </a>{" "}
                and{" "}
                <a href="#" className="text-brand-400 hover:underline">
                  Privacy Policy
                </a>
                .
              </p>

              <div className="pt-4 text-center border-t border-border">
                <p className="text-sm text-text-muted">
                  Already have an account?{" "}
                  <Link href="/login" className="text-brand-400 hover:text-brand-500 font-medium">
                    Log in
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Right: Value Proposition */}
          <div className="hidden lg:block animate-enter delay-100">
            <div className="space-y-8">
              <h2 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                Unlock your
                <br />
                Coding Journey
              </h2>
              <div className="space-y-5">
                {features.map((feature) => (
                  <div
                    key={feature.label}
                    className="flex items-center gap-3 text-text-secondary"
                  >
                    <span className="text-brand-500">{feature.icon}</span>
                    <span className="text-lg font-medium">{feature.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Feature Data ──────────────────────────────────────────── */

const features = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
    label: "Practice-Driven",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
      </svg>
    ),
    label: "Unlimited",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2z" />
      </svg>
    ),
    label: "Fun",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    label: "Personalized",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a10 10 0 0110 10c0 5.52-4.48 10-10 10S2 17.52 2 12" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
    label: "AI Enhanced",
  },
];
