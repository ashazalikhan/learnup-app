import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getLesson, getPath } from "@/lib/curriculum/loader";
import {
  SUPPORTED_LANGUAGES,
  type LessonFixture,
  type SupportedLanguage,
} from "@/lib/curriculum/types";
import { classifyTestFailure } from "@/lib/execution/failure-reason";
import type { TestCaseResult } from "@/lib/execution/types";
import {
  LESSON_SLUGS,
  assertSolutionCoverage,
  getCorrectSolution,
  wrongFromStarter,
  type LessonSlug,
} from "./solutions";

const REQUIRED_PISTON_URL = "http://localhost:2000/api/v2";
const PATH_ID = "arrays";
const JS_RUNNER_LABEL = `runJavaScriptOnServer (node:vm on ${process.version})`;

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const outputsDir = path.join(repoRoot, "scripts", "grading-proof", "outputs");

interface PistonRuntimeRow {
  language: string;
  version: string;
  aliases?: string[];
}

interface FixtureEvidence {
  index: number;
  passed: boolean;
  exitCode: number | null;
  timedOut: boolean;
  runnerUnavailable: boolean;
  failureKind: string | null;
  stdout: string;
  stderr: string;
  error?: string;
}

interface PairResult {
  slug: LessonSlug;
  language: SupportedLanguage;
  variant: "correct" | "wrong";
  ok: boolean;
  allPassed: boolean;
  fixtures: FixtureEvidence[];
  message?: string;
}

interface BatchReport {
  proofComplete: boolean;
  submitReplayDone: boolean;
  baselineCommit: string;
  timestampLocal: string;
  nodeVersion: string;
  npmVersion: string;
  pistonApiRoute: string;
  jsRunner: string;
  pistonRuntimes: Record<string, string>;
  fixtureChanges: string;
  blockers: string[];
  unrunChecks: string[];
  summary: {
    correctPass: number;
    correctTotal: number;
    wrongPass: number;
    wrongTotal: number;
  };
  pairs: PairResult[];
  exitCode: number;
}

function normalizePistonBase(raw: string | undefined): string | null {
  if (!raw) return null;
  return raw.replace(/\/execute\/?$/, "").replace(/\/$/, "");
}

function enforceLocalPiston(): void {
  const normalized = normalizePistonBase(process.env.PISTON_API_URL);
  if (normalized !== REQUIRED_PISTON_URL) {
    console.error(
      `PISTON_API_URL must be exactly ${REQUIRED_PISTON_URL} (got ${process.env.PISTON_API_URL ?? "<unset>"}).`
    );
    process.exit(2);
  }
  process.env.PISTON_API_URL = REQUIRED_PISTON_URL;
  delete process.env.NEXT_PUBLIC_PISTON_API_URL;
}

async function npmVersion(): Promise<string> {
  const { execSync } = await import("node:child_process");
  try {
    return execSync("npm --version", { encoding: "utf8" }).trim();
  } catch {
    return "unknown";
  }
}

async function preflightPiston(): Promise<{ runtimes: Record<string, string>; blockers: string[] }> {
  const blockers: string[] = [];
  const runtimes: Record<string, string> = {};
  const url = `${REQUIRED_PISTON_URL}/runtimes`;
  let rows: PistonRuntimeRow[] = [];
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!response.ok) {
      blockers.push(`Piston runtimes GET failed: HTTP ${response.status}`);
      return { runtimes, blockers };
    }
    rows = (await response.json()) as PistonRuntimeRow[];
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    blockers.push(`Piston runtimes unreachable: ${message}`);
    return { runtimes, blockers };
  }

  const need = [
    { key: "python", match: (r: PistonRuntimeRow) => r.language === "python" },
    { key: "c", match: (r: PistonRuntimeRow) => r.language === "c" },
    { key: "cpp", match: (r: PistonRuntimeRow) => r.language === "c++" },
    { key: "java", match: (r: PistonRuntimeRow) => r.language === "java" },
  ];

  for (const { key, match } of need) {
    const row = rows.find(match);
    if (!row) {
      blockers.push(`Piston runtime missing: ${key}`);
    } else {
      runtimes[key] = row.version;
    }
  }

  return { runtimes, blockers };
}

function fixtureEvidence(results: TestCaseResult[]): FixtureEvidence[] {
  return results.map((result) => ({
    index: result.index,
    passed: result.passed,
    exitCode: result.exitCode,
    timedOut: result.timedOut,
    runnerUnavailable: Boolean(result.runnerUnavailable),
    failureKind: result.passed ? null : classifyTestFailure(result)?.kind ?? "unknown",
    stdout: result.actualStdout,
    stderr: result.stderr,
    error: result.error,
  }));
}

function assertCorrectPair(slug: LessonSlug, language: SupportedLanguage, fixtures: FixtureEvidence[]): string | null {
  for (const f of fixtures) {
    if (f.runnerUnavailable) {
      return `BLOCKED: ${slug}/${language} correct: runner unavailable on fixture ${f.index}`;
    }
    if (f.timedOut) return `${slug}/${language} correct: timeout on fixture ${f.index}`;
    if (!f.passed) {
      return `${slug}/${language} correct: fixture ${f.index} failed (exit ${f.exitCode}) stdout=${JSON.stringify(f.stdout)} stderr=${JSON.stringify(f.stderr)}`;
    }
  }
  return null;
}

function assertWrongPair(slug: LessonSlug, language: SupportedLanguage, fixtures: FixtureEvidence[]): string | null {
  for (const f of fixtures) {
    if (f.runnerUnavailable) return `BLOCKED: ${slug}/${language} wrong: runner unavailable on fixture ${f.index}`;
    if (f.timedOut) return `${slug}/${language} wrong: timeout on fixture ${f.index}`;
    if (f.passed) return `${slug}/${language} wrong: fixture ${f.index} unexpectedly passed`;
    if (f.exitCode !== 0) {
      return `${slug}/${language} wrong: fixture ${f.index} exitCode ${f.exitCode} (expected 0)`;
    }
    if (f.failureKind !== "wrong_answer") {
      return `${slug}/${language} wrong: fixture ${f.index} classified as ${f.failureKind}`;
    }
  }
  return null;
}

function writeReports(report: BatchReport): void {
  fs.mkdirSync(outputsDir, { recursive: true });
  fs.writeFileSync(path.join(outputsDir, "batch.json"), JSON.stringify(report, null, 2), "utf8");

  const lines: string[] = [
    "# Grading proof — batch run",
    "",
    `- Baseline: \`60bc518edc3f170eff1004710a2f4176bf1cd321\``,
    `- Local time: ${report.timestampLocal}`,
    `- Node: ${report.nodeVersion}`,
    `- npm: ${report.npmVersion}`,
    `- Piston route (non-JS): ${report.pistonApiRoute}`,
    `- JavaScript: ${report.jsRunner}`,
    `- Piston runtimes: ${JSON.stringify(report.pistonRuntimes)}`,
    `- Fixture changes: ${report.fixtureChanges}`,
    `- Submit replay: ${report.submitReplayDone ? "done" : "NOT DONE"}`,
    `- proofComplete: ${report.proofComplete}`,
    "",
    `## Totals`,
    `- Correct: ${report.summary.correctPass}/${report.summary.correctTotal}`,
    `- Wrong-answer negatives: ${report.summary.wrongPass}/${report.summary.wrongTotal}`,
    "",
  ];

  if (report.blockers.length) {
    lines.push("## Blockers", ...report.blockers.map((b) => `- ${b}`), "");
  }
  if (report.unrunChecks.length) {
    lines.push("## Unrun", ...report.unrunChecks.map((u) => `- ${u}`), "");
  }

  lines.push("## Matrix (batch)", "", "| Lesson | JS | Py | C | C++ | Java |", "| --- | --- | --- | --- | --- | --- |");
  for (const slug of LESSON_SLUGS) {
    const cells = SUPPORTED_LANGUAGES.map((lang) => {
      const c = report.pairs.find((p) => p.slug === slug && p.language === lang && p.variant === "correct");
      const w = report.pairs.find((p) => p.slug === slug && p.language === lang && p.variant === "wrong");
      if (!c || !w) return "?";
      return c.ok && w.ok ? "✓" : "✗";
    });
    lines.push(`| ${slug} | ${cells.join(" | ")} |`);
  }

  fs.writeFileSync(path.join(outputsDir, "batch.md"), lines.join("\n"), "utf8");
}

async function main(): Promise<void> {
  enforceLocalPiston();

  const pathMeta = getPath(PATH_ID);
  if (!pathMeta) {
    console.error("arrays path missing");
    process.exit(2);
  }
  const slugsFromPath = pathMeta.lessons.map((l) => l.slug);
  if (slugsFromPath.length !== 10) {
    console.error(`Expected 10 lessons, got ${slugsFromPath.length}`);
    process.exit(2);
  }
  for (let i = 0; i < LESSON_SLUGS.length; i++) {
    if (slugsFromPath[i] !== LESSON_SLUGS[i]) {
      console.error(`Lesson order mismatch at ${i}: ${slugsFromPath[i]} vs ${LESSON_SLUGS[i]}`);
      process.exit(2);
    }
  }
  if (SUPPORTED_LANGUAGES.length !== 5) {
    console.error("Expected 5 supported languages");
    process.exit(2);
  }

  assertSolutionCoverage(SUPPORTED_LANGUAGES);

  const { runFixtures } = await import("@/lib/execution/run-tests");

  const PROOF_TIMEOUT_MS = 60_000;

  async function runFixturesResilient(
    params: { source: string; language: SupportedLanguage },
    fixtures: LessonFixture[]
  ) {
    const withTimeout = { ...params, timeoutMs: PROOF_TIMEOUT_MS };
    const maxAttempts = 5;
    let last = await runFixtures(withTimeout, fixtures);
    for (let attempt = 2; attempt <= maxAttempts; attempt++) {
      const transportFailure =
        last.runnerUnavailable ||
        last.results.some((r) => r.runnerUnavailable || (r.timedOut && !r.stderr?.trim()));
      if (!transportFailure) break;
      await new Promise((resolve) => setTimeout(resolve, 3000 * attempt));
      last = await runFixtures(withTimeout, fixtures);
    }
    return last;
  }

  const preflight = await preflightPiston();
  const pairs: PairResult[] = [];
  const blockers = [...preflight.blockers];
  let exitCode = 0;

  if (blockers.length > 0) {
    exitCode = 2;
  } else {
    await runFixturesResilient(
      {
        source: `public class Main { public static void main(String[] args) { System.out.println("warmup"); } }`,
        language: "java",
      },
      [{ stdin: "", expectedStdout: "warmup" }]
    );

    for (const slug of LESSON_SLUGS) {
      const lesson = getLesson(PATH_ID, slug);
      if (!lesson) {
        blockers.push(`Lesson missing: ${slug}`);
        exitCode = 2;
        break;
      }

      for (const language of SUPPORTED_LANGUAGES) {
        const correctSource = getCorrectSolution(slug, language);
        const wrongSource = wrongFromStarter(lesson.starters[language], language);

        const correctRun = await runFixturesResilient(
          { source: correctSource, language },
          lesson.fixtures
        );
        const correctFixtures = fixtureEvidence(correctRun.results);
        let correctOk = correctRun.allPassed;
        const correctMsg = assertCorrectPair(slug, language, correctFixtures);
        if (correctMsg) {
          correctOk = false;
          if (correctMsg.startsWith("BLOCKED:")) {
            blockers.push(correctMsg);
            exitCode = 2;
          } else if (exitCode !== 2) {
            exitCode = 1;
          }
        }
        pairs.push({
          slug,
          language,
          variant: "correct",
          ok: correctOk,
          allPassed: correctRun.allPassed,
          fixtures: correctFixtures,
          message: correctMsg ?? undefined,
        });

        const wrongRun = await runFixturesResilient(
          { source: wrongSource, language },
          lesson.fixtures
        );
        const wrongFixtures = fixtureEvidence(wrongRun.results);
        let wrongOk = !wrongRun.allPassed;
        const wrongMsg = assertWrongPair(slug, language, wrongFixtures);
        if (wrongMsg) {
          wrongOk = false;
          if (wrongMsg.startsWith("BLOCKED:")) {
            blockers.push(wrongMsg);
            exitCode = 2;
          } else if (exitCode !== 2) {
            exitCode = 1;
          }
        } else {
          wrongOk = true;
        }
        pairs.push({
          slug,
          language,
          variant: "wrong",
          ok: wrongOk,
          allPassed: wrongRun.allPassed,
          fixtures: wrongFixtures,
          message: wrongMsg ?? undefined,
        });

        await new Promise((resolve) => setTimeout(resolve, 200));
      }
    }
  }

  const correctPairs = pairs.filter((p) => p.variant === "correct");
  const wrongPairs = pairs.filter((p) => p.variant === "wrong");
  const correctPass = correctPairs.filter((p) => p.ok).length;
  const wrongPass = wrongPairs.filter((p) => p.ok).length;

  if (blockers.length === 0) {
    if (correctPass !== 50 || wrongPass !== 50) {
      if (exitCode !== 2) exitCode = 1;
    } else {
      exitCode = 0;
    }
  }

  const report: BatchReport = {
    proofComplete: false,
    submitReplayDone: false,
    baselineCommit: "60bc518edc3f170eff1004710a2f4176bf1cd321",
    timestampLocal: new Date().toString(),
    nodeVersion: process.version,
    npmVersion: await npmVersion(),
    pistonApiRoute: REQUIRED_PISTON_URL,
    jsRunner: JS_RUNNER_LABEL,
    pistonRuntimes: preflight.runtimes,
    fixtureChanges: "none",
    blockers,
    unrunChecks: ["submit-replay (requires local app + disposable Supabase + test user)"],
    summary: {
      correctPass,
      correctTotal: 50,
      wrongPass,
      wrongTotal: 50,
    },
    pairs,
    exitCode,
  };

  writeReports(report);
  writeSubmitReplayBlocked();

  if (exitCode === 0) {
    console.log("Batch grading proof passed: 50/50 correct, 50/50 wrong_answer negatives.");
  } else {
    console.error(`Batch grading proof finished with exit ${exitCode}. See scripts/grading-proof/outputs/batch.md`);
  }

  process.exit(exitCode);
}

function writeSubmitReplayBlocked(): void {
  fs.mkdirSync(outputsDir, { recursive: true });
  const body = `# Submit replay

Status: **BLOCKED** until local dev server, local/disposable Supabase, and a dedicated test user are available.

See \`scripts/grading-proof/README.md\` for the manual checklist and copy-ready solutions in \`solutions.ts\`.

Batch-only success is not full proof.
`;
  fs.writeFileSync(path.join(outputsDir, "submit-replay.md"), body, "utf8");
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
