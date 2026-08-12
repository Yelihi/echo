import { MEMORIZATION_READY_MODE_OPTIONS } from "@/views/memorization/config/const";
import type {
  MemorizationReadyMaterial,
  MemorizationReadySettings,
} from "@/views/memorization/models/ready";
import {
  RecordingSessionView,
  type RecordingPhase,
} from "@/views/recording/ui/RecordingSessionView";

export interface MemorizationRecordingViewProps {
  material: MemorizationReadyMaterial;
  settings?: MemorizationReadySettings;
  initialPhase?: RecordingPhase;
  autoAdvancePartner?: boolean;
}

export function MemorizationRecordingView({
  material,
  settings,
  initialPhase,
  autoAdvancePartner,
}: MemorizationRecordingViewProps) {
  const selectedMode = settings
    ? MEMORIZATION_READY_MODE_OPTIONS.find((option) => option.value === settings.mode)
    : null;

  return (
    <RecordingSessionView
      pillar="memo"
      backHref={`/sentence-memorization/${material.id}/ready`}
      closeHref="/sentence-memorization"
      readyLabel="문장 암기"
      title={material.title}
      description={[material.description, "준비가 되면 시작을 눌러 단락 녹음을 시작하세요."]}
      meta={[
        `문단 ${material.paragraphCount}개`,
        `약 ${material.estimatedMinutes}분`,
        `난이도 ${material.difficulty}`,
        ...(selectedMode ? [`모드 ${selectedMode.title}`] : []),
      ]}
      totalSteps={material.paragraphCount}
      activeStep={Math.min(1, material.paragraphCount)}
      initialPhase={initialPhase}
      autoAdvancePartner={autoAdvancePartner}
    />
  );
}
