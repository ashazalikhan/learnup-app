import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";

/* ── Feature Data ──────────────────────────────────────────── */

const features = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-500">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
    label: "Practice-Driven Learning",
    description: "Write code from day one. No passive watching, just active problem solving."
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-500">
        <path d="M12 2a10 10 0 0110 10c0 5.52-4.48 10-10 10S2 17.52 2 12" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
    label: "AI Enhanced Curriculum",
    description: "Our adaptive AI tailors challenges to your skill level, ensuring you always learn at the optimal pace."
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-500">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    label: "Personalized Progress",
    description: "Track your streaks, master specific topics, and see your growth visualized."
  },
];

/* ── Page ──────────────────────────────────────────────────── */

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Hero Section */}
      <main className="flex-1 flex flex-col">
        <section className="flex-1 flex items-center pt-24 pb-16 lg:pt-32 lg:pb-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Copy & CTA */}
            <div className="flex flex-col items-start space-y-8 animate-fade-in">
              <div className="inline-flex items-center border border-border bg-surface-secondary px-3 py-1 text-sm font-medium text-text-primary">
                <span className="flex h-2 w-2 bg-brand-500 mr-2"></span>
                Now available for college students
              </div>
              
              <div className="space-y-4">
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.05]">
                  Master Coding, <br />
                  <span className="text-brand-400">One Challenge at a Time.</span>
                </h1>
                <p className="text-lg text-text-secondary max-w-xl leading-relaxed">
                  Learnup is the professional platform for mastering Data Structures & Algorithms. Built with structured curriculums, real-world practice environments, and intelligent analytics.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Link href="/login" className="w-full sm:w-auto">
                  <Button variant="default" size="lg" className="w-full px-8 py-6 text-base font-semibold">
                    Start Learning Free
                  </Button>
                </Link>
                <Link href="/login" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full px-8 py-6 text-base font-semibold border-border text-foreground hover:bg-surface-secondary">
                    View Curriculum
                  </Button>
                </Link>
              </div>
              
              <div className="flex items-center gap-6 pt-4 border-t border-border w-full max-w-md">
                <div>
                  <div className="text-2xl font-bold text-foreground">500+</div>
                  <div className="text-xs font-medium text-text-muted uppercase tracking-wider mt-1">Challenges</div>
                </div>
                <div className="w-px h-8 bg-border"></div>
                <div>
                  <div className="text-2xl font-bold text-foreground">50+</div>
                  <div className="text-xs font-medium text-text-muted uppercase tracking-wider mt-1">DSA Topics</div>
                </div>
                <div className="w-px h-8 bg-border"></div>
                <div>
                  <div className="text-2xl font-bold text-foreground">10k+</div>
                  <div className="text-xs font-medium text-text-muted uppercase tracking-wider mt-1">Active Students</div>
                </div>
              </div>
            </div>

            {/* Right Column: Visual Mockup */}
            <div className="relative animate-slide-up lg:pl-12 hidden md:block">
              <div className="rounded-xl border border-border bg-surface shadow-2xl overflow-hidden aspect-[4/3] flex flex-col">
                {/* Mockup Header */}
                <div className="h-12 border-b border-border bg-surface-secondary flex items-center px-4 gap-2">
                  <div className="w-3 h-3 bg-border"></div>
                  <div className="w-3 h-3 bg-border"></div>
                  <div className="w-3 h-3 bg-border"></div>
                  <div className="ml-4 h-6 bg-background w-1/3 border border-border"></div>
                </div>
                {/* Mockup Body */}
                <div className="flex-1 p-6 grid grid-cols-3 gap-6 bg-background">
                  <div className="col-span-2 space-y-4">
                    <div className="h-8 w-3/4 bg-surface-secondary rounded border border-border"></div>
                    <div className="space-y-2">
                      <div className="h-4 w-full bg-surface-secondary rounded"></div>
                      <div className="h-4 w-5/6 bg-surface-secondary rounded"></div>
                      <div className="h-4 w-4/6 bg-surface-secondary rounded"></div>
                    </div>
                    <div className="flex-1 mt-4 rounded border border-border bg-surface-secondary p-4 flex flex-col">
                      <div className="h-4 w-1/4 bg-brand-900/30 text-brand-400 text-[10px] uppercase font-mono rounded px-1 flex items-center">function solve()</div>
                      <div className="mt-4 space-y-2">
                        <div className="h-3 w-3/4 bg-border/50 rounded"></div>
                        <div className="h-3 w-1/2 bg-border/50 rounded ml-4"></div>
                        <div className="h-3 w-5/6 bg-border/50 rounded ml-4"></div>
                        <div className="h-3 w-1/4 bg-border/50 rounded"></div>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-1 border-l border-border pl-6 space-y-6">
                    <div className="h-32 bg-surface-secondary rounded border border-border"></div>
                    <div className="h-24 bg-surface-secondary rounded border border-border"></div>
                  </div>
                </div>
              </div>
              
            </div>

          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="border-t border-border bg-surface py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Everything you need to excel.
              </h2>
              <p className="mt-4 text-lg text-text-secondary">
                A highly structured, distraction-free environment designed specifically for serious learners.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature) => (
                <div
                  key={feature.label}
                  className="bg-background border border-border rounded-xl p-8 hover:border-brand-500/50 transition-colors"
                >
                  <div className="w-12 h-12 bg-surface-secondary rounded-lg border border-border flex items-center justify-center mb-6">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-3">{feature.label}</h3>
                  <p className="text-text-secondary leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
