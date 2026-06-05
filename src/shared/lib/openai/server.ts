import "server-only";

import OpenAI from "openai";

export const OPENAI_STT_MODEL = "gpt-4o-mini-transcribe" as const;

let openAIClient: OpenAI | null = null;

export function getOpenAIServerClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("Missing OpenAI environment variable. Set OPENAI_API_KEY.");
  }

  if (!openAIClient) {
    openAIClient = new OpenAI({ apiKey });
  }

  return openAIClient;
}
