import type {
  MaterialId,
  ParagraphId,
  SentenceId,
  SessionId,
  TagValue,
  UserId,
} from "@/entities/value-object";

import type { SessionState } from "./enums";

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
