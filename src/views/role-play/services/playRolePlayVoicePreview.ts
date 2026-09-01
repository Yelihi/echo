"use client";

// shared
import { decodeTtsAudioBase64 } from "@/shared/lib/tts/decodeTtsAudioBase64";

// views
import type { RoleplayReadyVoice } from "@/views/role-play/models/interface";
import { speakRolePlayPartnerLine } from "@/views/role-play/services/action/speakRolePlayPartnerLine";

let previewRequestId = 0;
let previewAudio: HTMLAudioElement | null = null;
let previewObjectUrl: string | null = null;

export function stopRolePlayVoicePreview() {
  previewRequestId += 1;
  previewAudio?.pause();
  previewAudio = null;

  if (previewObjectUrl) {
    URL.revokeObjectURL(previewObjectUrl);
    previewObjectUrl = null;
  }
}

export async function playRolePlayVoicePreview(input: {
  voice: RoleplayReadyVoice;
  speed: number;
}) {
  stopRolePlayVoicePreview();
  const requestId = previewRequestId;

  const result = await speakRolePlayPartnerLine({
    mode: "preview",
    voice: input.voice,
    speed: input.speed,
  });

  if (requestId !== previewRequestId || result.code !== "SUCCESS") {
    return;
  }

  const objectUrl = URL.createObjectURL(decodeTtsAudioBase64(result.audioBase64, result.mimeType));
  previewObjectUrl = objectUrl;
  const audio = new Audio(objectUrl);
  previewAudio = audio;
  audio.onended = () => {
    if (previewObjectUrl === objectUrl) {
      URL.revokeObjectURL(objectUrl);
      previewObjectUrl = null;
    }
  };

  try {
    await audio.play();
  } catch {
    if (previewAudio === audio) {
      previewAudio = null;
    }

    if (previewObjectUrl === objectUrl) {
      URL.revokeObjectURL(objectUrl);
      previewObjectUrl = null;
    }
  }
}
