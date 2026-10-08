import { z } from "zod";

const text = z.string().trim().min(1).max(4000);

export const grammarExamPromptOutputSchema = z.object({
  questions: z
    .array(
      z.object({
        context: text,
        instruction: text,
        requiredWords: z
          .array(z.object({ word: text, meaning: text }))
          .min(1)
          .max(12),
      }),
    )
    .min(1)
    .max(3),
});

export const grammarExamGradeOutputSchema = z.object({
  verdict: z.enum(["correct", "partially-correct", "needs-work"]),
  grammarFeedback: text,
  meaningFeedback: text,
  suggestedSentence: text,
});

export const grammarExamFeedbackSchema = grammarExamGradeOutputSchema.extend({
  questionId: z.string(),
  answer: z
    .string()
    .min(1)
    .max(4000)
    .refine((value) => value.trim().length > 0),
});

export type GrammarExamFeedback = z.infer<typeof grammarExamFeedbackSchema>;
