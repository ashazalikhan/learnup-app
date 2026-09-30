import type { TestCaseResult } from "@/lib/execution/types";

export type TestFailureKind =
  | "wrong_answer"
  | "time_limit"
  | "execution_error"
  | "runner_unavailable"
  | "unknown";

export interface TestFailurePresentation {
  kind: TestFailureKind;
  label: string;
  showExpectedGot: boolean;
  detail?: string;
}

type FailureInput = Pick<
  TestCaseResult,
  "passed" | "timedOut" | "runnerUnavailable" | "error" | "exitCode" | "stderr"
>;

function isTransportFailure(result: FailureInput): boolean {
  return Boolean(result.runnerUnavailable && result.error);
}

/** Presentation-only classification for failed test rows (does not affect grading). */
export function classifyTestFailure(result: FailureInput): TestFailurePresentation | null {
  if (result.passed) {
    return null;
  }

  if (isTransportFailure(result)) {
    return {
      kind: "runner_unavailable",
      label: "Runner unavailable. This test could not be graded. Try again.",
      showExpectedGot: false,
      detail: result.error?.trim() || undefined,
    };
  }

  if (result.timedOut) {
    return {
      kind: "time_limit",
      label: "Time limit exceeded",
      showExpectedGot: false,
    };
  }

  if (result.exitCode !== null && result.exitCode !== 0) {
    const detail =
      result.stderr?.trim() ||
      result.error?.trim() ||
      "The program exited with an error.";
    return {
      kind: "execution_error",
      label: "Execution error",
      showExpectedGot: false,
      detail,
    };
  }

  if (result.exitCode === 0) {
    return {
      kind: "wrong_answer",
      label: "Wrong answer",
      showExpectedGot: true,
    };
  }

  const detail =
    result.stderr?.trim() ||
    result.error?.trim() ||
    "This test could not be graded.";
  return {
    kind: "unknown",
    label: "Execution failed",
    showExpectedGot: false,
    detail,
  };
}

export function resultsHaveRunnerTransportFailure(
  results: TestCaseResult[] | null | undefined
): boolean {
  return Boolean(
    results?.some((result) => !result.passed && result.runnerUnavailable && result.error)
  );
}

export function executionHasRunnerTransportFailure(
  execution: Pick<ExecutionResultLike, "runnerUnavailable" | "error"> | null | undefined
): boolean {
  return Boolean(execution?.runnerUnavailable && execution.error);
}

interface ExecutionResultLike {
  runnerUnavailable?: boolean;
  error?: string;
}
