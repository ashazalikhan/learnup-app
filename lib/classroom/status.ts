export type LessonCellStatus = "passed" | "submitted" | "opened" | "not_started";

export interface LessonStatusInput {
  completedKeys: Set<string>;
  passedAttemptKeys: Set<string>;
  anyAttemptKeys: Set<string>;
  anyProgressKeys: Set<string>;
  openedKeys: Set<string>;
}

export function lessonCellStatus(
  lessonKey: string,
  input: LessonStatusInput
): LessonCellStatus {
  if (input.completedKeys.has(lessonKey) || input.passedAttemptKeys.has(lessonKey)) {
    return "passed";
  }
  if (input.anyAttemptKeys.has(lessonKey) || input.anyProgressKeys.has(lessonKey)) {
    return "submitted";
  }
  if (input.openedKeys.has(lessonKey)) {
    return "opened";
  }
  return "not_started";
}

export function statusLabel(status: LessonCellStatus): string {
  switch (status) {
    case "passed":
      return "Passed";
    case "submitted":
      return "Submitted";
    case "opened":
      return "Opened";
    default:
      return "Not started";
  }
}
