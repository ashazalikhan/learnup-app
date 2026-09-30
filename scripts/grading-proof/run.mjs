import { register } from "node:module";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));
register(pathToFileURL(path.join(dir, "load-ts.mjs")).href, {
  parentURL: import.meta.url,
});

await import("./cli.ts");
