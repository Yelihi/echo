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
        key={`${sessionId ?? material.id}:${phase}:${resume?.step ?? 1}:${material.lineCount}`}
        config={{
          navigation: {
            backHref: sessionId ? "/sessions" : `/role-playing/${material.id}/ready`,
            closeHref: "/role-playing",
          },
          ready: {
            label: "롤플레잉",
            title: material.title,
            description: [
              material.description,
              resume
                ? resume.closingPartner
                  ? "모든 문장을 저장했습니다. 마지막 상대방 대사를 듣고 연습을 마무리하세요."
                  : `${resume.step}번째 문장부터 이어서 연습합니다. 저장하지 않은 녹음은 복원되지 않습니다.`
                : "준비가 되면 시작을 눌러 첫 문장을 들어보세요.",
            ],
            startLabel: resume?.closingPartner
              ? "마지막 대사 듣고 마무리"
              : resume
                ? "이어서 연습"
                : "시작하기",
            meta: [
              resume
                ? `${resume.savedCount ?? Math.max(0, resume.step - 1)}/${material.learnerTurnCount}문장 저장`
                : `문장 ${material.lineCount}개`,
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
