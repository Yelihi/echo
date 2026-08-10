import { MIN_RECORDING_DURATION_MS } from "@/features/session-recording/config/const";
import type {
  RecordingSessionAction,
  RecordingSessionState,
} from "@/features/session-recording/models/reducer/recording/interface";

export function recordingSessionReducer(
  state: RecordingSessionState,
  action: RecordingSessionAction,
): RecordingSessionState {
  switch (action.type) {
    case "start":
      return { status: "recording", startedAtMs: action.startedAtMs };
    case "record":
      return action.audio.durationMs < MIN_RECORDING_DURATION_MS
        ? { status: "discarded", reason: "too-short" }
        : { status: "recorded", audio: action.audio };
    case "discard-too-short":
      return { status: "discarded", reason: "too-short" };
    case "reset":
      return { status: "idle" };
    case "fail":
      return { status: "failed", errorCode: action.errorCode };
  }
}
