"use server";
import { exampleAudioAction } from "../server/exampleAudioAction";
export async function retryExampleAudioPreparation(input: unknown) {
  return exampleAudioAction(input, true);
}
