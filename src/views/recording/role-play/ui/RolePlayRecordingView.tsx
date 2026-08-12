import {
  ROLE_PLAY_READY_EVALUATION_MODES,
  ROLE_PLAY_READY_ROLE_OPTIONS,
  ROLE_PLAY_READY_VOICE_OPTIONS,
} from "@/views/role-play/config/const";
import type { RoleplayReadyMaterial, RoleplayReadySettings } from "@/views/role-play/models/ready";
import {
  RecordingSessionView,
  type RecordingPhase,
} from "@/views/recording/ui/RecordingSessionView";

export interface RolePlayRecordingViewProps {
  material: RoleplayReadyMaterial;
  settings?: RoleplayReadySettings;
  initialPhase?: RecordingPhase;
  autoAdvancePartner?: boolean;
}

export function RolePlayRecordingView({
  material,
  settings,
  initialPhase,
  autoAdvancePartner,
}: RolePlayRecordingViewProps) {
  const settingsSummary = settings ? getSettingsSummary(settings) : [];

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
        `난이도 ${material.difficulty}`,
        ...settingsSummary,
      ]}
      totalSteps={material.lineCount}
      activeStep={Math.min(3, material.lineCount)}
      partnerRole="BARISTA"
      partnerLine="What can I get started for you today?"
      initialPhase={initialPhase}
      autoAdvancePartner={autoAdvancePartner}
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
