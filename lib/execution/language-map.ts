import type { SupportedLanguage } from "@/lib/lessons/types";

export interface PistonLanguageConfig {
  language: string;
  version: string;
}

/** Piston language ids; version "*" uses whatever runtime is installed locally. */
export const PISTON_LANGUAGES: Record<SupportedLanguage, PistonLanguageConfig> = {
  javascript: { language: "javascript", version: "*" },
  python: { language: "python", version: "*" },
  c: { language: "c", version: "*" },
  cpp: { language: "c++", version: "*" },
  java: { language: "java", version: "*" },
};

export const DEFAULT_RUN_TIMEOUT_MS = 5000;

export function getPistonApiUrl(): string {
  const raw =
    process.env.PISTON_API_URL ??
    process.env.NEXT_PUBLIC_PISTON_API_URL ??
    "https://emkc.org/api/v2/piston";

  // Allow either .../piston or a mistaken .../execute base from .env.
  return raw.replace(/\/execute\/?$/, "").replace(/\/$/, "");
}
