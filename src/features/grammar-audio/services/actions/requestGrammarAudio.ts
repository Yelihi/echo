"use server";
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
        if (!parsed.success) return { ok: false as const, message: "음성 요청을 확인해주세요." };
        const supabase = await createSupabaseServerClient();
        const { data, error } = await supabase.auth.getUser();
        if (error || !data.user)
          return { ok: false as const, message: "로그인 후 다시 시도해주세요." };
        const source = parsed.data;
        const text =
          "sessionId" in source
            ? resolveGrammarSessionAudioText(
                await new GrammarSessionRepository(supabase).findById(source.sessionId),
                source,
              )
            : resolveGrammarAudioText(
                await new GrammarNoteRepository(supabase).findById(source.noteId),
                source,
              );
        const model = getOpenAITTSModel();
        const key = grammarAudioCacheKey(data.user.id, text, model);
        return cachedGrammarAudio(key, async () => {
          const { data: permission, error: quotaError } = await supabase.rpc("consume_ai_request", {
            p_operation: "tts",
          });
          if (quotaError || permission !== "allowed")
            return {
              ok: false,
              message:
                permission === "not_invited"
                  ? "AI 음성 이용 권한이 필요합니다."
                  : "음성 요청 한도에 도달했습니다. 잠시 후 다시 시도해주세요.",
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
      message: "음성을 생성하지 못했습니다. 노트가 변경되었다면 새로고침 후 다시 생성해주세요.",
    };
  }
}
