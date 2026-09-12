self.onmessage = (event) => {
  const { id, source, stdin } = event.data;

  const stdinData = stdin ?? "";
  let stdout = "";
  let stderr = "";

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

    self.postMessage({
      id,
      stdout,
      stderr,
      exitCode: 0,
      timedOut: false,
    });
  } catch (err) {
    self.postMessage({
      id,
      stdout,
      stderr: err instanceof Error ? err.message : String(err),
      exitCode: 1,
      timedOut: false,
    });
  }
};
