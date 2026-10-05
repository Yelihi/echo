import { z } from "zod";
import { grammarSessionSchema } from "../schema";

const rowSchema = z.object({
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
/** 시험 진행 중에는 정답 문장을 클라이언트에 직렬화하지 않습니다. */
export function convertGrammarSessionRow(input: unknown) {
  const row = rowSchema.parse(input);
  const session = grammarSessionSchema.parse({
    id: row.id,
    noteId: row.note_id,
    noteVersion: row.note_version,
    title: row.snapshot.metadata.title,
    learningNote: row.snapshot.source.learningNote,
    mode: row.mode,
    status: row.status,
    questions: row.questions,
    answers: row.answers,
    phase: row.phase,
    questionIndex: row.question_index,
    version: row.version,
    startedAt: row.started_at,
    completedAt: row.completed_at,
  });
  if (session.mode === "exam" && session.status === "active")
    session.questions = session.questions.map((question) => ({
      ...question,
      sentence: null,
      chunks: [],
    }));
  return session;
}
