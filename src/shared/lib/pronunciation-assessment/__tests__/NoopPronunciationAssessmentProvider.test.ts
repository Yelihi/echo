import { describe, expect, it } from "@jest/globals";

import { NoopPronunciationAssessmentProvider } from "@/shared/lib/pronunciation-assessment/NoopPronunciationAssessmentProvider";

describe("NoopPronunciationAssessmentProvider", () => {
  it("returns an unavailable result without treating pronunciation as a failure", async () => {
    const provider = new NoopPronunciationAssessmentProvider();

    await expect(
      provider.assess({
        audio: new Uint8Array([1, 2, 3]),
        filename: "recording.webm",
        mimeType: "audio/webm",
      }),
    ).resolves.toEqual({
      provider: "noop",
      status: "unavailable",
      reason: "mvp_non_goal",
    });
  });
});
