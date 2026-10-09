import { z } from "zod";

// AI가 분석 기준 문장이나 검토 상태를 바꾸지 못하도록 공급자 응답에서는 제외한다.
// 원문·revision은 요청 값에서, 검토 상태는 서버의 초기값에서 부여한다.
const range = z.object({ start: z.number().int(), end: z.number().int() }).strict();
export const precheckOutputSchema = z
  .object({
    status: z.enum(["passed", "needs-revision", "uncertain"]),
    issues: z.array(
      z
        .object({
          field: z.enum(["sentence", "learningNote"]),
          message: z.string(),
          suggestion: z.string().nullable(),
        })
        .strict(),
    ),
  })
  .strict();
export const analysisOutputSchema = z
  .object({
    title: z.string(),
    tags: z.array(z.string()),
    grammarKey: z.null(),
    chunks: z.array(
      z
        .object({ id: z.string(), range, literalMeaning: z.string(), explanation: z.string() })
        .strict(),
    ),
    syntax: z.array(
      z
        .object({
          id: z.string(),
          ranges: z.array(range),
          parentId: z.string().min(1).nullable(),
          role: z.enum(["subject", "verb", "object", "complement", "modifier", "other"]),
          label: z.string(),
          explanation: z.string(),
        })
        .strict(),
    ),
    constructions: z.array(
      z
        .object({
          id: z.string(),
          name: z.string(),
          ranges: z.array(range),
          meaning: z.string(),
          explanation: z.string(),
        })
        .strict(),
    ),
    naturalTranslation: z.string(),
  })
  .strict();
