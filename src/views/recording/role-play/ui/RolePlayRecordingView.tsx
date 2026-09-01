"use client";

import { useCallback } from "react";

// shared
import { decodeTtsAudioBase64 } from "@/shared/lib/tts/decodeTtsAudioBase64";

// views
import {
  ROLE_PLAY_READY_EVALUATION_MODES,
  ROLE_PLAY_READY_ROLE_OPTIONS,
  ROLE_PLAY_READY_VOICE_OPTIONS,
} from "@/views/role-play/config/const";
import type {
  RoleplayReadyMaterial,
  RoleplayReadySettings,
} from "@/views/role-play/models/interface";
import { speakRolePlayPartnerLine } from "@/views/role-play/services/action/speakRolePlayPartnerLine";
import {
  RecordingSessionView,
  type RecordingPhase,
} from "@/views/recording/ui/RecordingSessionView";

export interface RolePlayRecordingViewProps {
  material: RoleplayReadyMaterial;
  sessionId?: string;
  settings?: RoleplayReadySettings;
  initialPhase?: RecordingPhase;
  autoAdvancePartner?: boolean;
}

export function RolePlayRecordingView({
  material,
  sessionId,
  settings,
  initialPhase,
  autoAdvancePartner,
}: RolePlayRecordingViewProps) {
  const settingsSummary = settings ? getSettingsSummary(settings) : [];
  const partnerLine = material.partnerLine;
  const speakPartnerLine = useCallback(async () => {
    if (!sessionId || !partnerLine) {
      return null;
    }

    const result = await speakRolePlayPartnerLine({
      mode: "session",
      sessionId,
    });

    if (result.code !== "SUCCESS") {
      return null;
    }

    return decodeTtsAudioBase64(result.audioBase64, result.mimeType);
  }, [partnerLine, sessionId]);

  return (
    <RecordingSessionView
      pillar="roleplay"
      backHref={`/role-playing/${material.id}/ready`}
      closeHref="/role-playing"
      readyLabel="롤플레잉"
      title={material.title}
      description={[material.description, "준비가 되면 시작을 눌러 첫 문장을 들어보세요."]}
      meta={[
        `문장 ${material.lineCount}개`,
        `약 ${material.estimatedMinutes}분`,
        ...settingsSummary,
      ]}
      totalSteps={material.lineCount}
      activeStep={Math.min(3, material.lineCount)}
      partnerRole={material.partnerRole}
      partnerLine={partnerLine}
      initialPhase={initialPhase}
      autoAdvancePartner={autoAdvancePartner}
      speakPartnerLine={sessionId && partnerLine ? speakPartnerLine : undefined}
    />
  );
}

function getSettingsSummary(settings: RoleplayReadySettings): string[] {
  const role = ROLE_PLAY_READY_ROLE_OPTIONS.find((option) => option.value === settings.role);
  const evaluationMode = ROLE_PLAY_READY_EVALUATION_MODES.find(
    (option) => option.value === settings.evaluationMode,
  );
  const voice = ROLE_PLAY_READY_VOICE_OPTIONS.find((option) => option.value === settings.voice);

  return [
    role ? `역할 ${role.title}` : null,
    evaluationMode ? `평가 ${evaluationMode.title}` : null,
    voice ? `음성 ${voice.label}` : null,
    `속도 ${settings.speed.toFixed(1)}x`,
  ].filter((item): item is string => Boolean(item));
}
