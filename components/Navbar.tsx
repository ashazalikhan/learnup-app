import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { ThemeToggle } from "@/components/theme-toggle";
import { logout } from "@/app/actions";
import { cn } from "@/lib/utils";

export async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isAuthenticated = !!user;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b-2 border-border bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            href={isAuthenticated ? "/dashboard" : "/"}
            className="flex items-center gap-2 transition-transform duration-150 ease-[var(--ease-out)] active:scale-[0.97]"
          >
            <div className="w-9 h-9 rounded-xl bg-accent-green flex items-center justify-center shadow-[0_3px_0_#0f766e]">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
            </div>
            <span className="text-xl font-extrabold text-text-primary tracking-tight">
              Learn<span className="text-accent-green">up</span>
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />

            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "hidden sm:inline-flex")}
                >
                  Learn
                </Link>
                <form action={logout}>
                  <Button variant="outline" size="sm" type="submit" className="uppercase text-xs tracking-wide">
                    Log out
                  </Button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login" className={buttonVariants({ variant: "ghost", size: "sm" })}>
                  Log in
                </Link>
                <Link
                  href="/register"
                  className={cn(buttonVariants({ variant: "cta", size: "sm" }), "hidden sm:inline-flex px-3")}
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
