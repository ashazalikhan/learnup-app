"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { Group, Panel, Separator } from "react-resizable-panels";
import { Button } from "@/components/ui/button";
import { CodeEditor } from "@/components/learn/CodeEditor";
import {
  executeCodeAction,
  executeWithPistonAction,
  runLessonTestsAction,
  submitLessonAttempt,
} from "@/app/actions/lesson";
import { compareStdout } from "@/lib/execution/compare";
import { normalizeFixtureText } from "@/lib/execution/fixture-encoding";
import {
  runJavaScriptClient,
  runPythonInPyodide,
} from "@/lib/execution/client-run";
import type { ExecutionResult, TestCaseResult } from "@/lib/execution/types";
import {
  classifyTestFailure,
  executionHasRunnerTransportFailure,
  resultsHaveRunnerTransportFailure,
} from "@/lib/execution/failure-reason";
import {
  LANGUAGE_LABELS,
  SUPPORTED_LANGUAGES,
  type Lesson,
  type SupportedLanguage,
} from "@/lib/lessons/types";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

type MobileTab = "problem" | "code" | "output";

interface LessonNav {
  path: string;
  slug: string;
  key: string;
}

interface LessonWorkspaceProps {
  lesson: Lesson;
  pathTitle: string;
  lessonNumber: number;
  totalLessons: number;
  prevLesson: LessonNav | null;
  nextLesson: LessonNav | null;
  isCompleted?: boolean;
}


function ProblemPanel({ lesson }: { lesson: Lesson }) {
  return (
    <div className="h-full overflow-y-auto p-5 md:p-6 space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent-green mb-2">
          {lesson.path}
        </p>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground mb-3">
          {lesson.title}
        </h1>
        <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
          {lesson.statement}
        </p>
      </div>

      <div className="rounded-xl border-2 border-border bg-surface-secondary/50 p-4">
        <h2 className="text-xs font-bold uppercase tracking-wide text-foreground mb-2">
          Input / Output
        </h2>
        <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
          {lesson.ioRules}
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wide text-foreground">
          Examples
        </h2>
        {lesson.examples.map((example, index) => (
          <div
            key={index}
            className="rounded-xl border-2 border-border bg-card p-4 space-y-3"
          >
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-text-muted mb-1">
                Input
              </p>
              <pre className="text-xs font-mono bg-surface-secondary rounded-lg p-3 overflow-x-auto">
                {normalizeFixtureText(example.input)}
              </pre>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-text-muted mb-1">
                Output
              </p>
              <pre className="text-xs font-mono bg-surface-secondary rounded-lg p-3 overflow-x-auto">
                {normalizeFixtureText(example.output)}
              </pre>
            </div>
            {example.explanation ? (
              <p className="text-xs text-text-secondary">{example.explanation}</p>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function OutputPanel({
  running,
  runResult,
  testResults,
  statusMessage,
  showRunnerTransportWarning,
}: {
  running: boolean;
  runResult: ExecutionResult | null;
  testResults: TestCaseResult[] | null;
  statusMessage: string | null;
  showRunnerTransportWarning: boolean;
}) {
  return (
    <div className="h-full overflow-y-auto p-4 space-y-4 font-mono text-xs">
      {running ? (
        <p className="text-text-muted">Running…</p>
      ) : null}

      {statusMessage ? (
        <p
          className={cn(
            "rounded-lg border-2 px-3 py-2 leading-relaxed",
            statusMessage.toLowerCase().includes("passed")
              ? "border-accent-green/40 bg-accent-green/10 text-accent-green"
              : "border-border bg-surface-secondary text-foreground"
          )}
        >
          {statusMessage}
        </p>
      ) : null}

      {showRunnerTransportWarning ? (
        <div className="rounded-lg border-2 border-energy/40 bg-energy/10 p-3 text-energy leading-relaxed">
          Runner unavailable — one or more tests could not be graded. Try again.
        </div>
      ) : null}

      {runResult ? (
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wide text-text-muted">
            Console
          </p>
          {runResult.stdout ? (
            <pre className="whitespace-pre-wrap rounded-lg bg-surface-secondary p-3 text-foreground">
              {runResult.stdout}
            </pre>
          ) : (
            <p className="text-text-muted">(no stdout)</p>
          )}
          {runResult.stderr ? (
            <pre className="whitespace-pre-wrap rounded-lg bg-destructive/10 p-3 text-destructive">
              {runResult.stderr}
            </pre>
          ) : null}
          {runResult.timedOut ? (
            <p className="text-energy">Time limit exceeded</p>
          ) : null}
          {runResult.runnerUnavailable && runResult.error ? (
            <p className="text-energy leading-relaxed">
              Runner unavailable. This run could not be completed. Try again.
              {runResult.error ? (
                <span className="block mt-1 text-text-secondary break-words">{runResult.error}</span>
              ) : null}
            </p>
          ) : null}
        </div>
      ) : null}

      {testResults ? (
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wide text-text-muted">
            Tests
          </p>
          {testResults.map((result) => {
            const failure = classifyTestFailure(result);
            return (
            <div
              key={result.index}
              className={cn(
                "rounded-lg border-2 p-3 space-y-1",
                result.passed
                  ? "border-accent-green/30 bg-accent-green/5"
                  : "border-destructive/30 bg-destructive/5"
              )}
            >
              <p className="font-bold text-foreground">
                Test {result.index + 1}: {result.passed ? "PASS" : failure?.label ?? "FAIL"}
              </p>
              {failure?.showExpectedGot ? (
                <>
                  <p className="text-text-muted break-words">Expected: {result.expectedStdout}</p>
                  <p className="text-text-muted break-words">
                    Got: {result.actualStdout || "(empty)"}
                  </p>
                </>
              ) : null}
              {failure && !failure.showExpectedGot && failure.detail ? (
                <pre className="whitespace-pre-wrap break-words text-destructive">
                  {failure.detail}
                </pre>
              ) : null}
              {failure?.showExpectedGot && result.stderr ? (
                <pre className="whitespace-pre-wrap break-words text-destructive">
                  {result.stderr}
                </pre>
              ) : null}
            </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export function LessonWorkspace({
  lesson,
  pathTitle,
  lessonNumber,
  totalLessons,
  prevLesson,
  nextLesson,
  isCompleted = false,
}: LessonWorkspaceProps) {
  const [language, setLanguage] = useState<SupportedLanguage>("javascript");
  const [source, setSource] = useState(lesson.starters.javascript);
  const [startersByLang] = useState(lesson.starters);
  const [lastStarterLang, setLastStarterLang] = useState<SupportedLanguage>("javascript");
  const [mobileTab, setMobileTab] = useState<MobileTab>("problem");
  const [running, setRunning] = useState(false);
  const [runResult, setRunResult] = useState<ExecutionResult | null>(null);
  const [testResults, setTestResults] = useState<TestCaseResult[] | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [justPassed, setJustPassed] = useState(false);

  const showRunnerTransportWarning = useMemo(
    () =>
      resultsHaveRunnerTransportFailure(testResults) ||
      executionHasRunnerTransportFailure(runResult),
    [testResults, runResult]
  );

  const exampleStdin = useMemo(
    () => normalizeFixtureText(lesson.examples[0]?.input ?? "") + "\n",
    [lesson.examples]
  );

  const handleLanguageChange = (next: SupportedLanguage) => {
    const previousStarter = startersByLang[lastStarterLang];
    if (source === previousStarter) {
      setSource(startersByLang[next]);
      setLastStarterLang(next);
    }
    setLanguage(next);
  };

  const handleReset = () => {
    setSource(startersByLang[language]);
    setLastStarterLang(language);
    setRunResult(null);
    setTestResults(null);
    setStatusMessage(null);
  };

  const runLocally = useCallback(
    async (stdin: string): Promise<ExecutionResult> => {
      if (language === "javascript") {
        const result = await runJavaScriptClient(source, stdin, async ({ source: code, stdin: inData }) => {
          return executeWithPistonAction({ source: code, language: "javascript", stdin: inData });
        });
        return result;
      }

      if (language === "python") {
        const piston = await executeWithPistonAction({ source, language, stdin });
        if (!piston.runnerUnavailable && !piston.error) {
          return piston;
        }
        const pyodide = await runPythonInPyodide(source, stdin);
        return pyodide;
      }

      return executeCodeAction({ source, language, stdin });
    },
    [language, source]
  );

  const handleRun = async () => {
    setRunning(true);
    setTestResults(null);
    setStatusMessage(null);

    try {
      const result = await runLocally(exampleStdin);
      setRunResult(result);
    } finally {
      setRunning(false);
      setMobileTab("output");
    }
  };

  const handleRunTests = async () => {
    setRunning(true);
    setRunResult(null);
    setStatusMessage(null);

    try {
      if (language === "javascript") {
        let usedPistonFallback = false;
        const results: TestCaseResult[] = [];
        for (let index = 0; index < lesson.fixtures.length; index++) {
          const fixture = lesson.fixtures[index];
          const stdin = normalizeFixtureText(fixture.stdin);
          const expectedStdout = normalizeFixtureText(fixture.expectedStdout);
          const execution = await runJavaScriptClient(
            source,
            stdin,
            async ({ source: code, stdin: inData }) => {
              usedPistonFallback = true;
              return executeWithPistonAction({
                source: code,
                language: "javascript",
                stdin: inData,
              });
            }
          );
          results.push({
            index,
            passed:
              !execution.timedOut &&
              execution.exitCode === 0 &&
              compareStdout(execution.stdout, expectedStdout),
            expectedStdout,
            actualStdout: execution.stdout,
            stderr: execution.stderr,
            exitCode: execution.exitCode,
            timedOut: execution.timedOut,
            runnerUnavailable: execution.runnerUnavailable,
            error: execution.error,
          });
        }
        setTestResults(results);
        const allPassed = results.every((r) => r.passed);
        setStatusMessage(
          allPassed
            ? usedPistonFallback
              ? "All tests passed (server runner fallback)."
              : "All tests passed locally."
            : "Some tests failed."
        );
      } else if (language === "python") {
        const serverRun = await runLessonTestsAction({
          source,
          language,
          lessonKey: lesson.key,
        });
        if (!serverRun.runnerUnavailable) {
          setTestResults(serverRun.results);
          setStatusMessage(
            serverRun.allPassed ? "All tests passed." : "Some tests failed."
          );
          return;
        }

        const results: TestCaseResult[] = [];
        for (let index = 0; index < lesson.fixtures.length; index++) {
          const fixture = lesson.fixtures[index];
          const stdin = normalizeFixtureText(fixture.stdin);
          const expectedStdout = normalizeFixtureText(fixture.expectedStdout);
          const execution = await runPythonInPyodide(source, stdin);
          results.push({
            index,
            passed:
              !execution.timedOut &&
              execution.exitCode === 0 &&
              compareStdout(execution.stdout, expectedStdout),
            expectedStdout,
            actualStdout: execution.stdout,
            stderr: execution.stderr,
            exitCode: execution.exitCode,
            timedOut: execution.timedOut,
            runnerUnavailable: execution.runnerUnavailable,
            error: execution.error,
          });
        }
        setTestResults(results);
        setStatusMessage(
          results.every((r) => r.passed)
            ? "All tests passed (Pyodide fallback)."
            : "Some tests failed (Pyodide fallback)."
        );
      } else {
        const serverRun = await runLessonTestsAction({
          source,
          language,
          lessonKey: lesson.key,
        });
        setTestResults(serverRun.results);
        setStatusMessage(
          serverRun.allPassed ? "All tests passed." : "Some tests failed."
        );
      }
    } finally {
      setRunning(false);
      setMobileTab("output");
    }
  };

  const handleSubmit = async () => {
    setRunning(true);
    setRunResult(null);
    setStatusMessage(null);

    try {
      const result = await submitLessonAttempt({
        source,
        language,
        lessonKey: lesson.key,
      });
      setTestResults(result.results);
      setStatusMessage(result.message ?? (result.passed ? "Passed!" : "Not quite."));
      if (result.passed) setJustPassed(true);
    } finally {
      setRunning(false);
      setMobileTab("output");
    }
  };

  const toolbar = (
    <div className="flex flex-wrap items-center gap-2 border-b-2 border-border bg-card px-3 py-2">
      <select
        value={language}
        onChange={(e) => handleLanguageChange(e.target.value as SupportedLanguage)}
        className="h-9 rounded-lg border-2 border-border bg-surface-secondary px-2 text-xs font-bold uppercase tracking-wide"
        aria-label="Language"
      >
        {SUPPORTED_LANGUAGES.map((lang) => (
          <option key={lang} value={lang}>
            {LANGUAGE_LABELS[lang]}
          </option>
        ))}
      </select>
      <Button size="sm" variant="outline" onClick={handleRun} disabled={running}>
        Run
      </Button>
      <Button size="sm" variant="secondary" onClick={handleRunTests} disabled={running}>
        Run tests
      </Button>
      <Button size="sm" variant="cta" onClick={handleSubmit} disabled={running}>
        Submit
      </Button>
      <Button size="sm" variant="ghost" onClick={handleReset} disabled={running}>
        Reset
      </Button>
      <Link
        href="/dashboard"
        className="ml-auto text-xs font-bold uppercase tracking-wide text-text-muted hover:text-foreground"
      >
        Dashboard
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b-2 border-border bg-card px-4 py-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent-green">
            {pathTitle} · Lesson {lessonNumber} of {totalLessons}
          </p>
          <p className="text-sm font-extrabold text-foreground">{lesson.title}</p>
        </div>
        <div className="flex items-center gap-3">
          {isCompleted ? (
            <span className="text-[10px] font-bold uppercase tracking-wide text-accent-green bg-accent-green/10 px-2 py-1 rounded-md">
              Completed
            </span>
          ) : null}
          <Link
            href="/dashboard"
            className="text-xs font-bold uppercase tracking-wide text-text-muted hover:text-foreground"
          >
            Path
          </Link>
        </div>
      </header>

      <div className="lg:hidden border-b-2 border-border bg-card px-2 py-2 flex gap-1">
        {(["problem", "code", "output"] as MobileTab[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setMobileTab(tab)}
            className={cn(
              "flex-1 rounded-lg px-2 py-2 text-xs font-bold uppercase tracking-wide",
              mobileTab === tab
                ? "bg-accent-green/10 text-accent-green border-2 border-accent-green"
                : "text-text-secondary border-2 border-transparent"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="hidden lg:flex flex-1 min-h-0 flex-col">
        {toolbar}
        <Group orientation="horizontal" className="flex-1 min-h-0">
          <Panel defaultSize="38%" minSize="24%">
            <ProblemPanel lesson={lesson} />
          </Panel>
          <Separator className="w-1.5 bg-border hover:bg-accent-green/40 transition-colors" />
          <Panel defaultSize="62%" minSize="30%">
            <Group orientation="vertical" className="h-full">
              <Panel defaultSize="62%" minSize="30%">
                <div className="h-full p-3">
                  <CodeEditor value={source} language={language} onChange={setSource} />
                </div>
              </Panel>
              <Separator className="h-1.5 bg-border hover:bg-accent-green/40 transition-colors" />
              <Panel defaultSize="38%" minSize="20%">
                <div className="h-full border-t-2 border-border bg-surface-secondary/30">
                  <OutputPanel
                    running={running}
                    runResult={runResult}
                    testResults={testResults}
                    statusMessage={statusMessage}
                    showRunnerTransportWarning={showRunnerTransportWarning}
                  />
                </div>
              </Panel>
            </Group>
          </Panel>
        </Group>
      </div>

      <div className="lg:hidden flex-1 min-h-0 flex flex-col">
        {mobileTab === "code" ? toolbar : null}
        <div className="flex-1 min-h-0">
          {mobileTab === "problem" ? <ProblemPanel lesson={lesson} /> : null}
          {mobileTab === "code" ? (
            <div className="h-full p-3">
              <CodeEditor value={source} language={language} onChange={setSource} />
            </div>
          ) : null}
          {mobileTab === "output" ? (
            <OutputPanel
              running={running}
              runResult={runResult}
              testResults={testResults}
              statusMessage={statusMessage}
              showRunnerTransportWarning={showRunnerTransportWarning}
            />
          ) : null}
        </div>
        {mobileTab !== "code" ? (
          <div className="border-t-2 border-border bg-card p-2 flex flex-wrap gap-2 items-center">
            <Button size="sm" variant="outline" onClick={handleRun} disabled={running}>
              Run
            </Button>
            <Button size="sm" variant="secondary" onClick={handleRunTests} disabled={running}>
              Tests
            </Button>
            <Button size="sm" variant="cta" onClick={handleSubmit} disabled={running}>
              Submit
            </Button>
            {justPassed && nextLesson ? (
              <Link
                href={`/learn/${nextLesson.path}/${nextLesson.slug}`}
                className={cn(buttonVariants({ variant: "cta", size: "sm" }), "ml-auto")}
              >
                Next lesson
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>

      {(justPassed && nextLesson) || prevLesson ? (
        <footer className="hidden lg:flex border-t-2 border-border bg-card px-4 py-3 items-center justify-between gap-3">
          {prevLesson ? (
            <Link
              href={`/learn/${prevLesson.path}/${prevLesson.slug}`}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              ← Previous
            </Link>
          ) : (
            <span />
          )}
          {justPassed && nextLesson ? (
            <Link
              href={`/learn/${nextLesson.path}/${nextLesson.slug}`}
              className={cn(buttonVariants({ variant: "cta", size: "sm" }))}
            >
              Next lesson →
            </Link>
          ) : null}
        </footer>
      ) : null}
    </div>
  );
}
