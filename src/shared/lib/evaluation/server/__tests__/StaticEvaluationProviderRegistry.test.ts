import { describe, expect, it } from "@jest/globals";

import { UnsupportedEvaluationModeError } from "@/shared/lib/evaluation/errors";
import type { EvaluationProviderEntry } from "@/shared/lib/evaluation/types";
import { StaticEvaluationProviderRegistry } from "@/shared/lib/evaluation/server/StaticEvaluationProviderRegistry";

describe("StaticEvaluationProviderRegistry", () => {
  it("resolves a supported provider entry", () => {
    const entry = createEntry();
    const registry = new StaticEvaluationProviderRegistry([
      { practiceType: "roleplay", mode: "exact", entry },
    ]);

    expect(registry.resolve({ practiceType: "roleplay", mode: "exact" })).toBe(entry);
  });

  it("rejects an unsupported practice and mode combination", () => {
    const registry = new StaticEvaluationProviderRegistry([
      { practiceType: "memorization", mode: "exact", entry: createEntry() },
    ]);

    expect(() => registry.resolve({ practiceType: "memorization", mode: "context" })).toThrow(
      UnsupportedEvaluationModeError,
    );
  });
});

function createEntry(): EvaluationProviderEntry {
  return {
    diffProvider: {
      createDiff: async () => [],
    },
    evaluationProvider: {
      evaluate: async () => ({
        provider: "openai",
        model: "test-model",
        feedback: "feedback",
      }),
    },
  };
}
