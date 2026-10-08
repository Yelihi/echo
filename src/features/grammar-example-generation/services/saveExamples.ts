import {
  GrammarNotePersistenceError,
  type GrammarNoteRepositoryPort,
} from "@/entities/grammar-note";
import { getExampleAdoptionStatus } from "../models/exampleAdoption";
import { saveExamplesCommandSchema } from "../models/schema";

export async function saveExamples(input: unknown, repository: GrammarNoteRepositoryPort) {
  const command = saveExamplesCommandSchema.parse(input);
  const note = await repository.findById(command.noteId);

  if (!note) throw new GrammarNotePersistenceError("NOT_FOUND");

  const adoption = getExampleAdoptionStatus(note, command.candidates, command.expectedVersion);

  if (adoption === "already-saved") return note;

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
