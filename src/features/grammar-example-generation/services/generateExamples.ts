import { grammarExampleSchema } from "@/entities/grammar-note";
import type { ExampleDependencies } from "../models/interface";
import { exampleOutputSchema, generateExamplesCommandSchema } from "../models/schema";
import { loadTargetNote } from "./loadTargetNote";

export async function generateExamples(input: unknown, dependencies: ExampleDependencies) {
  // 1. 식별자와 버전을 검사하고 소유권이 적용된 저장소에서 목표 어법을 읽는다.
  const command = generateExamplesCommandSchema.parse(input);
  const note = await loadTargetNote(
    dependencies.repository,
    command.noteId,
    command.expectedVersion,
  );
  const permission = await dependencies.consumeRequest();

  if (permission !== "allowed") throw new Error(permission);

  // 2. 외부 응답의 구조와 요청 개수를 검사한 뒤 서버가 후보 식별자를 부여한다.
  const response = exampleOutputSchema.parse(await dependencies.generate(note, command.count));

  if (response.examples.length !== command.count) throw new Error("INVALID_EXAMPLE_COUNT");

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
