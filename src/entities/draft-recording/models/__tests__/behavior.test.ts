import { describe, expect, it } from "@jest/globals";

import {
  MIN_DRAFT_RECORDING_DURATION_MS,
  validateCapturedAudioForDraftRecording,
} from "@/entities/draft-recording";
import type { CapturedAudio } from "@/shared/lib/audio";

describe("validateCapturedAudioForDraftRecording", () => {
  it("accepts captured audio that satisfies the minimum duration", () => {
    const audio = createCapturedAudio({ durationMs: MIN_DRAFT_RECORDING_DURATION_MS });

    expect(validateCapturedAudioForDraftRecording(audio)).toEqual({
      status: "valid",
      audio,
    });
  });

  it("rejects captured audio shorter than the minimum duration", () => {
    const audio = createCapturedAudio({ durationMs: MIN_DRAFT_RECORDING_DURATION_MS - 1 });

    expect(validateCapturedAudioForDraftRecording(audio)).toEqual({
      status: "rejected",
      reason: "too-short",
      minimumDurationMs: MIN_DRAFT_RECORDING_DURATION_MS,
      actualDurationMs: MIN_DRAFT_RECORDING_DURATION_MS - 1,
    });
  });
});

function createCapturedAudio(overrides: Partial<CapturedAudio> = {}): CapturedAudio {
  return {
    blob: new Blob(["audio"], { type: "audio/webm;codecs=opus" }),
    mimeType: "audio/webm;codecs=opus",
    extension: "webm",
    durationMs: 1000,
    ...overrides,
  };
}
