import type { GrammarSession } from "@/entities/grammar-session";

export function recallSession(): GrammarSession {
  return {
    id: "00000000-0000-4000-8000-000000000001",
    noteId: "00000000-0000-4000-8000-000000000002",
    noteVersion: 1,
    title: "not A but B",
    learningNote: "A가 아니라 B",
    mode: "recall",
    status: "active",
    questions: [
      {
        id: "source",
        kind: "existing",
        sentence: "She is not a teacher but a doctor.",
        translation: "그녀는 교사가 아니라 의사입니다.",
        context: "",
        requiredWords: [],
        chunks: [
          { id: "subject", start: 0, end: 4, meaning: "그녀는" },
          { id: "verb", start: 4, end: 7, meaning: "이다" },
          { id: "contrast", start: 7, end: 34, meaning: "교사가 아니라 의사" },
        ],
      },
    ],
    answers: {},
    phase: "partial",
    questionIndex: 0,
    version: 1,
    startedAt: "2026-10-01T00:00:00Z",
    completedAt: null,
  };
}
