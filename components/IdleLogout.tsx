"use client";

import { useEffect, useRef, useState } from "react";
import { logout } from "@/app/actions";
import { IDLE_LOGOUT_MS } from "@/lib/lab-session";
import { createClient } from "@/lib/supabase/client";

/**
 * Signs the student out after idle time so the next person
 * on a shared lab PC does not inherit the session.
 */
export function IdleLogout() {
  const [enabled, setEnabled] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;
    const supabase = createClient();
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (active) setEnabled(!!data.session);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setEnabled(!!session);
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const bump = () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        void logout();
      }, IDLE_LOGOUT_MS);
    };

    bump();
    const events = ["mousemove", "keydown", "pointerdown", "touchstart", "scroll"] as const;
    events.forEach((event) => window.addEventListener(event, bump, { passive: true }));
    document.addEventListener("visibilitychange", bump);

    return () => {
      if (timer.current) clearTimeout(timer.current);
      events.forEach((event) => window.removeEventListener(event, bump));
      document.removeEventListener("visibilitychange", bump);
    };
  }, [enabled]);

  return null;
}
