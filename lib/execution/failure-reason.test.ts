import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  classifyTestFailure,
  executionHasRunnerTransportFailure,
  resultsHaveRunnerTransportFailure,
} from "./failure-reason.ts";
import type { TestCaseResult } from "./types.ts";

function failed(
  overrides: Partial<TestCaseResult> & Pick<TestCaseResult, "passed">
): TestCaseResult {
  return {
    index: 0,
    expectedStdout: "1\n",
    actualStdout: "",
    stderr: "",
    timedOut: false,
    exitCode: 1,
    ...overrides,
    passed: overrides.passed,
  };
}

describe("classifyTestFailure", () => {
  it("returns null for a passing test", () => {
    assert.equal(
      classifyTestFailure(failed({ passed: true, exitCode: 0 })),
      null
    );
  });

  it("labels a normal wrong answer with Expected/Got", () => {
    const presentation = classifyTestFailure(
      failed({ passed: false, exitCode: 0, actualStdout: "2\n" })
    );
    assert.equal(presentation?.kind, "wrong_answer");
    assert.equal(presentation?.label, "Wrong answer");
    assert.equal(presentation?.showExpectedGot, true);
  });

  it("keeps wrong answer when stderr is harmless", () => {
    const presentation = classifyTestFailure(
      failed({
        passed: false,
        exitCode: 0,
        stderr: "debug log\n",
        actualStdout: "2\n",
      })
    );
    assert.equal(presentation?.kind, "wrong_answer");
    assert.equal(presentation?.showExpectedGot, true);
  });

  it("labels explicit timeouts without Expected/Got", () => {
    const presentation = classifyTestFailure(
      failed({ passed: false, timedOut: true, exitCode: null })
    );
    assert.equal(presentation?.kind, "time_limit");
    assert.equal(presentation?.showExpectedGot, false);
  });

  it("treats Piston timeout + unavailable flag without error as time limit", () => {
    const presentation = classifyTestFailure(
      failed({
        passed: false,
        timedOut: true,
        runnerUnavailable: true,
        exitCode: null,
      })
    );
    assert.equal(presentation?.kind, "time_limit");
    assert.equal(presentation?.showExpectedGot, false);
  });

  it("treats runner unavailable with error as service failure", () => {
    const presentation = classifyTestFailure(
      failed({
        passed: false,
        runnerUnavailable: true,
        error: "Could not reach the code runner.",
        exitCode: 1,
      })
    );
    assert.equal(presentation?.kind, "runner_unavailable");
    assert.equal(presentation?.showExpectedGot, false);
    assert.match(presentation?.detail ?? "", /Could not reach/);
  });

  it("prefers service failure when transport error overlaps timeout", () => {
    const presentation = classifyTestFailure(
      failed({
        passed: false,
        timedOut: true,
        runnerUnavailable: true,
        error: "fetch failed",
        exitCode: 1,
      })
    );
    assert.equal(presentation?.kind, "runner_unavailable");
    assert.equal(presentation?.showExpectedGot, false);
  });

  it("labels nonzero exit as execution error with stderr", () => {
    const presentation = classifyTestFailure(
      failed({
        passed: false,
        exitCode: 1,
        stderr: "ReferenceError: x is not defined",
      })
    );
    assert.equal(presentation?.kind, "execution_error");
    assert.equal(presentation?.showExpectedGot, false);
    assert.match(presentation?.detail ?? "", /ReferenceError/);
  });

  it("labels nonzero exit with generic detail when stderr is empty", () => {
    const presentation = classifyTestFailure(
      failed({ passed: false, exitCode: 1, stderr: "" })
    );
    assert.equal(presentation?.kind, "execution_error");
    assert.match(presentation?.detail ?? "", /exited with an error/);
  });

  it("uses unknown failure when evidence is missing", () => {
    const presentation = classifyTestFailure(
      failed({ passed: false, exitCode: null, timedOut: false })
    );
    assert.equal(presentation?.kind, "unknown");
    assert.equal(presentation?.showExpectedGot, false);
  });
});

describe("runner transport helpers", () => {
  it("detects transport failures only on failed rows", () => {
    const results: TestCaseResult[] = [
      failed({ passed: true, exitCode: 0, runnerUnavailable: true, error: "ignored" }),
      failed({ passed: false, runnerUnavailable: true, error: "down" }),
    ];
    assert.equal(resultsHaveRunnerTransportFailure(results), true);
  });

  it("detects transport failure on a single run", () => {
    assert.equal(
      executionHasRunnerTransportFailure({
        runnerUnavailable: true,
        error: "network",
      }),
      true
    );
    assert.equal(
      executionHasRunnerTransportFailure({ runnerUnavailable: true }),
      false
    );
  });
});
