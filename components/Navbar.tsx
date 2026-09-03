import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { disableAdminMode } from "@/app/actions";

export async function Navbar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const cookieStore = await cookies();
  const isAdminOverride = cookieStore.get("admin_override")?.value === "true";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
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
            <span className="text-xl font-bold text-text-primary">
              Learn<span className="text-brand-400">up</span>
            </span>
          </Link>

          {/* Navigation links */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink href="#features">Features</NavLink>
            <NavLink href="#topics">Topics</NavLink>
            <NavLink href="#pricing">Pricing</NavLink>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {user || isAdminOverride ? (
              <>
                {isAdminOverride && (
                  <form action={disableAdminMode}>
                    <Button variant="ghost" size="sm" type="submit" className="text-red-400 hover:text-red-300">
                      Exit Admin Mode
                    </Button>
                  </form>
                )}
                <Link href="/dashboard">
                  <Button variant="default" size="sm">
                    Go to Dashboard
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Log in
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="default" size="sm">
                    Start Learning
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className="px-3 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors rounded-lg"
    >
      {children}
    </a>
  );
}
