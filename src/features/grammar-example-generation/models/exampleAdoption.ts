import {
  GrammarNotePersistenceError,
  type GrammarNote,
  type GrammarExample,
} from "@/entities/grammar-note";

/** 동일 저장 재시도는 버전이 바뀌어도 허용하되, 일부 채택·내용 변경은 새 저장으로 검사한다. */
export function getExampleAdoptionStatus(
  note: GrammarNote,
  candidates: readonly GrammarExample[],
  expectedVersion: number,
): "already-saved" | "new" {
  if (new Set(candidates.map((candidate) => candidate.id)).size !== candidates.length)
    throw new Error("DUPLICATE_CANDIDATE");

  // 응답을 받지 못한 저장 재시도: 동일 ID와 내용이 이미 채택되었다면 버전을 다시 올리지 않는다.
  const alreadySaved = candidates.every((candidate) =>
    note.examples.some(
      (saved) =>
        saved.id === candidate.id &&
        saved.sentence === candidate.sentence &&
        saved.translation === candidate.translation &&
        saved.targetExplanation === candidate.targetExplanation &&
        saved.reviewStatus === "reviewed",
    ),
  );

  if (alreadySaved) return "already-saved";

  if (note.version !== expectedVersion) throw new GrammarNotePersistenceError("VERSION_CONFLICT");

  const existingIds = new Set(note.examples.map((example) => example.id));

  if (candidates.some((candidate) => existingIds.has(candidate.id)))
    throw new Error("DUPLICATE_CANDIDATE");

  return "new";
}
