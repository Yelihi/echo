import type { SessionId } from "@/entities/value-object";
import type { CapturedAudio } from "@/shared/lib/audio";

export interface AcceptDraftRecordingInput {
  readonly sessionId: SessionId;
  readonly practiceTargetId: string;
}

export interface DraftRecordingBehaviorStructure {
  accept: (input: AcceptDraftRecordingInput) => Promise<void>;
}

export const MIN_DRAFT_RECORDING_DURATION_MS = 800;

export type DraftRecordingValidationResult =
  | {
      readonly status: "valid";
      readonly audio: CapturedAudio;
    }
  | {
      readonly status: "rejected";
      readonly reason: "too-short";
      readonly minimumDurationMs: number;
      readonly actualDurationMs: number;
    };

export function validateCapturedAudioForDraftRecording(
  audio: CapturedAudio,
): DraftRecordingValidationResult {
  if (audio.durationMs < MIN_DRAFT_RECORDING_DURATION_MS) {
    return {
      status: "rejected",
      reason: "too-short",
      minimumDurationMs: MIN_DRAFT_RECORDING_DURATION_MS,
      actualDurationMs: audio.durationMs,
    };
  }

  return {
    status: "valid",
    audio,
  };
}
