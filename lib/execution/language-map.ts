import type { SupportedLanguage } from "@/lib/lessons/types";

export interface PistonLanguageConfig {
  language: string;
  version: string;
}

/** Pinned Piston runtime ids — update after checking /api/v2/piston/runtimes */
export const PISTON_LANGUAGES: Record<SupportedLanguage, PistonLanguageConfig> = {
  javascript: { language: "javascript", version: "18.15.0" },
  python: { language: "python", version: "3.10.0" },
  c: { language: "c", version: "10.2.0" },
  cpp: { language: "cpp", version: "10.2.0" },
  java: { language: "java", version: "15.0.2" },
};

export const DEFAULT_RUN_TIMEOUT_MS = 5000;

export function getPistonApiUrl(): string {
  return (
    process.env.PISTON_API_URL ??
    process.env.NEXT_PUBLIC_PISTON_API_URL ??
    "https://emkc.org/api/v2/piston"
  );
}
