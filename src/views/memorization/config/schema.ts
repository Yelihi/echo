import { z } from "zod";

// shared
import { isUuidString } from "@/shared/utils/uuid";

// entities
import { MaterialState } from "@/entities/memorization-material";
import { createTagValue } from "@/entities/value-object";

const uniqueDisplayTags = (tags: string[]): string[] => {
  const seen = new Set<string>();

  return tags.flatMap((tag) => {
    const trimmed = tag.trim();

    if (!trimmed) {
      return [];
    }

    const { displayName, normalizedName } = createTagValue(trimmed);

    if (seen.has(normalizedName)) {
      return [];
    }

    seen.add(normalizedName);
    return [displayName];
  });
};

export const memorizationEditorDraftSchema = z.object({
  title: z.string().trim().min(1).max(120),
  tags: z
    .array(z.string())
    .transform(uniqueDisplayTags)
    .pipe(z.array(z.string().min(1).max(80))),
  confirmed: z.literal(true),
  paragraphs: z
    .array(z.string())
    .transform((paragraphs) =>
      paragraphs.map((paragraph) => paragraph.trim()).filter((paragraph) => paragraph.length > 0),
    )
    .pipe(z.array(z.string().min(1).max(2000)).min(1)),
});

export type MemorizationEditorDraftInput = z.infer<typeof memorizationEditorDraftSchema>;

const uuidSchema = z.string().refine(isUuidString, { message: "Invalid uuid" });

export const createMemorizationSessionInputSchema = z.object({
  ownerId: uuidSchema,
  materialId: uuidSchema,
});

export type CreateMemorizationSessionInputParsed = z.infer<
  typeof createMemorizationSessionInputSchema
>;

const memorizationSessionSnapshotSentenceSchema = z.object({
  id: uuidSchema,
  order: z.number().int().min(0),
  text: z.string().trim().min(1).max(2000),
  translation: z.string().trim().min(1).max(2000).nullable(),
});

const memorizationSessionSnapshotParagraphSchema = z.object({
  id: uuidSchema,
  order: z.number().int().min(0),
  sentences: z.array(memorizationSessionSnapshotSentenceSchema).min(1),
});

const memorizationSessionSnapshotMaterialSchema = z.object({
  id: uuidSchema,
  ownerId: uuidSchema,
  title: z.string().trim().min(1).max(120),
  tags: z.array(
    z.object({
      displayName: z.string().trim().min(1).max(80),
      normalizedName: z.string().trim().min(1).max(80),
    }),
  ),
  paragraphs: z.array(memorizationSessionSnapshotParagraphSchema).min(1),
  state: z.literal(MaterialState.ACTIVE),
  deletedAt: z.null(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createMemorizationSessionSnapshotSchema = z.object({
  material: memorizationSessionSnapshotMaterialSchema,
});

export type CreateMemorizationSessionSnapshotParsed = z.infer<
  typeof createMemorizationSessionSnapshotSchema
>;
