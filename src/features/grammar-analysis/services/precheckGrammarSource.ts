import { precheckResultSchema } from "@/entities/grammar-note";
import type { GrammarSource, PrecheckResult } from "@/entities/grammar-note";
import { invalidGrammarOutput } from "../models/errors";
import type { GrammarAnalysisDependencies } from "../models/interface";
import { precheckOutputSchema } from "../models/schema";
import { consumeGrammarAnalysisRequest } from "./consumeGrammarAnalysisRequest";

export async function precheckGrammarSource(
  source: GrammarSource,
  dependencies: GrammarAnalysisDependencies,
): Promise<PrecheckResult> {
  await consumeGrammarAnalysisRequest(dependencies);
  // 1. 공급자 응답의 형태를 확인한다. sourceRevision은 AI가 지정할 수 없다.
  const parsed = precheckOutputSchema.safeParse(await dependencies.provider.precheck(source));
  if (!parsed.success) throw invalidGrammarOutput("precheck.shape", parsed.error.issues);
  if (parsed.data.status === "passed") {
    // 2. 통과 응답에 수정 사항이 함께 있으면 모순된 결과로 거절한다.
    if (parsed.data.issues.length)
      throw invalidGrammarOutput("precheck.consistency", [
        { code: "unexpected_issues", path: ["issues"] },
      ]);
    return { status: "passed", sourceRevision: source.revision };
  }
  // 3. 입력 보완 응답에는 유효한 안내가 필요하다. 현재 입력의 revision으로 도메인 결과를 만든다.
  const checked = precheckResultSchema.safeParse({
    ...parsed.data,
    sourceRevision: source.revision,
  });
  if (!checked.success) throw invalidGrammarOutput("precheck.content", checked.error.issues);
  return checked.data;
}
