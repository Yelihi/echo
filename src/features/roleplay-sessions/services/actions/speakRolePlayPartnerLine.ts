"use server";

// shared
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
import { OpenAITTSProvider } from "@/shared/lib/tts/server";

// entities
import { SessionState } from "@/entities/roleplay-session";
import type { SessionId } from "@/entities/value-object";

// views
import {
  ROLE_PLAY_PARTNER_VOICE_TO_OPENAI,
  ROLE_PLAY_VOICE_PREVIEW_TEXT,
} from "@/features/roleplay-sessions/config/partnerSpeech";
import { speakRolePlayPartnerLineSchema } from "@/features/roleplay-sessions/models/partnerSpeechSchema";
import type {
  SpeakRolePlayPartnerLineInput,
  SpeakRolePlayPartnerLineResult,
  ResolvedPartnerSpeech,
} from "../../models/partnerSpeech";
import { selectRolePlaySessionPartner } from "@/entities/roleplay-session/models/selectPartner";
import { createRoleplayRecordingTurns } from "@/entities/roleplay-session/models/recordingTurns";
import { getRolePlaySession } from "@/features/roleplay-sessions/services/server/getRolePlaySession";

export const speakRolePlayPartnerLine = async (
  input: SpeakRolePlayPartnerLineInput,
): Promise<SpeakRolePlayPartnerLineResult> => {
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

  const speechRequest = await resolveSpeechRequest(parsed.data);

  if (speechRequest.code !== "SUCCESS") {
    return { code: speechRequest.code };
  }

  const { data: allowed, error: quotaError } = await supabase.rpc("consume_tts_generation", {
    p_limit: 20,
    p_window_seconds: 60,
  });

  if (quotaError) {
    return { code: "TTS-003" };
  }

  if (!allowed) {
    return { code: "TTS-004" };
  }

  try {
    const speech = await new OpenAITTSProvider().speak({
      text: speechRequest.text,
      voice: ROLE_PLAY_PARTNER_VOICE_TO_OPENAI[speechRequest.voice],
      speed: speechRequest.speed,
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

async function resolveSpeechRequest(
  input: SpeakRolePlayPartnerLineInput,
): Promise<ResolvedPartnerSpeech> {
  if (input.mode === "preview") {
    return {
      code: "SUCCESS",
      text: ROLE_PLAY_VOICE_PREVIEW_TEXT,
      voice: input.voice,
      speed: input.speed,
    };
  }

  const session = await getRolePlaySession(input.sessionId as SessionId);

  if (!session || session.state === SessionState.DELETED || session.deletedAt) {
    return { code: "TTS-002" };
  }

  const targetTurn = createRoleplayRecordingTurns(session).find(
    (turn) => turn.learnerLineId === input.learnerLineId,
  );
  const partnerLine = input.closing
    ? targetTurn?.closingPartnerLine
    : input.learnerLineId
      ? targetTurn?.partnerLine
      : selectRolePlaySessionPartner(session).partnerLine;

  if (!partnerLine) {
    return { code: "TTS-002" };
  }

  return {
    code: "SUCCESS",
    text: partnerLine,
    voice: session.partnerVoice,
    speed: session.speechSpeed,
  };
}
