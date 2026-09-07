import type { SupportedLanguage } from "@/lib/lessons/types";

export interface ExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number | null;
  timedOut: boolean;
  runnerUnavailable?: boolean;
  error?: string;
}

export interface TestCaseResult {
  index: number;
  passed: boolean;
  expectedStdout: string;
  actualStdout: string;
  stderr: string;
  timedOut: boolean;
  runnerUnavailable?: boolean;
  error?: string;
}

export interface TestRunResult {
  results: TestCaseResult[];
  allPassed: boolean;
  runnerUnavailable?: boolean;
  error?: string;
}

export interface SubmitResult extends TestRunResult {
  passed: boolean;
  saved: boolean;
  message?: string;
}

export interface ExecuteParams {
  source: string;
  language: SupportedLanguage;
  stdin: string;
  timeoutMs?: number;
}
