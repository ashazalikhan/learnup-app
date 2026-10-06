"use client";

import { useEffect } from "react";
import { recordLessonOpen } from "@/app/actions/classroom";

export function RecordLessonOpen({ lessonKey }: { lessonKey: string }) {
  useEffect(() => {
    void recordLessonOpen(lessonKey).then((result) => {
      if (!result.ok) {
        console.warn("lesson open not recorded", lessonKey);
      }
    });
  }, [lessonKey]);

  return null;
}
