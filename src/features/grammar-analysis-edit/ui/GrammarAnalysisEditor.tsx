"use client";

import type { AnalysisEditorProps } from "../models/interface";
import { AnalysisEditorProvider } from "./AnalysisEditorProvider";
import { AnalysisSentence } from "./AnalysisSentence";
import { AnalysisInspector } from "./AnalysisInspector";

export function GrammarAnalysisEditor(props: AnalysisEditorProps) {
  return (
    <AnalysisEditorProvider {...props}>
      <div className="rounded-xl border border-practice-input-line bg-white p-5 sm:p-8">
        <AnalysisSentence />
        <AnalysisInspector />
      </div>
    </AnalysisEditorProvider>
  );
}
