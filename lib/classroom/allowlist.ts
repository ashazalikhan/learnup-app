/** Placeholder Arrays content, not the weekly MUJ DSA/DAA curriculum. */
export const ARRAYS_LESSON_ALLOWLIST: readonly string[] = [
  "arrays/what-is-an-array",
  "arrays/indexing",
  "arrays/traversal",
  "arrays/sum",
  "arrays/find-max",
  "arrays/linear-search",
  "arrays/update-in-place",
  "arrays/reverse-an-array",
  "arrays/two-pointer-swap",
  "arrays/capstone-second-largest",
];

export function arraysAllowlistMatches(keys: string[]): boolean {
  if (keys.length !== ARRAYS_LESSON_ALLOWLIST.length) return false;
  return keys.every((key, i) => key === ARRAYS_LESSON_ALLOWLIST[i]);
}
