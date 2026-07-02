import { describe, expect, it } from "@jest/globals";

import { evaluationResultV1Schema } from "@/shared/lib/evaluation/schema";

describe("evaluationResultV1Schema", () => {
  it("accepts a normalized v1 evaluation result", () => {
    const result = evaluationResultV1Schema.parse({
      schema_version: "v1",
      transcript: "I want a window seat.",
      diff: [
        { op: "equal", expected: "I", actual: "I" },
        { op: "replace", expected: "would like", actual: "want" },
        { op: "equal", expected: "a window seat.", actual: "a window seat." },
      ],
      feedback: "Good meaning, but use the more polite phrase from the script.",
      score: 82,
    });

    expect(result.schema_version).toBe("v1");
    expect(result.diff).toHaveLength(3);
  });

  it("rejects a diff segment without any expected or actual text", () => {
    expect(() =>
      evaluationResultV1Schema.parse({
        schema_version: "v1",
        transcript: "I want a window seat.",
        diff: [{ op: "replace" }],
        feedback: "Missing segment text.",
      }),
    ).toThrow();
  });
});
