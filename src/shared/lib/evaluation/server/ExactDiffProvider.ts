import { createExactDiff } from "@/shared/lib/analysis-processor/exactDiff";
import type {
  DiffProvider,
  DiffProviderInput,
  EvaluationDiffSegment,
} from "@/shared/lib/evaluation/types";

export class ExactDiffProvider implements DiffProvider {
  async createDiff(input: DiffProviderInput): Promise<ReadonlyArray<EvaluationDiffSegment>> {
    return createExactDiff(input.expected.text, input.transcript);
  }
}
