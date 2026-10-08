import type { GrammarAnalysisDependencies, GrammarAnalysisResult } from "../models/interface";
import { parseGrammarSource } from "./parseGrammarSource";
import { precheckGrammarSource } from "./precheckGrammarSource";
import { generateGrammarAnalysis } from "./generateGrammarAnalysis";

/** 검증을 마친 단계 결과만 연결한다. 예외의 로깅과 UI 오류 변환은 server action 경계가 담당한다. */
export async function analyzeGrammar(
  input: unknown,
  dependencies: GrammarAnalysisDependencies,
): Promise<Exclude<GrammarAnalysisResult, { status: "error" }>> {
  const source = parseGrammarSource(input);
  const precheck = await precheckGrammarSource(source, dependencies);
  if (precheck.status !== "passed") return { status: "needs-input", precheck };

  const data = await generateGrammarAnalysis(source, dependencies);
  return { status: "analyzed", data };
}
