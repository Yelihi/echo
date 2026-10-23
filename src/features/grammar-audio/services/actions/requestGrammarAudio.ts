"use server";

import { readStoredGrammarAudio } from "../server/storedGrammarAudio";
import { z } from "zod";
import { GrammarSessionRepository } from "@/entities/grammar-session";
import { GrammarNoteRepository } from "@/entities/grammar-note";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
import { OpenAITTSProvider } from "@/shared/lib/tts/server";
import { getOpenAITTSModel } from "@/shared/lib/openai/server";
import { observeOperation } from "@/shared/lib/logging/observeOperation";
import { recordOperationEvent } from "@/shared/lib/logging/pino";
import type { GrammarAudioResult } from "../../models/interface";
import { resolveGrammarSessionAudioText } from "../resolveGrammarSessionAudioText";
import { resolveGrammarAudioText } from "../resolveGrammarAudioText";
import { cachedGrammarAudio, grammarAudioCacheKey } from "../audioCache";

const schema = z.union([
  z
    .object({
      noteId: z.string().uuid(),
      sentenceId: z.string().min(1).max(200),
      noteVersion: z.number().int().positive(),
    })
    .strict(),
  z.object({ sessionId: z.string().uuid(), questionId: z.string().min(1).max(120) }).strict(),
]);

export async function requestGrammarAudio(input: unknown): Promise<GrammarAudioResult> {
  try {
    return await observeOperation({
      operation: "grammar.audio",
      resourceId: "grammar-audio",
      recordEvent: recordOperationEvent,

      execute: async () => {
        const parsed = schema.safeParse(input);

        if (!parsed.success) return { ok: false as const, code: "INVALID_INPUT" as const };

        const supabase = await createSupabaseServerClient();
        const { data, error } = await supabase.auth.getUser();

        if (error || !data.user) return { ok: false as const, code: "UNAUTHORIZED" as const };

        const source = parsed.data;
        const model = getOpenAITTSModel();
        let text: string;
        if ("sessionId" in source) {
          const session = await new GrammarSessionRepository(supabase).findById(source.sessionId);
          text = resolveGrammarSessionAudioText(session, source);
          if (session && source.questionId.startsWith("example:")) {
            // A frozen snapshot stays playable after its live example changes or disappears.
            const stored = await readStoredGrammarAudio(
              data.user.id,
              session.noteId,
              source.questionId.slice(8),
              text,
              model,
            );
            if (stored) return stored;
          }
        } else {
          const note = await new GrammarNoteRepository(supabase).findById(source.noteId);
          text = resolveGrammarAudioText(note, source);
          if (source.sentenceId !== "source") {
            return (
              (await readStoredGrammarAudio(
                data.user.id,
                source.noteId,
                source.sentenceId,
                text,
                model,
              )) ?? { ok: false as const, code: "GENERATION_FAILED" as const }
            );
          }
        }
        const key = grammarAudioCacheKey(data.user.id, text, model);

        return cachedGrammarAudio(key, async () => {
          const { data: permission, error: quotaError } = await supabase.rpc("consume_ai_request", {
            p_operation: "tts",
          });

          if (quotaError || permission !== "allowed")
            return {
              ok: false,
              code: quotaError
                ? "GENERATION_FAILED"
                : permission === "not_invited"
                  ? "NOT_INVITED"
                  : permission === "rate_limited"
                    ? "RATE_LIMITED"
                    : "GENERATION_FAILED",
            };

          const speech = await new OpenAITTSProvider({ model }).speak({
            text,
            voice: "alloy",
            speed: 1,
          });

          return {
            ok: true,
            audioBase64: Buffer.from(speech.audio).toString("base64"),
            mimeType: "audio/mpeg",
            cacheKey: key,
          };
        });
      },
    });
  } catch {
    return {
      ok: false,
      code: "GENERATION_FAILED",
    };
  }
}
