import { describe, expect, it, jest } from "@jest/globals";

import { chooseSupportedAudioFormat } from "@/shared/lib/audio";

describe("chooseSupportedAudioFormat", () => {
  it("selects opus webm before other supported formats", () => {
    const isTypeSupported = jest.fn((mimeType: string) =>
      ["audio/webm;codecs=opus", "audio/mp4"].includes(mimeType),
    );

    expect(chooseSupportedAudioFormat(isTypeSupported)).toEqual({
      mimeType: "audio/webm;codecs=opus",
      extension: "webm",
    });
  });

  it("falls back to mp4 when webm is not supported", () => {
    const isTypeSupported = jest.fn((mimeType: string) => mimeType === "audio/mp4");

    expect(chooseSupportedAudioFormat(isTypeSupported)).toEqual({
      mimeType: "audio/mp4",
      extension: "mp4",
    });
  });

  it("returns null when no configured format is supported", () => {
    expect(chooseSupportedAudioFormat(() => false)).toBeNull();
  });
});
