import type {
  AnalysisJobState,
  CleanupFailureSource,
  MaterialState,
  PracticeType,
  SessionState,
} from "./enums";
import type {
  AnalysisJobId,
  LineId,
  MaterialId,
  ParagraphId,
  RecordingAudio,
  RecordingId,
  SentenceId,
  SessionId,
  SpeakerId,
  TagValue,
  UserId,
} from "./value-objects";

export interface EchoUserProfile {
  readonly id: UserId;
  readonly displayName: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface RoleplaySpeaker {
  readonly id: SpeakerId;
  readonly order: 1 | 2;
  readonly displayName: string;
}

export interface RoleplayLine {
  readonly id: LineId;
  readonly order: number;
  readonly speakerId: SpeakerId;
  readonly text: string;
  readonly translation: string | null;
}

export interface RoleplayMaterial {
  readonly id: MaterialId;
  readonly ownerId: UserId;
  readonly title: string;
  readonly situation: string;
  readonly tags: ReadonlyArray<TagValue>;
  readonly speakers: readonly [RoleplaySpeaker, RoleplaySpeaker];
  readonly lines: ReadonlyArray<RoleplayLine>;
  readonly state: MaterialState;
  readonly deletedAt: Date | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface MemorizationSentence {
  readonly id: SentenceId;
  readonly order: number;
  readonly text: string;
  readonly translation: string | null;
}

export interface MemorizationParagraph {
  readonly id: ParagraphId;
  readonly order: number;
  readonly sentences: ReadonlyArray<MemorizationSentence>;
}

export interface MemorizationMaterial {
  readonly id: MaterialId;
  readonly ownerId: UserId;
  readonly title: string;
  readonly tags: ReadonlyArray<TagValue>;
  readonly paragraphs: ReadonlyArray<MemorizationParagraph>;
  readonly state: MaterialState;
  readonly deletedAt: Date | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface RoleplaySpeakerSnapshot {
  readonly id: SpeakerId;
  readonly order: 1 | 2;
  readonly displayName: string;
}

export interface RoleplayLineSnapshot {
  readonly id: LineId;
  readonly order: number;
  readonly speakerOrder: 1 | 2;
  readonly text: string;
  readonly translation: string | null;
}

export interface RoleplaySession {
  readonly id: SessionId;
  readonly ownerId: UserId;
  readonly sourceMaterialId: MaterialId | null;
  readonly materialTitleSnapshot: string;
  readonly situationSnapshot: string;
  readonly tagsSnapshot: ReadonlyArray<TagValue>;
  readonly selectedLearnerSpeakerOrder: 1 | 2;
  readonly speakerSnapshots: readonly [RoleplaySpeakerSnapshot, RoleplaySpeakerSnapshot];
  readonly lineSnapshots: ReadonlyArray<RoleplayLineSnapshot>;
  readonly currentLineOrder: number;
  readonly state: SessionState;
  readonly startedAt: Date | null;
  readonly completedAt: Date | null;
  readonly deletedAt: Date | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface MemorizationSentenceSnapshot {
  readonly id: SentenceId;
  readonly order: number;
  readonly paragraphOrder: number;
  readonly text: string;
  readonly translation: string | null;
}

export interface MemorizationParagraphSnapshot {
  readonly id: ParagraphId;
  readonly order: number;
  readonly sentences: ReadonlyArray<MemorizationSentenceSnapshot>;
}

export interface MemorizationSession {
  readonly id: SessionId;
  readonly ownerId: UserId;
  readonly sourceMaterialId: MaterialId | null;
  readonly materialTitleSnapshot: string;
  readonly tagsSnapshot: ReadonlyArray<TagValue>;
  readonly paragraphSnapshots: ReadonlyArray<MemorizationParagraphSnapshot>;
  readonly currentParagraphOrder: number;
  readonly currentSentenceOrder: number;
  readonly state: SessionState;
  readonly startedAt: Date | null;
  readonly completedAt: Date | null;
  readonly deletedAt: Date | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export type PracticeTarget =
  | {
      readonly practiceType: PracticeType.ROLEPLAY;
      readonly sessionId: SessionId;
      readonly lineSnapshotId: LineId;
    }
  | {
      readonly practiceType: PracticeType.MEMORIZATION;
      readonly sessionId: SessionId;
      readonly sentenceSnapshotId: SentenceId;
    };

export interface DraftRecording {
  readonly id: RecordingId;
  readonly ownerId: UserId;
  readonly target: PracticeTarget;
  readonly audio: RecordingAudio;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface AcceptedRecording {
  readonly id: RecordingId;
  readonly ownerId: UserId;
  readonly target: PracticeTarget;
  readonly audio: RecordingAudio;
  readonly acceptedAt: Date;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface AnalysisJob {
  readonly id: AnalysisJobId;
  readonly ownerId: UserId;
  readonly sessionId: SessionId;
  readonly practiceType: PracticeType;
  readonly state: AnalysisJobState;
  readonly provider: string;
  readonly queuedAt: Date;
  readonly startedAt: Date | null;
  readonly completedAt: Date | null;
  readonly failedAt: Date | null;
  readonly errorMessage: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface PracticeTargetAnalysisResult {
  readonly id: string;
  readonly ownerId: UserId;
  readonly analysisJobId: AnalysisJobId;
  readonly target: PracticeTarget;
  readonly transcript: string;
  readonly feedback: Record<string, unknown>;
  readonly score: number | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface SessionAnalysisSummary {
  readonly id: string;
  readonly ownerId: UserId;
  readonly analysisJobId: AnalysisJobId;
  readonly sessionId: SessionId;
  readonly practiceType: PracticeType;
  readonly summary: Record<string, unknown>;
  readonly score: number | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface CleanupFailureLog {
  readonly id: string;
  readonly ownerId: UserId;
  readonly source: CleanupFailureSource;
  readonly audio: RecordingAudio;
  readonly errorMessage: string;
  readonly attemptedAt: Date;
  readonly createdAt: Date;
}
