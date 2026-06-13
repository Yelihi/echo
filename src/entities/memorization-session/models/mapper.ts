import type {
  MaterialId,
  ParagraphId,
  SentenceId,
  SessionId,
  UserId,
} from "@/entities/value-object";
import type { Database } from "@/shared/lib/supabase";

import type {
  MemorizationParagraphSnapshot,
  MemorizationSentenceSnapshot,
  MemorizationSession,
} from "@/entities/memorization-session/models/entity";
import { SessionState } from "@/entities/memorization-session/models/enums";

export type MemorizationSessionRow = Database["public"]["Tables"]["memorization_sessions"]["Row"];
export type MemorizationSessionTagRow =
  Database["public"]["Tables"]["memorization_session_tags"]["Row"];
export type MemorizationSessionParagraphRow =
  Database["public"]["Tables"]["memorization_session_paragraphs"]["Row"];
export type MemorizationSessionSentenceRow =
  Database["public"]["Tables"]["memorization_session_sentences"]["Row"];

export interface MemorizationSessionRowSet {
  readonly session: MemorizationSessionRow;
  readonly tags: ReadonlyArray<MemorizationSessionTagRow>;
  readonly paragraphs: ReadonlyArray<MemorizationSessionParagraphRow>;
  readonly sentences: ReadonlyArray<MemorizationSessionSentenceRow>;
}

export function mapMemorizationSessionRowToEntity(
  rowSet: MemorizationSessionRowSet,
): MemorizationSession {
  return {
    id: rowSet.session.id as SessionId,
    ownerId: rowSet.session.user_id as UserId,
    sourceMaterialId: rowSet.session.material_id
      ? (rowSet.session.material_id as MaterialId)
      : null,
    materialTitleSnapshot: rowSet.session.material_title_snapshot,
    tagsSnapshot: [...rowSet.tags]
      .sort((left, right) => left.normalized_name.localeCompare(right.normalized_name))
      .map((tag) => ({
        displayName: tag.display_name,
        normalizedName: tag.normalized_name,
      })),
    paragraphSnapshots: [...rowSet.paragraphs]
      .sort((left, right) => left.paragraph_order - right.paragraph_order)
      .map((paragraph) => mapMemorizationParagraphRowToEntity(paragraph, rowSet.sentences)),
    currentParagraphOrder: rowSet.session.current_paragraph_order,
    currentSentenceOrder: rowSet.session.current_sentence_order,
    state: rowSet.session.status as SessionState,
    startedAt: rowSet.session.started_at ? new Date(rowSet.session.started_at) : null,
    completedAt: rowSet.session.completed_at ? new Date(rowSet.session.completed_at) : null,
    deletedAt: rowSet.session.deleted_at ? new Date(rowSet.session.deleted_at) : null,
    createdAt: new Date(rowSet.session.created_at),
    updatedAt: new Date(rowSet.session.updated_at),
  };
}

function mapMemorizationParagraphRowToEntity(
  paragraph: MemorizationSessionParagraphRow,
  sentences: ReadonlyArray<MemorizationSessionSentenceRow>,
): MemorizationParagraphSnapshot {
  return {
    id: paragraph.id as ParagraphId,
    order: paragraph.paragraph_order,
    sentences: sentences
      .filter((sentence) => sentence.paragraph_id === paragraph.id)
      .sort((left, right) => left.sentence_order - right.sentence_order)
      .map((sentence) => mapMemorizationSentenceRowToEntity(sentence, paragraph.paragraph_order)),
  };
}

function mapMemorizationSentenceRowToEntity(
  sentence: MemorizationSessionSentenceRow,
  paragraphOrder: number,
): MemorizationSentenceSnapshot {
  return {
    id: sentence.id as SentenceId,
    order: sentence.sentence_order,
    paragraphOrder,
    text: sentence.text_snapshot,
    translation: sentence.translation_snapshot,
  };
}
