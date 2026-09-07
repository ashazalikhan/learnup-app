import {
  DEFAULT_RUN_TIMEOUT_MS,
  getPistonApiUrl,
  PISTON_LANGUAGES,
} from "@/lib/execution/language-map";
import type { ExecuteParams, ExecutionResult } from "@/lib/execution/types";
import type { SupportedLanguage } from "@/lib/lessons/types";

interface PistonRunResponse {
  run?: {
    stdout?: string;
    stderr?: string;
    code?: number;
    signal?: string | null;
    output?: string;
  };
  compile?: {
    stdout?: string;
    stderr?: string;
    code?: number;
    output?: string;
  };
  message?: string;
}

function isRunnerUnavailable(status: number, message?: string): boolean {
  if (status === 429) return true;
  if (status >= 500) return true;
  if (message?.toLowerCase().includes("rate")) return true;
  return false;
}

export async function runWithPiston({
  source,
  language,
  stdin,
  timeoutMs = DEFAULT_RUN_TIMEOUT_MS,
}: ExecuteParams): Promise<ExecutionResult> {
  const config = PISTON_LANGUAGES[language];
  const url = `${getPistonApiUrl()}/execute`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: config.language,
        version: config.version,
        files: [{ name: language === "java" ? "Main.java" : "main", content: source }],
        stdin,
        run_timeout: Math.ceil(timeoutMs / 1000),
        compile_timeout: 10000,
      }),
      signal: AbortSignal.timeout(timeoutMs + 15000),
    });

    const payload = (await response.json()) as PistonRunResponse;

    if (!response.ok) {
      const message = payload.message ?? `Piston request failed (${response.status})`;
      return {
        stdout: "",
        stderr: message,
        exitCode: 1,
        timedOut: false,
        runnerUnavailable: isRunnerUnavailable(response.status, message),
        error: message,
      };
    }

    const compileErr = payload.compile?.stderr || payload.compile?.output;
    if (compileErr && (payload.compile?.code ?? 0) !== 0) {
      return {
        stdout: payload.compile?.stdout ?? "",
        stderr: compileErr,
        exitCode: payload.compile?.code ?? 1,
        timedOut: false,
      };
    }

    const run = payload.run;
    const stderr = run?.stderr || run?.output || "";
    const timedOut = run?.signal === "SIGKILL" || run?.signal === "SIGTERM";

    return {
      stdout: run?.stdout ?? "",
      stderr,
      exitCode: run?.code ?? (timedOut ? null : 1),
      timedOut,
      runnerUnavailable: timedOut && !stderr,
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Could not reach the code runner.";
    return {
      stdout: "",
      stderr: message,
      exitCode: 1,
      timedOut: message.toLowerCase().includes("timeout"),
      runnerUnavailable: true,
      error: message,
    };
  }
}

export async function runOnServer(
  params: ExecuteParams
): Promise<ExecutionResult> {
  const { language } = params;

  if (language === "javascript") {
    const { runJavaScriptOnServer } = await import("@/lib/execution/run-javascript-server");
    return runJavaScriptOnServer(params);
  }

  return runWithPiston(params);
}

export function languageUsesPistonOnly(language: SupportedLanguage): boolean {
  return language === "c" || language === "cpp" || language === "java";
}

export function languageUsesPistonForRun(language: SupportedLanguage): boolean {
  return language !== "javascript";
}
