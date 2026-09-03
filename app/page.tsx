import { Button, buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { TechTicker } from "@/components/TechTicker";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 flex items-center justify-center pt-16 pb-12">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Column: Mascot Placeholder */}
          <div className="flex justify-center lg:justify-end animate-enter">
            {/* Blank placeholder for future mascot */}
            <div className="w-64 h-64 md:w-96 md:h-96"></div>
          </div>

          {/* Right Column: Copy & CTA */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-10 animate-enter delay-100 max-w-xl mx-auto lg:mx-0">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.1]">
              The free, fun, and effective way<br />to learn to code!
            </h1>
            
            <div className="flex flex-col gap-4 w-full sm:w-80">
              <Link href="/register" className={buttonVariants({ variant: "default", size: "lg", className: "w-full font-bold h-14 uppercase tracking-wide text-sm bg-brand-500 hover:bg-brand-600 text-white border-0" })}>
                Get Started
              </Link>
              <Link href="/login" className={buttonVariants({ variant: "outline", size: "lg", className: "w-full font-bold h-14 uppercase tracking-wide text-sm border-2 border-border hover:bg-surface-secondary text-foreground" })}>
                I already have an account
              </Link>
            </div>
          </div>

        </div>
      </main>

      {/* Anchored at the bottom */}
      <TechTicker />
    </div>
  );
}
