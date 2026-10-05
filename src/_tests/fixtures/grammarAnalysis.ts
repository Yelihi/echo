import type { SentenceAnalysis } from "@/entities/grammar-note";

export function createGrammarAnalysis(): SentenceAnalysis {
  return {
    sourceText: "She is not a teacher but a doctor.",
    sourceRevision: 0,
    chunks: [
      {
        id: "c1",
        range: { start: 0, end: 4 },
        literalMeaning: "그녀는",
        explanation: "주어입니다.",
      },
      { id: "c2", range: { start: 4, end: 7 }, literalMeaning: "이다", explanation: "동사입니다." },
      {
        id: "c3",
        range: { start: 7, end: 34 },
        literalMeaning: "교사가 아니라 의사",
        explanation: "대조되는 보어입니다.",
      },
    ],
    syntax: [
      {
        id: "clause",
        ranges: [{ start: 0, end: 34 }],
        parentId: null,
        role: "other",
        label: "절",
        explanation: "완전한 절입니다.",
      },
      {
        id: "s",
        ranges: [{ start: 0, end: 3 }],
        parentId: "clause",
        role: "subject",
        label: "주어",
        explanation: "주체를 나타냅니다.",
      },
      {
        id: "v",
        ranges: [{ start: 4, end: 6 }],
        parentId: "clause",
        role: "verb",
        label: "동사",
        explanation: "주어와 보어를 연결합니다.",
      },
      {
        id: "complement",
        ranges: [{ start: 7, end: 33 }],
        parentId: "clause",
        role: "complement",
        label: "보어",
        explanation: "주어를 설명합니다.",
      },
    ],
    constructions: [
      {
        id: "contrast",
        name: "not A but B",
        ranges: [
          { start: 7, end: 10 },
          { start: 21, end: 24 },
        ],
        meaning: "A가 아니라 B",
        explanation: "대조할 내용을 연결합니다.",
      },
    ],
    naturalTranslation: "그녀는 교사가 아니라 의사입니다.",
    reviewStatus: "reviewed",
  };
}
