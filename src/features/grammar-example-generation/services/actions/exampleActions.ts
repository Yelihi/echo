"use server";

import type { GenerateExamplesCommand, SaveExamplesCommand } from "../../models/interface";
import { executeExampleAction } from "../server/executeExampleAction";
import { generateExamples } from "../generateExamples";
import { saveExamples } from "../saveExamples";

export async function requestGrammarExamples(command: GenerateExamplesCommand) {
  return executeExampleAction("grammar.examples.generate", (dependencies) =>
    generateExamples(command, dependencies),
  );
}

export async function saveGrammarExamples(command: SaveExamplesCommand) {
  return executeExampleAction("grammar.examples.save", (dependencies) =>
    saveExamples(command, dependencies.repository),
  );
}
