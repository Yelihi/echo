import type { RoleplayRecordingTurn } from "@/entities/roleplay-session/models/recordingTurns";
import type { ComponentProps, ReactNode } from "react";
import type { CapturedAudio } from "@/shared/lib/audio";
import type {
  RoleplayReadyMaterial,
  RoleplayReadySettings,
} from "@/features/roleplay-sessions/models/ready";
import type {
  MemorizationReadyMaterial,
  MemorizationReadySettings,
} from "@/features/memorization-sessions/models/ready";
import type { RecordingPhase, RecordingPillar } from "./interface";
import type { RecordingSessionClientConfig } from "./sessionConfig";
export type RecordingPanelContent =
  | { kind: "title"; title: string }
  | {
      kind: "partner";
      role: string;
      line: string;
      canReplay: boolean;
      onReplay: () => void;
    };
export interface RecordingPanelProps {
  content: RecordingPanelContent;
  phase: RecordingPhase;
  durationLabel: string;
  message: string;
  saving?: boolean;
  recordedAudio?: CapturedAudio | null;
  actions: {
    toggle: () => void;
    retry: () => void;
    save: () => void;
  };
}
export interface RecordingReadyPanelProps {
  content: RecordingSessionClientConfig["ready"];
  onStart: () => void;
}
export interface RecordingSessionViewProps {
  pillar: RecordingPillar;
  children: ReactNode;
}
export interface SessionTopBarProps {
  backHref: string;
  close: boolean;
  current: number;
  total: number;
  hasUnsavedRecording?: boolean;
  saving?: boolean;
  resumable?: boolean;
}
export interface MemorizationRecordingClientProps {
  config: RecordingSessionClientConfig;
  saveRecording?: (audio: CapturedAudio) => Promise<void>;
}
export interface MemorizationRecordingViewProps {
  material: MemorizationReadyMaterial;
  settings?: MemorizationReadySettings;
  initialPhase?: RecordingPhase;
  saveRecording?: (audio: CapturedAudio) => Promise<void>;
}
export interface RolePlayRecordingClientProps {
  config: RecordingSessionClientConfig;
  partner: {
    role?: string;
    line?: string;
    turns?: readonly RoleplayRecordingTurn[];
    sessionId?: string;
    autoAdvance: boolean;
    closingPartner?: boolean;
  };
  saveRecording?: (audio: CapturedAudio) => Promise<void>;
}
export interface RolePlayRecordingViewProps {
  material: RoleplayReadyMaterial;
  sessionId?: string;
  settings?: RoleplayReadySettings;
  initialPhase?: RecordingPhase;
  autoAdvancePartner?: boolean;
  saveRecording?: (audio: CapturedAudio) => Promise<void>;
  resume?: { phase: RecordingPhase; step: number; closingPartner: boolean; savedCount?: number };
}

export interface RecordingCompletionPanelProps {
  status?: RecordingCompletionStatus;
  resultHref?: string;
  onRetry?: () => void;
}
export type RecordingCompletionStatus = "idle" | "submitting" | "succeeded" | "failed";
export type GlassButtonProps = ComponentProps<"button"> & { emphasis?: "secondary" | "primary" };
export interface RecordOrbProps {
  phase: RecordingPhase;
  disabled: boolean;
  onClick: () => void;
}
export interface TimerPillProps {
  children: ReactNode;
  recording: boolean;
}
export interface PartnerCardProps {
  role: string;
  children: ReactNode;
}
export interface RecordedAudioPlayerProps {
  blob: Blob;
}
export interface RecordingPreviewDialogProps {
  content: RecordingSessionClientConfig["ready"];
}
