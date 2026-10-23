import "server-only";
import { getSupabaseServiceRoleClient } from "@/shared/lib/supabase/service-role";
import { getOpenAITTSModel } from "@/shared/lib/openai/server";
import { observeOperation } from "@/shared/lib/logging/observeOperation";
import { recordOperationEvent } from "@/shared/lib/logging/pino";
import type { AudioPreparation, ExampleAudioCommand } from "../models/repository";
import { GrammarAudioJobRepository } from "./GrammarAudioJobRepository";

export async function prepareExampleAudio(
  ownerId: string,
  command: ExampleAudioCommand,
  retry = false,
): Promise<readonly AudioPreparation[]> {
  const operationId = crypto.randomUUID();
  let stage = "audio.register";
  let registered: readonly AudioPreparation[] | undefined;
  try {
    return await observeOperation({
      operation: "grammar.audio.prepare",
      resourceId: command.noteId,
      operationId,
      getStage: () => stage,
      recordEvent: recordOperationEvent,
      execute: async () => {
        const client = getSupabaseServiceRoleClient();
        const repository = new GrammarAudioJobRepository(client, ownerId, getOpenAITTSModel());
        registered = await repository.enqueueExampleAudio(command, retry);
        if (registered.some((item) => item.status === "queued")) {
          stage = "worker.invoke";
          const secret = process.env.PROCESS_GRAMMAR_AUDIO_SECRET;
          if (!secret) throw new Error("AUDIO_PROCESSOR_UNAVAILABLE");
          const { error } = await client.functions.invoke("process-grammar-audio-job", {
            headers: { Authorization: `Bearer ${secret}` },
            body: {},
            timeout: 3000,
          });
          // Invocation failure does not undo a durable job; cron can still process it.
          if (error) throw error;
        }
        return registered;
      },
    });
  } catch {
    return registered
      ? registered.map((item) =>
          item.status === "queued" ? { ...item, code: "PROCESSOR_UNAVAILABLE", operationId } : item,
        )
      : command.sentenceIds.map((sentenceId) => ({
          sentenceId,
          status: "retryable",
          code: "REGISTRATION_FAILED",
          operationId,
        }));
  }
}
