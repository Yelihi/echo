import "server-only";
import { observeOperation } from "@/shared/lib/logging/observeOperation";
import { recordOperationEvent } from "@/shared/lib/logging/pino";
import { z } from "zod";
import { GrammarNoteRepository, GrammarNotePersistenceError } from "@/entities/grammar-note";
import { GrammarAudioJobRepository } from "@/entities/grammar-audio/server";
import type { AudioPreparationResult } from "@/entities/grammar-audio";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
import { getSupabaseServiceRoleClient } from "@/shared/lib/supabase/service-role";
import { getOpenAITTSModel } from "@/shared/lib/openai/server";
import { prepareAcceptedExampleAudio } from "../prepareAcceptedExampleAudio";

const schema = z
  .object({
    noteId: z.string().uuid(),
    sentenceIds: z.array(z.string().min(1).max(200)).min(1).max(100),
  })
  .strict();
export async function exampleAudioAction(
  input: unknown,
  retry: boolean,
): Promise<AudioPreparationResult> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, code: "INVALID_INPUT" };
  const operationId = crypto.randomUUID();
  let stage = "auth";
  try {
    return await observeOperation<AudioPreparationResult>({
      operation: retry ? "grammar.audio.retry" : "grammar.audio.status",
      resourceId: parsed.data.noteId,
      operationId,
      getStage: () => stage,
      recordEvent: recordOperationEvent,
      execute: async () => {
        const client = await createSupabaseServerClient();
        const { data, error } = await client.auth.getUser();
        if (error || !data.user)
          throw new GrammarNotePersistenceError("UNAUTHORIZED", { cause: error ?? undefined });
        stage = "note.load";
        const note = await new GrammarNoteRepository(client).findById(parsed.data.noteId);
        if (
          !note ||
          !parsed.data.sentenceIds.every((id) =>
            note.examples.some((e) => e.id === id && e.reviewStatus === "reviewed"),
          )
        )
          throw new GrammarNotePersistenceError("INVALID_INPUT");
        stage = retry ? "audio.register" : "audio.status";
        const statuses = retry
          ? await prepareAcceptedExampleAudio(data.user.id, parsed.data, true)
          : await new GrammarAudioJobRepository(
              getSupabaseServiceRoleClient(),
              data.user.id,
              getOpenAITTSModel(),
            ).getPreparation(parsed.data);
        return { ok: true, data: statuses };
      },
    });
  } catch (error) {
    if (
      error instanceof GrammarNotePersistenceError &&
      (error.code === "UNAUTHORIZED" || error.code === "INVALID_INPUT")
    )
      return { ok: false, code: error.code };
    return { ok: false, code: "FAILED", operationId };
  }
}
