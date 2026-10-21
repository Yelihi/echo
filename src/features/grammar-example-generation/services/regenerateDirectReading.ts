import type { ExampleDependencies } from "../models/interface";
import { parseDirectReading, regenerateDirectReadingCommandSchema } from "../models/schema";
import { loadTargetNote } from "./loadTargetNote";

export async function regenerateDirectReading(input: unknown, dependencies: ExampleDependencies) {
  const command = regenerateDirectReadingCommandSchema.parse(input);
  const note = await loadTargetNote(
    dependencies.repository,
    command.noteId,
    command.expectedVersion,
  );
  const permission = await dependencies.consumeRequest();
  if (permission !== "allowed") throw new Error(permission);
  return parseDirectReading(
    command.sentence,
    await dependencies.generateDirectReading(note, command.sentence),
  );
}
