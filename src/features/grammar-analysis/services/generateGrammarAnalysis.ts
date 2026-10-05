import { grammarNoteContentSchema } from "@/entities/grammar-note";
import type { GrammarSource } from "@/entities/grammar-note";
import { GrammarAnalysisError } from "../models/errors";
import type { GrammarAnalysisDependencies, GrammarAnalysisOutput } from "../models/interface";
import { analysisOutputSchema } from "../models/providerSchema";
import { consumeGrammarAnalysisRequest } from "./consumeGrammarAnalysisRequest";

export async function generateGrammarAnalysis(
  source: GrammarSource,
  dependencies: GrammarAnalysisDependencies,
): Promise<GrammarAnalysisOutput> {
  await consumeGrammarAnalysisRequest(dependencies);
  // 1. 공급자 DTO의 형태를 검사하고 AI가 원문·revision·검토 상태를 덮어쓰지 못하게 한다.
  const generated = analysisOutputSchema.safeParse(await dependencies.provider.analyze(source));
  if (!generated.success) throw new GrammarAnalysisError("INVALID_OUTPUT");
  const { title, tags, grammarKey, ...analysis } = generated.data;
  // 2. 서버가 원문 기준 값을 부여한 후 메타데이터와 구간·계층 등 도메인 규칙을 검사한다.
  const content = grammarNoteContentSchema.safeParse({
    source,
    metadata: { source: "ai", sourceRevision: source.revision, title, tags, grammarKey },
    analysis: {
      ...analysis,
      sourceText: source.sentence,
      sourceRevision: source.revision,
      reviewStatus: "needs-review",
    },
    examples: [],
  });
  if (!content.success) throw new GrammarAnalysisError("INVALID_OUTPUT");
  return { metadata: content.data.metadata, analysis: content.data.analysis };
}
