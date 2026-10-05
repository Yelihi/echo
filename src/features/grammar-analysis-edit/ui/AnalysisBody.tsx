"use client";

import { useAnalysisEditor } from "./AnalysisEditorProvider";
import { AnalysisInspector } from "./AnalysisInspector";
import { AnalysisReading } from "./AnalysisReading";

export function AnalysisBody() {
  const editing = useAnalysisEditor((state) => state.editing);
  return editing ? <AnalysisInspector /> : <AnalysisReading />;
}
