import { z } from "zod";

import { GRAMMAR_ANSWER_MAX_LENGTH, GRAMMAR_PARTIAL_DRAFT_MAX_LENGTH } from "./limits";

// 저장 원문의 공백과 구간 오프셋을 보존하고 공백뿐인 값만 거부합니다.
const text = z
  .string()
  .max(GRAMMAR_ANSWER_MAX_LENGTH)
  .refine((value) => value.trim().length > 0);
const answersSchema = z
  .record(z.string().max(GRAMMAR_PARTIAL_DRAFT_MAX_LENGTH))
  .superRefine((answers, context) => {
    // 부분 회상은 JSON 초안이며, 나머지 단계는 원문과 같은 길이의 일반 텍스트 답안입니다.
    for (const [key, answer] of Object.entries(answers)) {
      if (!key.startsWith("partial:") && answer.length > GRAMMAR_ANSWER_MAX_LENGTH) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: [key],
          message: "문장 답안은 4,000자 이내로 입력해 주세요.",
        });
      }
    }
  });
export const grammarSessionModeSchema = z.enum(["recall", "exam"]);
export const grammarSessionIdSchema = z.string().uuid();
export const grammarSessionPhaseSchema = z.enum(["partial", "whole", "existing", "novel"]);
export const grammarQuestionSchema = z.object({
  id: z.string().min(1).max(120),
  kind: z.enum(["existing", "novel"]),
  sentence: text.nullable(),
  translation: text,
  context: z.string().max(4000),
  chunks: z
    .array(
      z.object({
        id: z.string(),
        start: z.number().int().nonnegative(),
        end: z.number().int().positive(),
        meaning: z.string(),
      }),
    )
    .max(200),
  requiredWords: z.array(z.object({ word: text, meaning: text })).max(12),
});
export const grammarSessionSchema = z.object({
  id: z.string().uuid(),
  noteId: z.string().uuid(),
  noteVersion: z.number().int().positive(),
  title: text,
  learningNote: text,
  mode: grammarSessionModeSchema,
  status: z.enum(["active", "completed"]),
  questions: z.array(grammarQuestionSchema).min(1).max(110),
  answers: answersSchema,
  phase: grammarSessionPhaseSchema,
  questionIndex: z.number().int().nonnegative(),
  version: z.number().int().positive(),
  startedAt: z.string(),
  completedAt: z.string().nullable(),
});
export const startGrammarSessionSchema = z.object({
  noteId: z.string().uuid(),
  requestId: z.string().uuid(),
  mode: grammarSessionModeSchema,
});
export const saveGrammarAnswersSchema = z.object({
  id: z.string().uuid(),
  expectedVersion: z.number().int().positive(),
  answers: answersSchema,
  phase: grammarSessionPhaseSchema,
  questionIndex: z.number().int().nonnegative(),
});
export const completeGrammarSessionSchema = z.object({
  id: z.string().uuid(),
  expectedVersion: z.number().int().positive(),
});

export const findGrammarSessionHistorySchema = z.object({
  noteId: grammarSessionIdSchema.optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
});
const grammarSessionSummarySchema = z.object({
  id: grammarSessionIdSchema,
  noteId: grammarSessionIdSchema,
  title: z.string(),
  mode: grammarSessionModeSchema,
  startedAt: z.string(),
  completedAt: z.string(),
  questionCount: z.number().int().positive(),
});
export const grammarSessionHistoryPageSchema = z.object({
  items: z.array(grammarSessionSummarySchema),
  total: z.number().int().nonnegative(),
});
export type GrammarSession = z.infer<typeof grammarSessionSchema>;
export type GrammarSessionQuestion = z.infer<typeof grammarQuestionSchema>;
export type GrammarSessionMode = z.infer<typeof grammarSessionModeSchema>;
export type GrammarSessionPhase = z.infer<typeof grammarSessionPhaseSchema>;
export type StartGrammarSessionInput = z.infer<typeof startGrammarSessionSchema>;
export type SaveGrammarAnswersInput = z.infer<typeof saveGrammarAnswersSchema>;
export type CompleteGrammarSessionInput = z.infer<typeof completeGrammarSessionSchema>;

export const grammarSessionRowSchema = z.object({
  id: z.string(),
  note_id: z.string(),
  note_version: z.number(),
  mode: z.string(),
  status: z.string(),
  snapshot: z.object({
    metadata: z.object({ title: z.string() }),
    source: z.object({ learningNote: z.string() }),
  }),
  questions: z.unknown(),
  answers: z.unknown(),
  phase: z.string(),
  question_index: z.number(),
  version: z.number(),
  started_at: z.string(),
  completed_at: z.string().nullable(),
});
