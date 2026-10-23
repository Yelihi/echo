import "server-only";
import { GrammarAudioJobRepository } from "@/entities/grammar-audio/infrastructure/GrammarAudioJobRepository";
import { getSupabaseServiceRoleClient } from "@/shared/lib/supabase/service-role";
import type { AudioPreparationResult } from "@/entities/grammar-audio";
import { exampleAudioCacheKey } from "../audioCache";
import { exampleAudioAction } from "./exampleAudioAction";
import type { GrammarAudioResult } from "../../models/interface";

export async function readStoredGrammarAudio(
  ownerId: string,
  noteId: string,
  sentenceId: string,
  text: string,
  model: string,
): Promise<GrammarAudioResult | null> {
  const asset = await new GrammarAudioJobRepository(
    getSupabaseServiceRoleClient(),
    ownerId,
    model,
  ).readStoredAudio({ noteId, sentenceIds: [sentenceId] }, text);
  return asset
    ? {
        ok: true,
        audioBase64: Buffer.from(asset.audio).toString("base64"),
        mimeType: "audio/mpeg",
        cacheKey: exampleAudioCacheKey({
          ownerId,
          noteId,
          exampleId: sentenceId,
          audioRevision: asset.revision,
        }),
      }
    : null;
}

export async function readGrammarAudioPreparation(input: unknown): Promise<AudioPreparationResult> {
  return exampleAudioAction(input, false);
}
