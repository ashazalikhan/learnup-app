export type LessonKind = "concept" | "fill" | "mcq" | "code";

export type SupportedLanguage = "javascript" | "python" | "c" | "cpp" | "java";

export interface LessonExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface LessonFixture {
  stdin: string;
  expectedStdout: string;
}

export interface PathCluster {
  id: string;
  label: string;
}

export interface PathLessonRef {
  slug: string;
  title: string;
  xp: number;
  cluster: string;
}

export interface Path {
  id: string;
  title: string;
  description: string;
  unitLabel: string;
  clusters: PathCluster[];
  lessons: PathLessonRef[];
}

export interface CurriculumLesson {
  kind: LessonKind;
  key: string;
  path: string;
  slug: string;
  title: string;
  xp: number;
  cluster: string;
  statement: string;
  ioRules: string;
  examples: LessonExample[];
  fixtures: LessonFixture[];
  starters: Record<SupportedLanguage, string>;
}

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  "javascript",
  "python",
  "c",
  "cpp",
  "java",
];

export const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  javascript: "JavaScript",
  python: "Python",
  c: "C",
  cpp: "C++",
  java: "Java",
};
