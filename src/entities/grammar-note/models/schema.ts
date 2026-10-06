import { z } from "zod";
import type { GrammarNoteContent, PrecheckResult, SentenceAnalysis } from "./entity";
import { getAnalysisIssues } from "./validation";

// 원문을 trim/정규화하면 AI가 지정한 UTF-16 구간이 어긋나므로, 공백 여부만 검사하고 값은 보존한다.
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

export const grammarNoteIdSchema = z.string().uuid();
export const createGrammarNoteSchema = z
  .object({
    requestId: grammarNoteIdSchema,
    content: grammarNoteContentSchema,
  })
  .strict();
export const updateGrammarNoteSchema = z
  .object({
    id: grammarNoteIdSchema,
    expectedVersion: z.number().int().min(1).max(2147483647),
    content: grammarNoteContentSchema,
  })
  .strict();
export const findGrammarNotesSchema = z
  .object({
    page: z.number().int().min(1).max(2147483647).default(1),
    pageSize: z.number().int().min(1).max(100).default(20),
    query: z.string().trim().max(200).default(""),
  })
  .strict();

const rowIdentity = {
  id: grammarNoteIdSchema,
  owner_id: grammarNoteIdSchema,
  version: z.number().int().min(1).max(2147483647),
  created_at: z.string().datetime({ offset: true }),
  updated_at: z.string().datetime({ offset: true }),
};
export const grammarNoteRowSchema = z
  .object({
    ...rowIdentity,
    content: grammarNoteContentSchema,
  })
  .strict();
export const grammarNotePageSchema = z
  .object({
    items: z.array(
      z
        .object({
          ...rowIdentity,
          title: grammarMetadataSchema.shape.title,
          sentence: grammarSourceSchema.shape.sentence,
          tags: grammarMetadataSchema.shape.tags,
        })
        .strict(),
    ),
    total: z.number().int().nonnegative().safe(),
  })
  .strict();
