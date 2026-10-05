import {
  grammarSourceSchema,
  grammarNoteContentSchema,
  precheckResultSchema,
} from "@/entities/grammar-note";
import { GrammarAnalysisError } from "../models/errors";
import { analysisOutputSchema, precheckOutputSchema } from "../models/providerSchema";
import type { GrammarAnalysisDependencies, GrammarAnalysisResult } from "../models/interface";

/** Rejecting operations are handled and logged once at the server action boundary. */
export async function analyzeGrammar(
  input: unknown,
  dependencies: GrammarAnalysisDependencies,
): Promise<Exclude<GrammarAnalysisResult, { status: "error" }>> {
  const parsed = grammarSourceSchema.safeParse(input);
  if (!parsed.success) throw new GrammarAnalysisError("INVALID_INPUT");
  const source = parsed.data;
  await consume(dependencies);
  const precheck = precheckOutputSchema.safeParse(await dependencies.provider.precheck(source));
  if (!precheck.success) throw new GrammarAnalysisError("INVALID_OUTPUT");
  if (precheck.data.status !== "passed") {
    const checked = precheckResultSchema.safeParse({
      ...precheck.data,
      sourceRevision: source.revision,
    });
    if (!checked.success || checked.data.status === "passed")
      throw new GrammarAnalysisError("INVALID_OUTPUT");
    return { status: "needs-input", precheck: checked.data };
  }
  if (precheck.data.issues.length) throw new GrammarAnalysisError("INVALID_OUTPUT");
  await consume(dependencies);
  const generated = analysisOutputSchema.safeParse(await dependencies.provider.analyze(source));
  if (!generated.success) throw new GrammarAnalysisError("INVALID_OUTPUT");
  const { title, tags, grammarKey, ...analysis } = generated.data;
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
  return {
    status: "analyzed",
    data: { metadata: content.data.metadata, analysis: content.data.analysis },
  };
}

async function consume(dependencies: GrammarAnalysisDependencies) {
  const permission = await dependencies.consumeRequest();
  if (permission === "not_invited") throw new GrammarAnalysisError("NOT_INVITED");
  if (permission !== "allowed") throw new GrammarAnalysisError("RATE_LIMITED");
}
