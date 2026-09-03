"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
  },
  {
    name: "GitHub",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
      </svg>
    ),
  },
];

/* ── Page ──────────────────────────────────────────────────── */

export default function LoginPage() {
  const [tab, setTab] = useState<"login" | "register">("login");

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0c4a6e 0%, #0e7490 40%, #0891b2 70%, #155e75 100%)" }}
    >
      {/* Back Link */}
      <div className="p-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition-colors"
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
          <div className="w-full max-w-md mx-auto lg:mx-0 animate-fade-in">
            <div className="bg-[#182635] rounded-2xl border border-[#1e3348] p-8 space-y-6">
              {/* Tabs */}
              <div className="flex border-b border-border">
                <button
                  onClick={() => setTab("login")}
                  className={`pb-3 px-4 text-sm font-medium transition-colors relative ${
                    tab === "login"
                      ? "text-brand-400"
                      : "text-text-muted hover:text-text-secondary"
                  }`}
                >
                  Log in
                  {tab === "login" && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-400 rounded-full" />
                  )}
                </button>
                <button
                  onClick={() => setTab("register")}
                  className={`pb-3 px-4 text-sm font-medium transition-colors relative ${
                    tab === "register"
                      ? "text-brand-400"
                      : "text-text-muted hover:text-text-secondary"
                  }`}
                >
                  Register
                  {tab === "register" && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-400 rounded-full" />
                  )}
                </button>
              </div>

              {/* Social Login */}
              <div className="space-y-3">
                {socialProviders.map((provider) => (
                  <button
                    key={provider.name}
                    className="w-full flex items-center justify-center gap-3 h-11 rounded-lg bg-surface-secondary border border-border text-sm font-medium text-text-primary hover:bg-surface-hover hover:border-border-hover transition-colors cursor-pointer"
                  >
                    {provider.icon}
                    Continue with {provider.name}
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
              <div className="space-y-4">
                <Input
                  type="email"
                  placeholder="Email Address"
                  className="w-full"
                />

                {tab === "register" && (
                  <Input
                    type="password"
                    placeholder="Password"
                    className="w-full"
                  />
                )}

                <Button variant="default" size="lg" className="w-full">
                  Continue
                </Button>
              </div>

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
            </div>
          </div>

          {/* Right: Value Proposition */}
          <div className="hidden lg:block animate-slide-up">
            <div className="space-y-8">
              <h2 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
                Unlock your
                <br />
                Coding Journey
              </h2>
              <div className="space-y-5">
                {features.map((feature) => (
                  <div
                    key={feature.label}
                    className="flex items-center gap-3 text-white/80"
                  >
                    <span className="text-brand-300">{feature.icon}</span>
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
