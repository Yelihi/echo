import type {
  RecordingSessionAction,
  RecordingSessionState,
} from "@/shared/lib/session-recording/types";

export const MIN_RECORDING_DURATION_MS = 800;

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
    case "retry":
    case "saved":
      return { status: "idle" };
    case "save":
      return state.status === "recorded" ? { status: "saving", audio: state.audio } : state;
    case "fail": {
      const audio =
        action.audio ??
        (state.status === "recorded" || state.status === "saving" ? state.audio : undefined);

      return audio
        ? { status: "failed", message: action.message, audio }
        : { status: "failed", message: action.message };
    }
  }
}
