"use server";
import { readGrammarAudioPreparation } from "../server/storedGrammarAudio";
export async function getExampleAudioPreparation(input: unknown) {
  return readGrammarAudioPreparation(input);
}
