import { sentenceAnalysisSchema } from "@/entities/grammar-note";
import type { SentenceAnalysis } from "@/entities/grammar-note";
import type { AnalysisEditResult } from "../models/editAnalysis";

/** 모든 편집 후보에 같은 도메인 규칙을 적용하고 재검토 상태로 돌린다. */
export function validateAnalysisCandidate(candidate: SentenceAnalysis): AnalysisEditResult {
  const parsed = sentenceAnalysisSchema.safeParse({ ...candidate, reviewStatus: "needs-review" });
  return parsed.success
    ? { ok: true, analysis: parsed.data }
    : { ok: false, message: parsed.error.issues[0].message };
}
