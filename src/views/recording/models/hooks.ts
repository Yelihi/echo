import type { CapturedAudio } from "@/shared/lib/audio";
import type { RecordingPhase } from "./interface";
import type { RecordingSessionBaseStore } from "./stores/createRecordingSessionStore";
export interface UsePartnerAudioPlaybackInput {
  readonly phase: RecordingPhase;
  readonly sessionId?: string;
  readonly partnerLine?: string;
  readonly autoAdvancePartner: boolean;
  readonly loadPartnerAudio?: () => Promise<Blob | null>;
  readonly onSucceeded: () => void;
  readonly onFailed: () => void;
}
export interface UseRecordingTurnInput {
  store: RecordingSessionBaseStore;
  demoDurationMs: number;
  totalSteps: number;
  nextPhase: RecordingPhase;
  saveRecording?: (audio: CapturedAudio) => Promise<void>;
}
