import {
  GrammarNotePersistenceError,
  type GrammarNoteRepositoryPort,
} from "@/entities/grammar-note";
import { saveExamplesCommandSchema } from "../models/schema";
export async function saveExamples(input: unknown, repository: GrammarNoteRepositoryPort) {
  const command = saveExamplesCommandSchema.parse(input);
  const note = await repository.findById(command.noteId);
  if (!note) throw new GrammarNotePersistenceError("NOT_FOUND");
  if (
    new Set(command.candidates.map((candidate) => candidate.id)).size !== command.candidates.length
  )
    throw new Error("DUPLICATE_CANDIDATE");
  // 응답을 받지 못한 저장 재시도: 동일 ID와 내용이 이미 채택되었다면 버전을 다시 올리지 않는다.
  const alreadySaved = command.candidates.every((candidate) =>
    note.examples.some(
      (saved) =>
        saved.id === candidate.id &&
        saved.sentence === candidate.sentence &&
        saved.translation === candidate.translation &&
        saved.targetExplanation === candidate.targetExplanation &&
        saved.reviewStatus === "reviewed",
    ),
  );
  if (alreadySaved) return note;
  if (note.version !== command.expectedVersion)
    throw new GrammarNotePersistenceError("VERSION_CONFLICT");
  const existingIds = new Set(note.examples.map((example) => example.id));
  if (command.candidates.some((candidate) => existingIds.has(candidate.id)))
    throw new Error("DUPLICATE_CANDIDATE");
  return repository.update({
    id: note.id,
    expectedVersion: command.expectedVersion,
    content: {
      source: note.source,
      metadata: note.metadata,
      analysis: note.analysis,
      examples: [
        ...note.examples,
        ...command.candidates.map((candidate) => ({
          ...candidate,
          reviewStatus: "reviewed" as const,
        })),
      ],
    },
  });
}
