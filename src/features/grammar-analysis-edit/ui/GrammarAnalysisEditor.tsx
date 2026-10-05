import type { AnalysisEditorProps } from "../models/interface";
import { AnalysisEditorProvider } from "./AnalysisEditorProvider";
import { AnalysisSentence } from "./AnalysisSentence";
import { AnalysisToolbar } from "./AnalysisToolbar";
import { AnalysisBody } from "./AnalysisBody";
import { AnalysisKeyboardBoundary } from "./AnalysisKeyboardBoundary";
import { AnalysisExitConfirmation } from "./AnalysisExitConfirmation";

export function GrammarAnalysisEditor(props: AnalysisEditorProps) {
  return (
    <AnalysisEditorProvider {...props}>
      <AnalysisKeyboardBoundary>
        <AnalysisToolbar />
        <AnalysisSentence />
        <AnalysisBody />
        <AnalysisExitConfirmation />
      </AnalysisKeyboardBoundary>
    </AnalysisEditorProvider>
  );
}
