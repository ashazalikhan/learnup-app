"use client";

import { useEffect, useRef } from "react";
import { recordLessonOpen } from "@/app/actions/classroom";

export function RecordLessonOpen({ lessonKey }: { lessonKey: string }) {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    void recordLessonOpen(lessonKey);
  }, [lessonKey]);

  return null;
}
