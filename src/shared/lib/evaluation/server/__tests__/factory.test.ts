import { describe, expect, it, jest } from "@jest/globals";

import { UnsupportedEvaluationModeError } from "@/shared/lib/evaluation/errors";
import { createEvaluationResultService } from "@/shared/lib/evaluation/server/factory";

jest.mock("server-only", () => ({}));

describe("createEvaluationResultService", () => {
  it("wires supported combinations and rejects memorization context", async () => {
    const parse = jest.fn(async () => ({
      output_parsed: {
        feedback: "The learner preserved the intent.",
        score: 90,
      },
    }));
    const service = createEvaluationResultService({
      client: {
        responses: {
          parse,
        },
      },
      model: "test-model",
    });

    await expect(
      service.evaluate({
        practiceType: "roleplay",
        mode: "exact",
        expected: { text: "I would like a window seat." },
        transcript: "I want a window seat.",
      }),
    ).resolves.toMatchObject({
      schema_version: "v1",
      feedback: "The learner preserved the intent.",
    });

    await expect(
      service.evaluate({
        practiceType: "memorization",
        mode: "context",
        expected: { text: "Practice every day." },
        transcript: "Practice daily.",
      }),
    ).rejects.toBeInstanceOf(UnsupportedEvaluationModeError);
  });
});
