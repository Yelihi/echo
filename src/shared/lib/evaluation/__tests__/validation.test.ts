import { describe, expect, it } from "@jest/globals";

import { UnsupportedEvaluationModeError } from "@/shared/lib/evaluation/errors";
import { assertSupportedEvaluationRequest } from "@/shared/lib/evaluation/validation";

describe("assertSupportedEvaluationRequest", () => {
  it("allows roleplay exact, roleplay context, and memorization exact", () => {
    expect(() =>
      assertSupportedEvaluationRequest({ practiceType: "roleplay", mode: "exact" }),
    ).not.toThrow();
    expect(() =>
      assertSupportedEvaluationRequest({ practiceType: "roleplay", mode: "context" }),
    ).not.toThrow();
    expect(() =>
      assertSupportedEvaluationRequest({ practiceType: "memorization", mode: "exact" }),
    ).not.toThrow();
  });

  it("rejects memorization context until it is exposed to users", () => {
    expect(() =>
      assertSupportedEvaluationRequest({ practiceType: "memorization", mode: "context" }),
    ).toThrow(UnsupportedEvaluationModeError);
  });
});
