import { z } from "zod";

// entities
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
