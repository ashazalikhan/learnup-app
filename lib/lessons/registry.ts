import { reverseAnArrayLesson } from "@/lib/lessons/arrays/reverse-an-array";
import type { Lesson } from "@/lib/lessons/types";

const LESSONS: Record<string, Record<string, Lesson>> = {
  arrays: {
    "reverse-an-array": reverseAnArrayLesson,
  },
};

export function getLesson(path: string, lesson: string): Lesson | null {
  return LESSONS[path]?.[lesson] ?? null;
}

export function getLessonByKey(key: string): Lesson | null {
  const [path, slug] = key.split("/");
  if (!path || !slug) return null;
  return getLesson(path, slug);
}
