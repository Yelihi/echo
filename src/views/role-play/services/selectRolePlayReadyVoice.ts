"use client";

// views
import type { RoleplayReadyVoice } from "@/views/role-play/models/interface";
import { useRolePlayReadyStore } from "@/views/role-play/models/stores/rolePlayReadyStore";
import { playRolePlayVoicePreview } from "@/views/role-play/services/playRolePlayVoicePreview";

export async function selectRolePlayReadyVoice(voice: RoleplayReadyVoice) {
  const { setVoice, settings } = useRolePlayReadyStore.getState();
  setVoice(voice);
  await playRolePlayVoicePreview({ voice, speed: settings.speed });
}
