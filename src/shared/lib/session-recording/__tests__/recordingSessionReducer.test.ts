import { describe, expect, it } from "@jest/globals";

import {
  MIN_RECORDING_DURATION_MS,
  recordingSessionReducer,
} from "@/shared/lib/session-recording/recordingSessionReducer";
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

  it("moves a valid recording through save and back to idle", () => {
    const recorded = recordingSessionReducer(
      { status: "recording", startedAtMs: 0 },
      { type: "record", audio: audio(MIN_RECORDING_DURATION_MS) },
    );
    const saving = recordingSessionReducer(recorded, { type: "save" });

    expect(recorded.status).toBe("recorded");
    expect(saving.status).toBe("saving");
    expect(recordingSessionReducer(saving, { type: "saved" })).toEqual({ status: "idle" });
  });
});
