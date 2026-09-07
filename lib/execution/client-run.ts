import type { ExecutionResult } from "@/lib/execution/types";

let worker: Worker | null = null;
let nextId = 0;

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker("/workers/js-runner.js");
  }
  return worker;
}

export function runJavaScriptInWorker(
  source: string,
  stdin: string,
  timeoutMs = 5000
): Promise<ExecutionResult> {
  return new Promise((resolve) => {
    const id = ++nextId;
    const w = getWorker();

    const onMessage = (event: MessageEvent) => {
      if (event.data?.id !== id) return;
      w.removeEventListener("message", onMessage);
      resolve({
        stdout: event.data.stdout ?? "",
        stderr: event.data.stderr ?? "",
        exitCode: event.data.exitCode ?? 1,
        timedOut: Boolean(event.data.timedOut),
      });
    };

    w.addEventListener("message", onMessage);
    w.postMessage({ id, source, stdin, timeoutMs });
  });
}

let pyodideReady: Promise<{
  runPythonAsync: (code: string) => Promise<void>;
  setStdout: (opts: { batched: (msg: string) => void }) => void;
  setStderr: (opts: { batched: (msg: string) => void }) => void;
}> | null = null;

async function getPyodide() {
  if (!pyodideReady) {
    pyodideReady = (async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const loadPyodide = (globalThis as any).loadPyodide as
        | ((opts: { indexURL: string }) => Promise<unknown>)
        | undefined;

      if (!loadPyodide) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js";
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Could not load Pyodide."));
          document.head.appendChild(script);
        });
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const runtime = await (globalThis as any).loadPyodide({
        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/",
      });

      return runtime as {
        runPythonAsync: (code: string) => Promise<void>;
        setStdout: (opts: { batched: (msg: string) => void }) => void;
        setStderr: (opts: { batched: (msg: string) => void }) => void;
      };
    })();
  }

  return pyodideReady;
}

export async function runPythonInPyodide(
  source: string,
  stdin: string,
  timeoutMs = 5000
): Promise<ExecutionResult> {
  let stdout = "";
  let stderr = "";
  let timedOut = false;

  try {
    const pyodide = await getPyodide();
    pyodide.setStdout({ batched: (msg) => { stdout += msg; } });
    pyodide.setStderr({ batched: (msg) => { stderr += msg; } });

    const wrapped = `
import sys
from io import StringIO
sys.stdin = StringIO(${JSON.stringify(stdin)})
${source}
`;

    await Promise.race([
      pyodide.runPythonAsync(wrapped),
      new Promise<never>((_, reject) => {
        setTimeout(() => {
          timedOut = true;
          reject(new Error("Execution timed out."));
        }, timeoutMs);
      }),
    ]);

    return { stdout, stderr, exitCode: 0, timedOut };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Pyodide runtime error";
    if (!stderr) stderr = message;
    return {
      stdout,
      stderr,
      exitCode: 1,
      timedOut,
      runnerUnavailable: message.includes("Could not load Pyodide"),
      error: message,
    };
  }
}
