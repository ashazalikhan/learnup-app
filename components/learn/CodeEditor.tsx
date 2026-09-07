"use client";

import { useEffect, useRef } from "react";
import { EditorState } from "@codemirror/state";
import {
  EditorView,
  drawSelection,
  highlightActiveLine,
  lineNumbers,
} from "@codemirror/view";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { cpp } from "@codemirror/lang-cpp";
import { java } from "@codemirror/lang-java";
import type { SupportedLanguage } from "@/lib/lessons/types";

function languageExtension(language: SupportedLanguage) {
  switch (language) {
    case "javascript":
      return javascript();
    case "python":
      return python();
    case "c":
    case "cpp":
      return cpp();
    case "java":
      return java();
  }
}

const editorTheme = EditorView.theme(
  {
    "&": {
      height: "100%",
      fontSize: "13px",
      backgroundColor: "var(--surface-secondary)",
      color: "var(--text-primary)",
    },
    ".cm-scroller": {
      fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
      lineHeight: "1.6",
    },
    ".cm-gutters": {
      backgroundColor: "var(--surface-secondary)",
      color: "var(--text-muted)",
      borderRight: "1px solid var(--border)",
    },
    ".cm-activeLine": {
      backgroundColor: "color-mix(in srgb, var(--accent-green) 8%, transparent)",
    },
    ".cm-content": {
      caretColor: "var(--accent-green)",
      minHeight: "100%",
    },
    "&.cm-focused .cm-selectionBackground, .cm-selectionBackground": {
      backgroundColor: "color-mix(in srgb, var(--accent-green) 25%, transparent)",
    },
  },
  { dark: true }
);

function buildExtensions(language: SupportedLanguage, onChange: (value: string) => void) {
  return [
    lineNumbers(),
    drawSelection(),
    highlightActiveLine(),
    editorTheme,
    languageExtension(language),
    EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        onChange(update.state.doc.toString());
      }
    }),
  ];
}

interface CodeEditorProps {
  value: string;
  language: SupportedLanguage;
  onChange: (value: string) => void;
}

export function CodeEditor({ value, language, onChange }: CodeEditorProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  const syncingRef = useRef(false);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!hostRef.current) return;

    const view = new EditorView({
      parent: hostRef.current,
      state: EditorState.create({
        doc: value,
        extensions: buildExtensions(language, (next) => onChangeRef.current(next)),
      }),
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, [language]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view || syncingRef.current) return;

    const current = view.state.doc.toString();
    if (current !== value) {
      syncingRef.current = true;
      view.dispatch({
        changes: { from: 0, to: current.length, insert: value },
      });
      syncingRef.current = false;
    }
  }, [value]);

  return (
    <div
      ref={hostRef}
      className="h-full min-h-[280px] overflow-hidden rounded-xl border-2 border-border"
    />
  );
}
