import type { GrammarExample } from "@/entities/grammar-note";

export function createExampleCandidates(): GrammarExample[] {
  return [
    "He is not a driver but a teacher.",
    "This is not coffee but tea.",
    "We need not excuses but answers.",
  ].map((sentence, index) => ({
    id: `candidate-${index}`,
    sentence,
    translation: [
      "그는 운전사가 아니라 교사입니다.",
      "이것은 커피가 아니라 차입니다.",
      "우리는 변명이 아니라 답이 필요합니다.",
    ][index],
    targetExplanation: "not A but B로 두 내용을 대조합니다.",
    reviewStatus: "needs-review",
  }));
}
