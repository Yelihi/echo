import { grammarExampleSchema, type GrammarNote } from "@/entities/grammar-note";
import { exampleOutputSchema } from "../models/schema";

/** 생성 개수·중복·기존 문장 재사용 정책을 검증한 후보만 편집 화면에 전달한다. */
export function createValidatedCandidates(
  output: unknown,
  note: GrammarNote,
  expectedCount: 1 | 3,
) {
  const response = exampleOutputSchema.parse(output);

  if (response.examples.length !== expectedCount) throw new Error("INVALID_EXAMPLE_COUNT");

  const candidates = response.examples.map((example) =>
    grammarExampleSchema.parse({
      ...example,
      id: crypto.randomUUID(),
      reviewStatus: "needs-review",
    }),
  );

  if (
    new Set(candidates.map((candidate) => candidate.sentence.trim().toLowerCase())).size !==
    candidates.length
  )
    throw new Error("DUPLICATE_EXAMPLES");

  const existingSentences = new Set(
    [note.source.sentence, ...note.examples.map((example) => example.sentence)].map((sentence) =>
      sentence.trim().toLowerCase(),
    ),
  );

  if (
    candidates.some((candidate) => existingSentences.has(candidate.sentence.trim().toLowerCase()))
  )
    throw new Error("REPEATED_EXAMPLES");

  return candidates;
}
