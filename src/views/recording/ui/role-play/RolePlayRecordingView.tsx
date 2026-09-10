import type { RolePlayRecordingViewProps } from "@/views/recording/models/ui";
import {
  ROLE_PLAY_READY_EVALUATION_MODES,
  ROLE_PLAY_READY_ROLE_OPTIONS,
  ROLE_PLAY_READY_VOICE_OPTIONS,
} from "@/features/roleplay-sessions/config/ready";
import type { RoleplayReadySettings } from "@/features/roleplay-sessions/models/ready";
import { RecordingSessionView } from "@/views/recording/ui/common/RecordingSessionView";
import { RolePlayRecordingClient } from "@/views/recording/ui/role-play/RolePlayRecordingClient";

export function RolePlayRecordingView({
  material,
  sessionId,
  settings,
  initialPhase,
  autoAdvancePartner,
  saveRecording,
  resume,
}: RolePlayRecordingViewProps) {
  const settingsSummary = settings ? getSettingsSummary(settings) : [];
  const phase = initialPhase ?? resume?.phase ?? "ready";

  return (
    <RecordingSessionView pillar="roleplay">
      <RolePlayRecordingClient
        key={`${sessionId ?? material.id}:${phase}:${material.lineCount}`}
        config={{
          navigation: {
            backHref: `/role-playing/${material.id}/ready`,
            closeHref: "/role-playing",
          },
          ready: {
            label: "롤플레잉",
            title: material.title,
            description: [material.description, "준비가 되면 시작을 눌러 첫 문장을 들어보세요."],
            meta: [
              `문장 ${material.lineCount}개`,
              `약 ${material.estimatedMinutes}분`,
              ...settingsSummary,
            ],
            previewLabel: "문장 미리 보기",
            previewLines: material.previewLines ?? [],
          },
          initial: {
            initialPhase: phase,
            activeStep: resume?.step ?? 1,
            totalSteps: material.recordingTurns?.length ?? material.learnerTurnCount,
            demoDurationMs: 12000,
          },
        }}
        partner={{
          role: material.partnerRole,
          line: material.partnerLine,
          turns: material.recordingTurns,
          closingPartner: resume?.closingPartner,
          sessionId,
          autoAdvance: autoAdvancePartner ?? true,
        }}
        saveRecording={saveRecording}
      />
    </RecordingSessionView>
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
