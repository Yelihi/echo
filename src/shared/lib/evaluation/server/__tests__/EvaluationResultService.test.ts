import { describe, expect, it } from "@jest/globals";

import { EvaluationResultService } from "@/shared/lib/evaluation/server/EvaluationResultService";
import type { EvaluationProviderRegistry } from "@/shared/lib/evaluation/types";

describe("EvaluationResultService", () => {
  it("composes provider diff and feedback into EvaluationResultV1", async () => {
    const service = new EvaluationResultService(createRegistry());

    const result = await service.evaluate({
      practiceType: "roleplay",
      mode: "exact",
      expected: { text: "I would like a window seat." },
      transcript: "I want a window seat.",
    });

    expect(result).toEqual({
      schema_version: "v1",
      transcript: "I want a window seat.",
      diff: [{ op: "replace", expected: "would like", actual: "want" }],
      feedback: "Use the more polite phrase from the script.",
      score: 82,
    });
  });
});

function createRegistry(): EvaluationProviderRegistry {
  return {
    resolve: () => ({
      diffProvider: {
        createDiff: async () => [{ op: "replace", expected: "would like", actual: "want" }],
      },
      evaluationProvider: {
        evaluate: async () => ({
          provider: "openai",
          model: "test-model",
          feedback: "Use the more polite phrase from the script.",
          score: 82,
        }),
      },
    }),
  };
}
