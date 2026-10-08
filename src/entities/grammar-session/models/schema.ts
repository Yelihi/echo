import { z } from "zod";

const text = z.string().trim().min(1).max(4000);

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
  answers: z.record(z.string().max(4000)),
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
  answers: z.record(z.string().max(4000)),
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
