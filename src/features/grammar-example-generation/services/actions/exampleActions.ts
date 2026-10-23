"use server";

import type {
  GenerateExamplesCommand,
  RegenerateDirectReadingCommand,
  SaveExamplesCommand,
  SaveExamplesResult,
} from "../../models/interface";
import { invalidateGrammarDetail } from "@/shared/lib/query/grammarDetailCache";
import { executeExampleAction } from "../server/executeExampleAction";
import { generateExamples } from "../generateExamples";
import { saveExamples } from "../saveExamples";
import { regenerateDirectReading } from "../regenerateDirectReading";

export async function requestGrammarExamples(command: GenerateExamplesCommand) {
  return executeExampleAction("grammar.examples.generate", (dependencies) =>
    generateExamples(command, dependencies),
  );
}

export async function saveGrammarExamples(
  command: SaveExamplesCommand,
): Promise<SaveExamplesResult> {
  const result = await executeExampleAction("grammar.examples.save", async (dependencies) => {
    const note = await saveExamples(command, dependencies.repository);
    invalidateGrammarDetail(note.id);
    const audioPreparation = await dependencies.prepareAcceptedExampleAudio({
      noteId: note.id,
      sentenceIds: command.candidates.map((candidate) => candidate.id),
    });
    return { note, audioPreparation };
  });
  return result.ok
    ? { ok: true, data: result.data.note, audioPreparation: result.data.audioPreparation }
    : result;
}

export async function regenerateGrammarDirectReading(command: RegenerateDirectReadingCommand) {
  return executeExampleAction("grammar.examples.direct-reading", (dependencies) =>
    regenerateDirectReading(command, dependencies),
  );
}
