const PYODIDE_CDN = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/";

let pyodide = null;
let pyodideLoading = null;

async function ensurePyodide() {
  if (pyodide) return pyodide;
  if (!pyodideLoading) {
    pyodideLoading = (async () => {
      importScripts(`${PYODIDE_CDN}pyodide.js`);
      pyodide = await loadPyodide({ indexURL: PYODIDE_CDN });
      return pyodide;
    })();
  }
  return pyodideLoading;
}

self.onmessage = async (event) => {
  const { id, source, stdin } = event.data;
  let stdout = "";
  let stderr = "";

  try {
    const runtime = await ensurePyodide();
    runtime.setStdout({ batched: (msg) => { stdout += msg; } });
    runtime.setStderr({ batched: (msg) => { stderr += msg; } });

    const wrapped = `
import sys
from io import StringIO
sys.stdin = StringIO(${JSON.stringify(stdin ?? "")})
${source}
`;

    await runtime.runPythonAsync(wrapped);

    self.postMessage({
      id,
      stdout,
      stderr,
      exitCode: 0,
      timedOut: false,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const loadFailed =
      message.includes("Could not load Pyodide") ||
      message.includes("importScripts") ||
      message.includes("loadPyodide");

    self.postMessage({
      id,
      stdout,
      stderr: stderr || message,
      exitCode: 1,
      timedOut: false,
      runnerUnavailable: loadFailed,
      error: message,
    });
  }
};
