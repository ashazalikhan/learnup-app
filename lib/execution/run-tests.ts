import { compareStdout } from "@/lib/execution/compare";
import { runOnServer } from "@/lib/execution/piston";
import type { ExecuteParams, TestCaseResult, TestRunResult } from "@/lib/execution/types";
import type { LessonFixture } from "@/lib/lessons/types";

export async function runFixtures(
  params: Omit<ExecuteParams, "stdin">,
  fixtures: LessonFixture[]
): Promise<TestRunResult> {
  const results: TestCaseResult[] = [];
  let runnerUnavailable = false;

  for (let index = 0; index < fixtures.length; index++) {
    const fixture = fixtures[index];
    const execution = await runOnServer({
      ...params,
      stdin: fixture.stdin,
    });

    if (execution.runnerUnavailable) {
      runnerUnavailable = true;
    }

    const passed =
      !execution.timedOut &&
      !execution.runnerUnavailable &&
      execution.exitCode === 0 &&
      compareStdout(execution.stdout, fixture.expectedStdout);

    results.push({
      index,
      passed,
      expectedStdout: fixture.expectedStdout,
      actualStdout: execution.stdout,
      stderr: execution.stderr,
      timedOut: execution.timedOut,
      runnerUnavailable: execution.runnerUnavailable,
      error: execution.error,
    });
  }

  const allPassed = results.length > 0 && results.every((result) => result.passed);

  return {
    results,
    allPassed,
    runnerUnavailable,
    error: runnerUnavailable
      ? "The code runner is unavailable. Check your network or try again later."
      : undefined,
  };
}
