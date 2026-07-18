import { z } from "zod";

const nonEmptyTextSchema = z.string().trim().min(1);

export const memorizationParagraphSuggestionSentenceSchema = z.object({
  order: z.number().int().positive(),
  text: nonEmptyTextSchema,
  translation: nonEmptyTextSchema.nullable(),
});

export const memorizationParagraphSuggestionParagraphSchema = z.object({
  order: z.number().int().positive(),
  sentences: z.array(memorizationParagraphSuggestionSentenceSchema).min(1),
});

export const memorizationParagraphSuggestionSchema = z.object({
  paragraphs: z.array(memorizationParagraphSuggestionParagraphSchema).min(1),
});

export const openAIMemorizationParagraphSuggestionOutputSchema = z.object({
  paragraphs: z
    .array(
      z.object({
        sentences: z
          .array(
            z.object({
              text: nonEmptyTextSchema,
              translation: nonEmptyTextSchema.nullable(),
            }),
          )
          .min(1),
      }),
    )
    .min(1),
});

export type MemorizationParagraphSuggestion = z.infer<typeof memorizationParagraphSuggestionSchema>;
export type OpenAIMemorizationParagraphSuggestionOutput = z.infer<
  typeof openAIMemorizationParagraphSuggestionOutputSchema
>;
