import "server-only";
import { getSupabaseServiceRoleClient } from "@/shared/lib/supabase/service-role";
import { getOpenAITTSModel } from "@/shared/lib/openai/server";
import type { AudioPreparation, ExampleAudioCommand } from "../models/repository";
import { GrammarAudioJobRepository } from "./GrammarAudioJobRepository";

export async function prepareExampleAudio(
  ownerId: string,
  command: ExampleAudioCommand,
  retry = false,
): Promise<readonly AudioPreparation[]> {
  try {
    const client = getSupabaseServiceRoleClient();
    const repository = new GrammarAudioJobRepository(client, ownerId, getOpenAITTSModel());
    const statuses = await repository.enqueueExampleAudio(command, retry);
    if (statuses.some((item) => item.status === "queued")) {
      const secret = process.env.PROCESS_GRAMMAR_AUDIO_SECRET;
      if (secret) {
        // Cron recovers a missed kick; registration remains durable even if HTTP fails.
        await client.functions
          .invoke("process-grammar-audio-job", {
            headers: { Authorization: `Bearer ${secret}` },
            body: {},
            timeout: 3000,
          })
          .catch(() => undefined);
      }
    }
    return statuses;
  } catch {
    return command.sentenceIds.map((sentenceId) => ({
      sentenceId,
      status: "retryable",
      code: "REGISTRATION_FAILED",
    }));
  }
}
