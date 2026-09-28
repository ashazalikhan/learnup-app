/** Lesson JSON stores newlines as literal backslash-n; convert before run/compare/display. */
export function normalizeFixtureText(text: string): string {
  return text.replace(/\\n/g, "\n");
}
