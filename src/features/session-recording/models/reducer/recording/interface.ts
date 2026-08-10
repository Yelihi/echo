import type { CapturedAudio } from "@/shared/lib/audio";
import type { RecordingSessionErrorCode } from "@/features/session-recording/models/interface";

export type RecordingSessionState =
  | { readonly status: "idle" }
  | { readonly status: "recording"; readonly startedAtMs: number }
  | { readonly status: "recorded"; readonly audio: CapturedAudio }
  | { readonly status: "discarded"; readonly reason: "too-short" }
  | { readonly status: "failed"; readonly errorCode: RecordingSessionErrorCode };

export type RecordingSessionAction =
  | { readonly type: "start"; readonly startedAtMs: number }
  | { readonly type: "record"; readonly audio: CapturedAudio }
  | { readonly type: "discard-too-short" }
  | { readonly type: "reset" }
  | { readonly type: "fail"; readonly errorCode: RecordingSessionErrorCode };
