import { describe, expect, it } from "@jest/globals";

import { ExactDiffProvider } from "@/shared/lib/evaluation/server/ExactDiffProvider";

describe("ExactDiffProvider", () => {
  it("creates stable phrase-like replacement segments", async () => {
    const provider = new ExactDiffProvider();

    const diff = await provider.createDiff({
      practiceType: "roleplay",
      mode: "exact",
      expected: { text: "I would like a window seat." },
      transcript: "I want a window seat.",
    });

    expect(diff).toEqual([
      { op: "equal", expected: "I", actual: "I" },
      { op: "replace", expected: "would like", actual: "want" },
      { op: "equal", expected: "a window seat.", actual: "a window seat." },
    ]);
  });

  it("marks inserted and deleted text", async () => {
    const provider = new ExactDiffProvider();

    await expect(
      provider.createDiff({
        practiceType: "memorization",
        mode: "exact",
        expected: { text: "Practice every day." },
        transcript: "Practice.",
      }),
    ).resolves.toEqual([
      { op: "equal", expected: "Practice.", actual: "Practice." },
      { op: "delete", expected: "every day." },
    ]);
  });
});
