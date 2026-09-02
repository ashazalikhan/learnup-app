import { Button } from "@/components/ui";
import { Navbar } from "@/components/Navbar";
import { TechTicker } from "@/components/TechTicker";

/* ── Feature Data ──────────────────────────────────────────── */

const features = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
    label: "Practice-Driven",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
      </svg>
    ),
    label: "Unlimited",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2z" />
      </svg>
    ),
    label: "Fun",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    label: "Personalized",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a10 10 0 0110 10c0 5.52-4.48 10-10 10S2 17.52 2 12" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
    label: "AI Enhanced",
  },
];

/* ── Stats ─────────────────────────────────────────────────── */

const stats = [
  { value: "500+", label: "Coding Problems" },
  { value: "10K+", label: "Active Students" },
  { value: "50+", label: "DSA Topics" },
];

/* ── Page ──────────────────────────────────────────────────── */

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <main className="flex-1 flex flex-col">
        <section className="flex-1 flex items-center justify-center pt-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="flex flex-col items-center text-center py-20 lg:py-32 space-y-10 animate-fade-in">

              <div className="space-y-5">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
                  The free, fun, and effective way{" "}
                  <span className="text-gradient">to learn to code!</span>
                </h1>
                <p className="text-lg text-text-secondary max-w-2xl mx-auto">
                  Master Data Structures & Algorithms with bite-sized lessons,
                  real coding challenges, and a gamified experience built for
                  college students.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="cta" size="xl">
                  Get Started
                </Button>
                <Button variant="outline" size="xl">
                  I Already Have an Account
                </Button>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-8 pt-4">
                {stats.map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="text-2xl font-bold text-brand-400">
                      {stat.value}
                    </div>
                    <div className="text-xs text-text-muted">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features Strip */}
        <section id="features" className="border-t border-border bg-background-secondary">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-wrap items-center justify-center gap-8 stagger-children">
              {features.map((feature) => (
                <div
                  key={feature.label}
                  className="flex items-center gap-2.5 text-text-secondary"
                >
                  <span className="text-brand-400">{feature.icon}</span>
                  <span className="text-sm font-medium">{feature.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Tech Ticker */}
      <TechTicker />
    </div>
  );
}
