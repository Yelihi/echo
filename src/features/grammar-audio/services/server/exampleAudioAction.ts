import "server-only";
import { z } from "zod";
import { GrammarNoteRepository } from "@/entities/grammar-note";
import { GrammarAudioJobRepository } from "@/entities/grammar-audio/infrastructure/GrammarAudioJobRepository";
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
  try {
    const client = await createSupabaseServerClient();
    const { data, error } = await client.auth.getUser();
    if (error || !data.user) return { ok: false, code: "UNAUTHORIZED" };
    const note = await new GrammarNoteRepository(client).findById(parsed.data.noteId);
    if (
      !note ||
      !parsed.data.sentenceIds.every((id) =>
        note.examples.some((e) => e.id === id && e.reviewStatus === "reviewed"),
      )
    )
      return { ok: false, code: "INVALID_INPUT" };
    const statuses = retry
      ? await prepareAcceptedExampleAudio(data.user.id, parsed.data, true)
      : await new GrammarAudioJobRepository(
          getSupabaseServiceRoleClient(),
          data.user.id,
          getOpenAITTSModel(),
        ).getPreparation(parsed.data);
    return { ok: true, data: statuses };
  } catch {
    return { ok: false, code: "FAILED" };
  }
}
