import { GrammarAnalysisError } from "../models/errors";
import type { GrammarAnalysisDependencies } from "../models/interface";

/** 각 AI 호출 직전에 권한과 한도를 확인한다. 단계가 늘어나도 호출 단위로 비용을 제한한다. */
export async function consumeGrammarAnalysisRequest(
  dependencies: GrammarAnalysisDependencies,
): Promise<void> {
  const permission = await dependencies.consumeRequest();
  if (permission === "not_invited") throw new GrammarAnalysisError("NOT_INVITED");
  if (permission !== "allowed") throw new GrammarAnalysisError("RATE_LIMITED");
}
