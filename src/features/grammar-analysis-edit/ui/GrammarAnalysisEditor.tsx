"use client";

import { useRef } from "react";
import type { AnalysisEditorProps } from "../models/interface";
import { AnalysisEditorProvider, useAnalysisEditor } from "./AnalysisEditorProvider";
import { AnalysisSentence } from "./AnalysisSentence";
import { AnalysisReading } from "./AnalysisReading";
import { AnalysisToolbar } from "./AnalysisToolbar";
import { AnalysisInspector } from "./AnalysisInspector";
import { AnalysisExitConfirmation } from "./AnalysisExitConfirmation";

function AnalysisContent() {
  const editing = useAnalysisEditor((state) => state.editing);
  const finishEditing = useAnalysisEditor((state) => state.finishEditing);
  const select = useAnalysisEditor((state) => state.select);
  const root = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={root}
      className="rounded-2xl border border-practice-line bg-white p-5 shadow-practice-panel sm:p-9"
      onKeyDown={(event) => {
        if (event.key !== "Escape" || event.defaultPrevented) return;
        // Radix owns Escape inside the confirmation dialog, including its focus trap.
        if (event.target instanceof Element && event.target.closest('[role="alertdialog"]')) return;
        event.preventDefault();
        if (editing) {
          root.current?.querySelector<HTMLButtonElement>("[data-analysis-action]")?.focus();
          finishEditing();
        } else {
          root.current
            ?.querySelector<HTMLButtonElement>('[data-chunk-id][aria-pressed="true"]')
            ?.focus();
          select(null);
        }
      }}
    >
      <AnalysisToolbar />
      <AnalysisSentence />
      {editing ? <AnalysisInspector /> : <AnalysisReading />}
      <AnalysisExitConfirmation />
    </div>
  );
}

export function GrammarAnalysisEditor(props: AnalysisEditorProps) {
  return (
    <AnalysisEditorProvider {...props}>
      <AnalysisContent />
    </AnalysisEditorProvider>
  );
}
