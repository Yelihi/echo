import type { MemorizationReadyMaterial } from "@/views/memorization/models/ready";
import {
  RecordingSessionView,
  type RecordingPhase,
} from "@/views/recording/ui/RecordingSessionView";

export interface MemorizationRecordingViewProps {
  material: MemorizationReadyMaterial;
  initialPhase?: RecordingPhase;
  autoAdvancePartner?: boolean;
}

export function MemorizationRecordingView({
  material,
  initialPhase,
  autoAdvancePartner,
}: MemorizationRecordingViewProps) {
  return (
    <RecordingSessionView
      pillar="memo"
      backHref="/sentence-memorization"
      closeHref="/sentence-memorization"
      readyLabel="문장 암기"
      title={material.title}
      description={[material.description, "준비가 되면 시작을 눌러 단락 녹음을 시작하세요."]}
      meta={[
        `문단 ${material.paragraphCount}개`,
        `약 ${material.estimatedMinutes}분`,
        `난이도 ${material.difficulty}`,
      ]}
      totalSteps={material.paragraphCount}
      activeStep={Math.min(1, material.paragraphCount)}
      initialPhase={initialPhase}
      autoAdvancePartner={autoAdvancePartner}
    />
  );
}
