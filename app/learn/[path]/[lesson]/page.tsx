import { notFound } from "next/navigation";
import { LessonWorkspace } from "@/components/learn/LessonWorkspace";
import { getLesson } from "@/lib/lessons/registry";

interface LearnLessonPageProps {
  params: Promise<{ path: string; lesson: string }>;
}

export default async function LearnLessonPage({ params }: LearnLessonPageProps) {
  const { path, lesson: lessonSlug } = await params;
  const lesson = getLesson(path, lessonSlug);

  if (!lesson) {
    notFound();
  }

  return <LessonWorkspace lesson={lesson} />;
}
