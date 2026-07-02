import { evaluationResultV1Schema } from "@/shared/lib/evaluation/schema";
import type {
  EvaluationProviderRegistry,
  EvaluationRequest,
  EvaluationResultV1,
} from "@/shared/lib/evaluation/types";

export class EvaluationResultService {
  constructor(private readonly registry: EvaluationProviderRegistry) {}

  async evaluate(input: EvaluationRequest): Promise<EvaluationResultV1> {
    const { diffProvider, evaluationProvider } = this.registry.resolve(input);
    const [diff, evaluation] = await Promise.all([
      diffProvider.createDiff(input),
      evaluationProvider.evaluate(input),
    ]);

    return evaluationResultV1Schema.parse({
      schema_version: "v1",
      transcript: input.transcript,
      diff,
      feedback: evaluation.feedback,
      score: evaluation.score,
    });
  }
}
