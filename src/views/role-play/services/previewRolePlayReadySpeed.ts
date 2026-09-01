"use client";

// views
import { useRolePlayReadyStore } from "@/views/role-play/models/stores/rolePlayReadyStore";
import { playRolePlayVoicePreview } from "@/views/role-play/services/playRolePlayVoicePreview";

export async function previewRolePlayReadySpeed(speed: number) {
  await playRolePlayVoicePreview({
    voice: useRolePlayReadyStore.getState().settings.voice,
    speed,
  });
}
