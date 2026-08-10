import { describe, expect, it } from "@jest/globals";

import { formatRecordingDuration } from "@/shared/lib/recording/formatRecordingDuration";

describe("formatRecordingDuration", () => {
  it("formats milliseconds as mm:ss", () => {
    expect(formatRecordingDuration(0)).toBe("00:00");
    expect(formatRecordingDuration(12000)).toBe("00:12");
    expect(formatRecordingDuration(61000)).toBe("01:01");
  });
});
