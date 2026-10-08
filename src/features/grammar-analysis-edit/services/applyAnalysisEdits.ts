import type { SentenceAnalysis } from "@/entities/grammar-note";
import type { AnalysisEdit, AnalysisEditResult } from "../models/editAnalysis";
import { EditAnalysisService } from "./EditAnalysisService";

/** 순서대로 검증하되, 실패하면 중간 후보를 외부에 반영하지 않는다. */
export function applyAnalysisEdits(
  analysis: SentenceAnalysis,
  edit: AnalysisEdit | readonly AnalysisEdit[],
): AnalysisEditResult {
  const operations = typeof edit === "function" ? [edit] : edit;
  let candidate = analysis;
  for (const operation of operations) {
    const result = operation(new EditAnalysisService(candidate));
    if (!result.ok) return result;
    candidate = result.analysis;
  }
  return { ok: true, analysis: candidate };
}
