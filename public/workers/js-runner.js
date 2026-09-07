let stdinData = "";

self.onmessage = (event) => {
  const { id, source, stdin, timeoutMs } = event.data;

  stdinData = stdin ?? "";
  let stdout = "";
  let stderr = "";
  let timedOut = false;

  const timer = setTimeout(() => {
    timedOut = true;
    self.postMessage({
      id,
      stdout,
      stderr: stderr || "Execution timed out.",
      exitCode: null,
      timedOut: true,
    });
  }, timeoutMs ?? 5000);

  try {
    const sandbox = {
      console: {
        log: (...args) => {
          stdout += `${args.map(String).join(" ")}\n`;
        },
        error: (...args) => {
          stderr += `${args.map(String).join(" ")}\n`;
        },
      },
      require: (mod) => {
        if (mod === "fs") {
          return {
            readFileSync: () => stdinData,
          };
        }
        throw new Error(`Module "${mod}" is not available.`);
      },
      setTimeout,
      clearTimeout,
    };

    const fn = new Function(
      "console",
      "require",
      "setTimeout",
      "clearTimeout",
      `"use strict";\n${source}`
    );

    fn(sandbox.console, sandbox.require, sandbox.setTimeout, sandbox.clearTimeout);

    clearTimeout(timer);
    self.postMessage({
      id,
      stdout,
      stderr,
      exitCode: timedOut ? null : 0,
      timedOut,
    });
  } catch (err) {
    clearTimeout(timer);
    self.postMessage({
      id,
      stdout,
      stderr: err instanceof Error ? err.message : String(err),
      exitCode: 1,
      timedOut,
    });
  }
};
