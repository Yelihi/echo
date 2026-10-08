import { grammarSessionSchema, grammarSessionRowSchema } from "./schema";

export function mapGrammarSessionRowToEntity(input: unknown) {
  const row = grammarSessionRowSchema.parse(input);
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

  // UI에서 숨겨도 서버 응답에는 정답이 남으므로, 진행 중인 시험은 직렬화 전에 정답과 구간을 제거한다.
  if (session.mode === "exam" && session.status === "active")
    session.questions = session.questions.map((question) => ({
      ...question,
      sentence: null,
      chunks: [],
    }));

  return session;
}
