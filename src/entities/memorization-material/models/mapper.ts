import type { MaterialId, ParagraphId, SentenceId, UserId } from "@/entities/value-object";
import type { Database } from "@/shared/lib/supabase";

import type {
  MemorizationMaterial,
  MemorizationParagraph,
  MemorizationSentence,
} from "@/entities/memorization-material/models/entity";
import { MaterialState } from "@/entities/memorization-material/models/enums";

export type MemorizationMaterialRow = Database["public"]["Tables"]["memorization_materials"]["Row"];
export type MemorizationMaterialTagRow =
  Database["public"]["Tables"]["memorization_material_tags"]["Row"];
export type MemorizationMaterialParagraphRow =
  Database["public"]["Tables"]["memorization_material_paragraphs"]["Row"];
export type MemorizationMaterialSentenceRow =
  Database["public"]["Tables"]["memorization_material_sentences"]["Row"];

export interface MemorizationMaterialRowSet {
  readonly material: MemorizationMaterialRow;
  readonly tags: ReadonlyArray<MemorizationMaterialTagRow>;
  readonly paragraphs: ReadonlyArray<MemorizationMaterialParagraphRow>;
  readonly sentences: ReadonlyArray<MemorizationMaterialSentenceRow>;
}

export function mapMemorizationMaterialRowToEntity(
  rowSet: MemorizationMaterialRowSet,
): MemorizationMaterial {
  return {
    id: rowSet.material.id as MaterialId,
    ownerId: rowSet.material.user_id as UserId,
    title: rowSet.material.title,
    tags: [...rowSet.tags]
      .sort((left, right) => left.normalized_name.localeCompare(right.normalized_name))
      .map((tag) => ({
        displayName: tag.display_name,
        normalizedName: tag.normalized_name,
      })),
    paragraphs: [...rowSet.paragraphs]
      .sort((left, right) => left.paragraph_order - right.paragraph_order)
      .map((paragraph) => mapMemorizationParagraphRowToEntity(paragraph, rowSet.sentences)),
    state: rowSet.material.status as MaterialState,
    deletedAt: rowSet.material.deleted_at ? new Date(rowSet.material.deleted_at) : null,
    createdAt: new Date(rowSet.material.created_at),
    updatedAt: new Date(rowSet.material.updated_at),
  };
}

function mapMemorizationParagraphRowToEntity(
  paragraph: MemorizationMaterialParagraphRow,
  sentences: ReadonlyArray<MemorizationMaterialSentenceRow>,
): MemorizationParagraph {
  return {
    id: paragraph.id as ParagraphId,
    order: paragraph.paragraph_order,
    sentences: sentences
      .filter((sentence) => sentence.paragraph_id === paragraph.id)
      .sort((left, right) => left.sentence_order - right.sentence_order)
      .map(mapMemorizationSentenceRowToEntity),
  };
}

function mapMemorizationSentenceRowToEntity(
  sentence: MemorizationMaterialSentenceRow,
): MemorizationSentence {
  return {
    id: sentence.id as SentenceId,
    order: sentence.sentence_order,
    text: sentence.text,
    translation: sentence.translation,
  };
}
