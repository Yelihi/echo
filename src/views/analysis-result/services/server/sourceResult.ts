import type {
  AnalysisResultSourceResultDto,
  PracticeTargetAnalysisResult,
} from "@/entities/analysis-job";
import { evaluationResultV1Schema } from "@/shared/lib/evaluation/schema";

export function mapSourceResults(
  results: ReadonlyArray<PracticeTargetAnalysisResult>,
): AnalysisResultSourceResultDto[] {
  return results.map(mapSourceResult).filter(isAnalysisResultSourceResultDto);
}

function mapSourceResult(
  result: PracticeTargetAnalysisResult,
): AnalysisResultSourceResultDto | null {
  const parsed = evaluationResultV1Schema.safeParse({
    ...result.feedback,
    transcript: result.transcript,
  });

  if (!parsed.success) {
    return null;
  }

  return {
    schemaVersion: "v1",
    target: result.target,
    transcript: parsed.data.transcript,
    diff: parsed.data.diff,
    feedback: parsed.data.feedback,
  };
}

function isAnalysisResultSourceResultDto(
  result: AnalysisResultSourceResultDto | null,
): result is AnalysisResultSourceResultDto {
  return result !== null;
}
