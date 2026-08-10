import { describe, expect, it } from "@jest/globals";

import { MIN_RECORDING_DURATION_MS, recordingSessionReducer } from "@/features/session-recording";
import type { CapturedAudio } from "@/shared/lib/audio";

const audio = (durationMs: number): CapturedAudio => ({
  blob: new Blob(["audio"]),
  durationMs,
  extension: "webm",
  mimeType: "audio/webm",
});

describe("recordingSessionReducer", () => {
  it("keeps recordings shorter than the minimum out of recorded state", () => {
    const state = recordingSessionReducer(
      { status: "recording", startedAtMs: 0 },
      { type: "record", audio: audio(MIN_RECORDING_DURATION_MS - 1) },
    );

    expect(state).toEqual({ status: "discarded", reason: "too-short" });
  });

  it("keeps valid recordings in recorded state", () => {
    const capturedAudio = audio(MIN_RECORDING_DURATION_MS);
    const recorded = recordingSessionReducer(
      { status: "recording", startedAtMs: 0 },
      { type: "record", audio: capturedAudio },
    );

    expect(recorded).toEqual({ status: "recorded", audio: capturedAudio });
  });

  it("stores failure codes without captured audio", () => {
    expect(
      recordingSessionReducer(
        { status: "recorded", audio: audio(MIN_RECORDING_DURATION_MS) },
        { type: "fail", errorCode: "permission-denied" },
      ),
    ).toEqual({
      status: "failed",
      errorCode: "permission-denied",
    });
  });
});
