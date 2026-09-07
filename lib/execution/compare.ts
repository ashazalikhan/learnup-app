export function normalizeStdout(stdout: string): string {
  return stdout.trim().replace(/\s+/g, " ");
}

export function compareStdout(actual: string, expected: string): boolean {
  return normalizeStdout(actual) === normalizeStdout(expected);
}
