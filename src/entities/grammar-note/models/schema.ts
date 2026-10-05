import { z } from "zod";
import type { GrammarNoteContent, PrecheckResult, SentenceAnalysis } from "./entity";
import { getAnalysisIssues } from "./validation";

// Bounds protect provider/storage boundaries; source text is never trimmed or normalized.
const requiredText = z
  .string()
  .max(4000)
  .refine((value) => value.trim().length > 0, "필수 입력입니다.");
const id = z.string().min(1).max(100);
const revision = z.number().int().nonnegative();
const rangeSchema = z.object({ start: revision, end: revision }).strict();
const rangesSchema = z.array(rangeSchema).min(1).max(100);

export const grammarSourceSchema = z
  .object({
    sentence: requiredText,
    learningNote: requiredText,
    revision,
  })
  .strict();

export const grammarMetadataSchema = z
  .object({
    source: z.literal("ai"),
    sourceRevision: revision,
    title: requiredText,
    tags: z.array(requiredText).max(20),
    grammarKey: id.nullable(),
  })
  .strict();

export const sentenceAnalysisSchema: z.ZodType<SentenceAnalysis> = z
  .object({
    sourceText: requiredText,
    sourceRevision: revision,
    chunks: z
      .array(
        z
          .object({
            id,
            range: rangeSchema,
            literalMeaning: z.string().max(4000),
            explanation: z.string().max(4000),
          })
          .strict(),
      )
      .min(1)
      .max(200),
    syntax: z
      .array(
        z
          .object({
            id,
            ranges: rangesSchema,
            parentId: id.nullable(),
            role: z.enum(["subject", "verb", "object", "complement", "modifier", "other"]),
            label: requiredText,
            explanation: z.string().max(4000),
          })
          .strict(),
      )
      .max(200),
    constructions: z
      .array(
        z
          .object({
            id,
            name: requiredText,
            ranges: rangesSchema,
            meaning: requiredText,
            explanation: z.string().max(4000),
          })
          .strict(),
      )
      .max(100),
    naturalTranslation: requiredText,
    reviewStatus: z.enum(["needs-review", "reviewed"]),
  })
  .strict()
  .superRefine((analysis, ctx) => {
    for (const issue of getAnalysisIssues(analysis)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, ...issue });
    }
  });

export const grammarExampleSchema = z
  .object({
    id,
    sentence: requiredText,
    translation: requiredText,
    targetExplanation: requiredText,
    reviewStatus: z.enum(["needs-review", "reviewed"]),
  })
  .strict();

export const grammarNoteContentSchema: z.ZodType<GrammarNoteContent> = z
  .object({
    source: grammarSourceSchema,
    metadata: grammarMetadataSchema,
    analysis: sentenceAnalysisSchema,
    examples: z.array(grammarExampleSchema).max(100),
  })
  .strict()
  .superRefine((content, ctx) => {
    if (content.source.sentence !== content.analysis.sourceText) {
      ctx.addIssue({
        code: "custom",
        path: ["analysis", "sourceText"],
        message: "분석 원문이 입력 문장과 다릅니다.",
      });
    }
    for (const key of ["metadata", "analysis"] as const) {
      if (content[key].sourceRevision !== content.source.revision) {
        ctx.addIssue({
          code: "custom",
          path: [key, "sourceRevision"],
          message: "이전 입력에 대한 결과입니다. 다시 분석해 주세요.",
        });
      }
    }
    const exampleIds = new Set<string>();
    content.examples.forEach((example, index) => {
      if (exampleIds.has(example.id))
        ctx.addIssue({
          code: "custom",
          path: ["examples", index, "id"],
          message: "예문 ID가 중복되었습니다.",
        });
      exampleIds.add(example.id);
    });
  });

export const precheckResultSchema: z.ZodType<PrecheckResult> = z.union([
  z.object({ status: z.literal("passed"), sourceRevision: revision }).strict(),
  z
    .object({
      status: z.enum(["needs-revision", "uncertain"]),
      sourceRevision: revision,
      issues: z
        .array(
          z
            .object({
              field: z.enum(["sentence", "learningNote"]),
              message: requiredText,
              suggestion: requiredText.nullable(),
            })
            .strict(),
        )
        .min(1)
        .max(20),
    })
    .strict(),
]);
