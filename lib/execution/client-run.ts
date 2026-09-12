import type { ExecutionResult } from "@/lib/execution/types";

const DEFAULT_TIMEOUT_MS = 5000;

let nextId = 0;

function emptyResult(overrides: Partial<ExecutionResult> = {}): ExecutionResult {
  return {
    stdout: "",
    stderr: "",
    exitCode: 1,
    timedOut: false,
    ...overrides,
  };
}

function runInWorker(
  workerUrl: string,
  payload: { source: string; stdin: string },
  timeoutMs: number,
  options?: { reuseWorker?: () => Worker | null; killWorker?: () => void }
): Promise<ExecutionResult> {
  return new Promise((resolve) => {
    const id = ++nextId;
    let settled = false;
    let worker: Worker | null = null;

    const finish = (result: ExecutionResult) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      worker?.removeEventListener("message", onMessage);
      worker?.removeEventListener("error", onError);

      if (options?.reuseWorker) {
        // Reused workers are killed only on timeout via killWorker.
      } else {
        worker?.terminate();
      }

      resolve(result);
    };

    const hardKill = () => {
      if (options?.killWorker) {
        options.killWorker();
      } else {
        worker?.terminate();
      }
      finish(
        emptyResult({
          stderr: "Execution timed out.",
          exitCode: null,
          timedOut: true,
        })
      );
    };

    const timer = setTimeout(hardKill, timeoutMs);

    const onMessage = (event: MessageEvent) => {
      if (event.data?.id !== id) return;
      finish({
        stdout: event.data.stdout ?? "",
        stderr: event.data.stderr ?? "",
        exitCode: event.data.exitCode ?? 1,
        timedOut: Boolean(event.data.timedOut),
        runnerUnavailable: Boolean(event.data.runnerUnavailable),
        error: event.data.error,
      });
    };

    const onError = () => {
      if (options?.killWorker) options.killWorker();
      else worker?.terminate();

      finish(
        emptyResult({
          stderr: "Worker failed to run code.",
          runnerUnavailable: true,
          error: "Worker error",
        })
      );
    };

    try {
      worker = options?.reuseWorker?.() ?? new Worker(workerUrl);
    } catch (err) {
      clearTimeout(timer);
      const message = err instanceof Error ? err.message : "Could not create worker.";
      finish(
        emptyResult({
          stderr: message,
          runnerUnavailable: true,
          error: message,
        })
      );
      return;
    }

    worker.addEventListener("message", onMessage);
    worker.addEventListener("error", onError);
    worker.postMessage({ id, ...payload, stdin: payload.stdin });
  });
}

/** One fresh worker per run; parent terminates it on timeout (hard kill). */
export function runJavaScriptInWorker(
  source: string,
  stdin: string,
  timeoutMs = DEFAULT_TIMEOUT_MS
): Promise<ExecutionResult> {
  return runInWorker("/workers/js-runner.js", { source, stdin }, timeoutMs);
}

let pyodideWorker: Worker | null = null;

function getPyodideWorker(): Worker {
  if (!pyodideWorker) {
    pyodideWorker = new Worker("/workers/pyodide-runner.js");
  }
  return pyodideWorker;
}

function killPyodideWorker() {
  pyodideWorker?.terminate();
  pyodideWorker = null;
}

/** Python via Pyodide in a dedicated worker; worker is killed on timeout. */
export function runPythonInPyodide(
  source: string,
  stdin: string,
  timeoutMs = DEFAULT_TIMEOUT_MS
): Promise<ExecutionResult> {
  return runInWorker(
    "/workers/pyodide-runner.js",
    { source, stdin },
    timeoutMs,
    {
      reuseWorker: getPyodideWorker,
      killWorker: killPyodideWorker,
    }
  );
}

export type PistonFallback = (params: {
  source: string;
  stdin: string;
}) => Promise<ExecutionResult>;

/** Web Worker first; optional server Piston fallback when the worker is blocked. */
export async function runJavaScriptClient(
  source: string,
  stdin: string,
  pistonFallback: PistonFallback,
  timeoutMs = DEFAULT_TIMEOUT_MS
): Promise<ExecutionResult> {
  const workerResult = await runJavaScriptInWorker(source, stdin, timeoutMs);
  if (!workerResult.runnerUnavailable) {
    return workerResult;
  }

  const pistonResult = await pistonFallback({ source, stdin });
  return {
    ...pistonResult,
    stderr: pistonResult.stderr || workerResult.stderr,
  };
}
