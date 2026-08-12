import type { AudioCaptureErrorCode, AudioCaptureOptions, CapturedAudio } from "@/shared/lib/audio";
import type { RecordingSessionState } from "@/features/session-recording/models/reducer/recording/interface";

export type RecordingSessionErrorCode = AudioCaptureErrorCode | "unknown";

export interface UseRecordingSessionOptions {
  readonly audioCaptureOptions?: AudioCaptureOptions;
  readonly now?: () => number;
}

export interface UseRecordingSessionResult {
  readonly state: RecordingSessionState;
  readonly minDurationMs: number;
  readonly start: () => Promise<void>;
  readonly stop: () => Promise<void>;
  readonly cancel: () => void;
  readonly retry: () => void;
  readonly fail: (errorCode: RecordingSessionErrorCode) => void;
  readonly recordedAudio: CapturedAudio | null;
}
