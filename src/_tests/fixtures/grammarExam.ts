import type { GrammarSession } from "@/entities/grammar-session";
import type { GrammarExamFeedback } from "@/features/grammar-exam/models/schema";

export function createGrammarExam(overrides: Partial<GrammarSession> = {}): GrammarSession {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    noteId: "22222222-2222-4222-8222-222222222222",
    noteVersion: 1,
    title: "not A but B",
    learningNote: "not A but B로 대조하는 표현",
    mode: "exam",
    status: "active",
    version: 1,
    phase: "existing",
    questionIndex: 0,
    answers: {},
    startedAt: "2026-10-06T00:00:00Z",
    completedAt: null,
    questions: [
      {
        id: "source",
        kind: "existing",
        sentence: null,
        chunks: [],
        translation: "그녀는 교사가 아니라 의사입니다.",
        context: "",
        requiredWords: [],
      },
      {
        id: "novel:1",
        kind: "novel",
        sentence: null,
        chunks: [],
        translation: "친구의 직업을 정정하는 문장을 작성하세요.",
        context: "친구는 가수가 아니라 기술자입니다.",
        requiredWords: [{ word: "engineer", meaning: "기술자" }],
      },
    ],
    ...overrides,
  };
}

export function createGrammarExamFeedback(
  overrides: Partial<GrammarExamFeedback> = {},
): GrammarExamFeedback {
  return {
    questionId: "source",
    answer: "She is not a teacher but a doctor.",
    verdict: "correct",
    grammarFeedback: "대조 구문을 정확하게 사용했습니다.",
    meaningFeedback: "요청한 의미를 전달합니다.",
    suggestedSentence: "She is not a teacher but a doctor.",
    ...overrides,
  };
}
