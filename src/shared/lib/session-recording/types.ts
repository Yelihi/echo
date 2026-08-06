import type { CapturedAudio } from "@/shared/lib/audio";

export type RecordingSessionState =
  | { readonly status: "idle" }
  | { readonly status: "recording"; readonly startedAtMs: number }
  | { readonly status: "recorded"; readonly audio: CapturedAudio }
  | { readonly status: "discarded"; readonly reason: "too-short" }
  | { readonly status: "saving"; readonly audio: CapturedAudio }
  | { readonly status: "failed"; readonly message: string };

export type RecordingSessionAction =
  | { readonly type: "start"; readonly startedAtMs: number }
  | { readonly type: "record"; readonly audio: CapturedAudio }
  | { readonly type: "discard-too-short" }
  | { readonly type: "retry" }
  | { readonly type: "save" }
  | { readonly type: "saved" }
  | { readonly type: "fail"; readonly message: string };
