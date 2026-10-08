"use client";

import type { SentenceAnalysis } from "@/entities/grammar-note";
import { AnalysisEditorProvider } from "./AnalysisEditorProvider";
import { AnalysisSentence } from "./AnalysisSentence";
import { AnalysisReading } from "./AnalysisReading";
import { AnalysisKeyboardBoundary } from "./AnalysisKeyboardBoundary";

// 읽기 화면은 선택 상태만 사용하며 분석을 변경하는 컨트롤을 제공하지 않는다.
const preserveAnalysis = () => undefined;

export function GrammarAnalysisReader({ analysis }: { analysis: SentenceAnalysis }) {
  return (
    <AnalysisEditorProvider initialAnalysis={analysis} onChange={preserveAnalysis}>
      <AnalysisKeyboardBoundary>
        <h2 className="mb-6 text-xl font-medium text-practice-ink">문장 읽기</h2>
        <AnalysisSentence />
        <AnalysisReading />
      </AnalysisKeyboardBoundary>
    </AnalysisEditorProvider>
  );
}
