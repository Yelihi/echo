import type {
  PronunciationAssessmentInput,
  PronunciationAssessmentProvider,
  PronunciationAssessmentResult,
} from "@/shared/lib/pronunciation-assessment/types";

export class NoopPronunciationAssessmentProvider implements PronunciationAssessmentProvider {
  async assess(input: PronunciationAssessmentInput): Promise<PronunciationAssessmentResult> {
    void input;

    return {
      provider: "noop",
      status: "unavailable",
      reason: "mvp_non_goal",
    };
  }
}
