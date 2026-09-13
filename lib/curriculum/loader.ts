import pathMeta from "@/content/paths/arrays/path.json";
import whatIsAnArray from "@/content/paths/arrays/what-is-an-array.json";
import indexing from "@/content/paths/arrays/indexing.json";
import traversal from "@/content/paths/arrays/traversal.json";
import updateInPlace from "@/content/paths/arrays/update-in-place.json";
import sum from "@/content/paths/arrays/sum.json";
import findMax from "@/content/paths/arrays/find-max.json";
import linearSearch from "@/content/paths/arrays/linear-search.json";
import reverseAnArray from "@/content/paths/arrays/reverse-an-array.json";
import twoPointerSwap from "@/content/paths/arrays/two-pointer-swap.json";
import capstone from "@/content/paths/arrays/capstone-second-largest.json";
import type { CurriculumLesson, Path, PathLessonRef } from "@/lib/curriculum/types";

const LESSON_FILES: Record<string, CurriculumLesson> = {
  "what-is-an-array": whatIsAnArray as CurriculumLesson,
  indexing: indexing as CurriculumLesson,
  traversal: traversal as CurriculumLesson,
  "update-in-place": updateInPlace as CurriculumLesson,
  sum: sum as CurriculumLesson,
  "find-max": findMax as CurriculumLesson,
  "linear-search": linearSearch as CurriculumLesson,
  "reverse-an-array": reverseAnArray as CurriculumLesson,
  "two-pointer-swap": twoPointerSwap as CurriculumLesson,
  "capstone-second-largest": capstone as CurriculumLesson,
};

const PATHS: Record<string, Path> = {
  arrays: pathMeta as Path,
};

export function getPath(pathId: string): Path | null {
  return PATHS[pathId] ?? null;
}

export function getLesson(pathId: string, slug: string): CurriculumLesson | null {
  const path = getPath(pathId);
  if (!path) return null;
  if (!path.lessons.some((lesson) => lesson.slug === slug)) return null;
  return LESSON_FILES[slug] ?? null;
}

export function getLessonByKey(key: string): CurriculumLesson | null {
  const [pathId, slug] = key.split("/");
  if (!pathId || !slug) return null;
  return getLesson(pathId, slug);
}

export function getOrderedLessonKeys(pathId: string): string[] {
  const path = getPath(pathId);
  if (!path) return [];
  return path.lessons.map((lesson) => `${pathId}/${lesson.slug}`);
}

export function getLessonRef(pathId: string, slug: string): PathLessonRef | null {
  const path = getPath(pathId);
  if (!path) return null;
  return path.lessons.find((lesson) => lesson.slug === slug) ?? null;
}

export function getNextLesson(
  pathId: string,
  slug: string
): { path: string; slug: string; key: string } | null {
  const path = getPath(pathId);
  if (!path) return null;
  const index = path.lessons.findIndex((lesson) => lesson.slug === slug);
  if (index < 0 || index >= path.lessons.length - 1) return null;
  const next = path.lessons[index + 1];
  return { path: pathId, slug: next.slug, key: `${pathId}/${next.slug}` };
}

export function getPrevLesson(
  pathId: string,
  slug: string
): { path: string; slug: string; key: string } | null {
  const path = getPath(pathId);
  if (!path) return null;
  const index = path.lessons.findIndex((lesson) => lesson.slug === slug);
  if (index <= 0) return null;
  const prev = path.lessons[index - 1];
  return { path: pathId, slug: prev.slug, key: `${pathId}/${prev.slug}` };
}

export function isLessonUnlocked(
  orderedKeys: string[],
  completedKeys: Set<string>,
  lessonKey: string
): boolean {
  const index = orderedKeys.indexOf(lessonKey);
  if (index < 0) return false;
  if (index === 0) return true;
  return completedKeys.has(orderedKeys[index - 1]);
}

export function getCurrentLessonKey(
  orderedKeys: string[],
  completedKeys: Set<string>
): string {
  for (const key of orderedKeys) {
    if (!completedKeys.has(key)) return key;
  }
  return orderedKeys[orderedKeys.length - 1] ?? orderedKeys[0];
}

export function getLessonIndex(pathId: string, slug: string): number {
  const path = getPath(pathId);
  if (!path) return -1;
  return path.lessons.findIndex((lesson) => lesson.slug === slug);
}
