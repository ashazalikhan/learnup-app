import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { TechTicker } from "@/components/TechTicker";
import { OwlMascot } from "@/components/OwlMascot";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 flex items-center justify-center pt-16 pb-12">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <div className="flex justify-center lg:justify-end animate-enter">
            <OwlMascot className="w-56 h-56 md:w-80 md:h-80" />
          </div>

          <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-8 animate-enter delay-100 max-w-xl mx-auto lg:mx-0">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-accent-green">
              DSA for college labs
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-extrabold tracking-tight text-foreground leading-[1.08]">
              The free, fun, and effective way to learn to code.
            </h1>
            <p className="text-text-secondary text-lg leading-relaxed max-w-md">
              Short lessons. Real code in the browser. Log out when the lab ends.
            </p>

            <div className="flex flex-col gap-3 w-full sm:w-80">
              <Link
                href="/register"
                className={cn(
                  buttonVariants({ variant: "cta", size: "lg" }),
                  "w-full h-14 text-sm"
                )}
              >
                Get started
              </Link>
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "w-full h-14 text-sm"
                )}
              >
                I already have an account
              </Link>
            </div>
          </div>
        </div>
      </main>

      <TechTicker />
    </div>
  );
}
