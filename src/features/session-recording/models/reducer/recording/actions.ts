import type { CapturedAudio } from "@/shared/lib/audio";
import type { RecordingSessionErrorCode } from "@/features/session-recording/models/interface";
import type { RecordingSessionAction } from "@/features/session-recording/models/reducer/recording/interface";

export const startRecording = (startedAtMs: number): RecordingSessionAction => ({
  type: "start",
  startedAtMs,
});

export const recordAudio = (audio: CapturedAudio): RecordingSessionAction => ({
  type: "record",
  audio,
});

export const discardTooShort = (): RecordingSessionAction => ({ type: "discard-too-short" });

export const resetRecording = (): RecordingSessionAction => ({ type: "reset" });

export const failRecording = (errorCode: RecordingSessionErrorCode): RecordingSessionAction => ({
  type: "fail",
  errorCode,
});
