import type {
  MaterialId,
  ParagraphId,
  SentenceId,
  TagValue,
  UserId,
} from "@/entities/value-object";

import type { MaterialState } from "@/entities/memorization-material/models/enums";

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
