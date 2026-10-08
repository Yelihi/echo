import { grammarSourceSchema } from "@/entities/grammar-note";
import type { GrammarSource } from "@/entities/grammar-note";
import { GrammarAnalysisError } from "../models/errors";

/** 필수 입력과 revision을 검증한다. 원문을 정규화하지 않아 분석 구간의 기준을 보존한다. */
export function parseGrammarSource(input: unknown): GrammarSource {
  const parsed = grammarSourceSchema.safeParse(input);
  if (!parsed.success) throw new GrammarAnalysisError("INVALID_INPUT");
  return parsed.data;
}
