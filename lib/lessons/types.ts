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

export interface Lesson {
  key: string;
  title: string;
  path: string;
  slug: string;
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
