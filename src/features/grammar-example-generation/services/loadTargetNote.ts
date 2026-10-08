import {
  GrammarNotePersistenceError,
  type GrammarNoteRepositoryPort,
} from "@/entities/grammar-note";

export async function loadTargetNote(
  repository: GrammarNoteRepositoryPort,
  id: string,
  expectedVersion: number,
) {
  const note = await repository.findById(id);

  if (!note) throw new GrammarNotePersistenceError("NOT_FOUND");

  if (note.version !== expectedVersion) throw new GrammarNotePersistenceError("VERSION_CONFLICT");

  return note;
}
