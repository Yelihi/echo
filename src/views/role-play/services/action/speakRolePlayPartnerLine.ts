"use server";

// shared
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
import { OpenAITTSProvider } from "@/shared/lib/tts/server";

// views
import { ROLE_PLAY_PARTNER_VOICE_TO_OPENAI } from "@/views/role-play/config/const";
import { speakRolePlayPartnerLineSchema } from "@/views/role-play/config/schema";
import type { RoleplayReadyVoice } from "@/views/role-play/models/interface";

export type SpeakRolePlayPartnerLineResult =
  | { code: "SUCCESS"; audioBase64: string; mimeType: "audio/mpeg" }
  | { code: "TTS-001" }
  | { code: "TTS-002" }
  | { code: "TTS-003" };

export const speakRolePlayPartnerLine = async (input: {
  text: string;
  voice: RoleplayReadyVoice;
  speed: number;
}): Promise<SpeakRolePlayPartnerLineResult> => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { code: "TTS-001" };
  }

  const parsed = speakRolePlayPartnerLineSchema.safeParse(input);

  if (!parsed.success) {
    return { code: "TTS-002" };
  }

  try {
    const speech = await new OpenAITTSProvider().speak({
      text: parsed.data.text,
      voice: ROLE_PLAY_PARTNER_VOICE_TO_OPENAI[parsed.data.voice],
      speed: parsed.data.speed,
    });

    return {
      code: "SUCCESS",
      audioBase64: Buffer.from(speech.audio).toString("base64"),
      mimeType: speech.mimeType,
    };
  } catch {
    return { code: "TTS-003" };
  }
};
