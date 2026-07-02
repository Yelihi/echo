import { z } from "zod";

const nonEmptyStringSchema = z.string().trim().min(1);

export const evaluationDiffSegmentSchema = z
  .object({
    op: z.enum(["equal", "insert", "delete", "replace"]),
    expected: nonEmptyStringSchema.optional(),
    actual: nonEmptyStringSchema.optional(),
  })
  .refine((segment) => segment.expected !== undefined || segment.actual !== undefined, {
    message: "Diff segment must include expected or actual text.",
  });

export const evaluationResultV1Schema = z.object({
  schema_version: z.literal("v1"),
  transcript: z.string(),
  diff: z.array(evaluationDiffSegmentSchema),
  feedback: nonEmptyStringSchema,
  score: z.number().min(0).max(100).optional(),
});

export const evaluationFeedbackResultSchema = z.object({
  feedback: nonEmptyStringSchema,
  score: z.number().min(0).max(100).optional(),
});

export const evaluationDiffOutputSchema = z.object({
  diff: z.array(evaluationDiffSegmentSchema),
});

const openAIEvaluationDiffSegmentSchema = z
  .object({
    op: z.enum(["equal", "insert", "delete", "replace"]),
    expected: nonEmptyStringSchema.nullable(),
    actual: nonEmptyStringSchema.nullable(),
  })
  .refine((segment) => segment.expected !== null || segment.actual !== null, {
    message: "Diff segment must include expected or actual text.",
  });

export const openAIEvaluationFeedbackResultSchema = z.object({
  feedback: nonEmptyStringSchema,
  score: z.number().min(0).max(100).nullable(),
});

export const openAIEvaluationDiffOutputSchema = z.object({
  diff: z.array(openAIEvaluationDiffSegmentSchema),
});

export type EvaluationResultV1Schema = z.infer<typeof evaluationResultV1Schema>;
export type EvaluationFeedbackResultSchema = z.infer<typeof evaluationFeedbackResultSchema>;
export type EvaluationDiffOutputSchema = z.infer<typeof evaluationDiffOutputSchema>;
export type OpenAIEvaluationFeedbackResultSchema = z.infer<
  typeof openAIEvaluationFeedbackResultSchema
>;
export type OpenAIEvaluationDiffOutputSchema = z.infer<typeof openAIEvaluationDiffOutputSchema>;
