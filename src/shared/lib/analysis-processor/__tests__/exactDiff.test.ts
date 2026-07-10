import { describe, expect, it } from "@jest/globals";

import { createExactDiff } from "@/shared/lib/analysis-processor/exactDiff";

describe("createExactDiff", () => {
  it("groups inserted and deleted neighboring words as a replace segment", () => {
    expect(createExactDiff("I like coffee", "I love tea")).toEqual([
      { op: "equal", expected: "I", actual: "I" },
      { op: "replace", expected: "like coffee", actual: "love tea" },
    ]);
  });
});
