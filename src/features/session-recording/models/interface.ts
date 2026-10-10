import type { AudioCaptureErrorCode, AudioCaptureOptions, CapturedAudio } from "@/shared/lib/audio";
import type { RecordingSessionState } from "@/features/session-recording/models/reducer/recording/interface";
import type { RecordOperationEvent } from "@/shared/lib/logging/models";

export type RecordingSessionErrorCode = AudioCaptureErrorCode | "unknown";

export interface UseRecordingSessionOptions {
  readonly audioCaptureOptions?: AudioCaptureOptions;
  readonly now?: () => number;
  readonly maxDurationMs?: number;
  readonly recordEvent?: RecordOperationEvent;
}

export interface UseRecordingSessionResult {
  readonly state: RecordingSessionState;
  readonly minDurationMs: number;
  readonly start: () => Promise<"started" | "failed" | "canceled">;
  readonly stop: () => Promise<"recorded" | "discarded" | "failed" | "canceled">;
  readonly elapsedMs: number;
  readonly cancel: () => void;
  readonly retry: () => void;
  readonly fail: (errorCode: RecordingSessionErrorCode) => void;
  readonly recordedAudio: CapturedAudio | null;
}
