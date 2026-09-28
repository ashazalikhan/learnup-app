import type { ExecuteParams, ExecutionResult } from "@/lib/execution/types";

export async function runJavaScriptOnServer({
  source,
  stdin,
  timeoutMs = 5000,
}: ExecuteParams): Promise<ExecutionResult> {
  const vm = await import("node:vm");

  let stdout = "";
  let stderr = "";
  let timedOut = false;

  const sandbox: Record<string, unknown> = {
    console: {
      log: (...args: unknown[]) => {
        stdout += `${args.map(String).join(" ")}\n`;
      },
      error: (...args: unknown[]) => {
        stderr += `${args.map(String).join(" ")}\n`;
      },
    },
    require: (mod: string) => {
      if (mod === "fs") {
        return {
          readFileSync: () => stdin,
        };
      }
      throw new Error(`Module "${mod}" is not available in this sandbox.`);
    },
    setTimeout,
    clearTimeout,
  };

  try {
    const script = new vm.Script(source, { filename: "solution.js" });
    const context = vm.createContext(sandbox);

    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => {
        timedOut = true;
        reject(new Error("Execution timed out."));
      }, timeoutMs);

      try {
        script.runInContext(context, { timeout: timeoutMs });
        clearTimeout(timer);
        resolve();
      } catch (err) {
        clearTimeout(timer);
        reject(err);
      }
    });

    return {
      stdout,
      stderr,
      exitCode: timedOut ? null : 0,
      timedOut,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Runtime error";
    if (!stderr) stderr = message;
    return {
      stdout,
      stderr,
      exitCode: 1,
      timedOut: timedOut || message.toLowerCase().includes("timed out"),
    };
  }
}
