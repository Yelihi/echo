import type { ExampleDependencies } from "../models/interface";
import { generateExamplesCommandSchema } from "../models/schema";
import { createValidatedCandidates } from "./createValidatedCandidates";
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

  const output = await dependencies.generate(note, command.count);

  return createValidatedCandidates(output, note, command.count);
}
