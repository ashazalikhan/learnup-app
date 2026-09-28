import { compareStdout } from "@/lib/execution/compare";
import { normalizeFixtureText } from "@/lib/execution/fixture-encoding";
import { runOnServer } from "@/lib/execution/piston";
import type { ExecuteParams, ExecutionResult, TestCaseResult, TestRunResult } from "@/lib/execution/types";
import type { LessonFixture } from "@/lib/lessons/types";

/** Local Piston SIGKILLs under concurrent /execute; serialize all fixture runs. */
let pistonRunChain: Promise<unknown> = Promise.resolve();

function runOnServerSequentially(params: ExecuteParams): Promise<ExecutionResult> {
  const run = pistonRunChain.then(() => runOnServer(params));
  pistonRunChain = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

export async function runFixtures(
  params: Omit<ExecuteParams, "stdin">,
  fixtures: LessonFixture[]
): Promise<TestRunResult> {
  const results: TestCaseResult[] = [];
  let runnerUnavailable = false;

  for (let index = 0; index < fixtures.length; index++) {
    const fixture = fixtures[index];
    const stdin = normalizeFixtureText(fixture.stdin);
    const expectedStdout = normalizeFixtureText(fixture.expectedStdout);
    const execution = await runOnServerSequentially({
      ...params,
      stdin,
    });

    if (execution.runnerUnavailable) {
      runnerUnavailable = true;
    }

    const passed =
      !execution.timedOut &&
      !execution.runnerUnavailable &&
      execution.exitCode === 0 &&
      compareStdout(execution.stdout, expectedStdout);

    results.push({
      index,
      passed,
      expectedStdout,
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
