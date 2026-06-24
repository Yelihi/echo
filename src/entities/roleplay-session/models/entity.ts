import type {
  LineId,
  MaterialId,
  SessionId,
  SpeakerId,
  TagValue,
  UserId,
} from "@/entities/value-object";

import type { SessionState } from "@/entities/roleplay-session/models/enums";

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
