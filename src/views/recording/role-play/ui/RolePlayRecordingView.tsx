import type { RoleplayReadyMaterial } from "@/views/role-play/models/ready";
import {
  RecordingSessionView,
  type RecordingPhase,
} from "@/views/recording/ui/RecordingSessionView";

export interface RolePlayRecordingViewProps {
  material: RoleplayReadyMaterial;
  initialPhase?: RecordingPhase;
  autoAdvancePartner?: boolean;
}

export function RolePlayRecordingView({
  material,
  initialPhase,
  autoAdvancePartner,
}: RolePlayRecordingViewProps) {
  return (
    <RecordingSessionView
      pillar="roleplay"
      backHref="/role-playing"
      closeHref="/role-playing"
      readyLabel="롤플레잉"
      title={material.title}
      description={[material.description, "준비가 되면 시작을 눌러 첫 문장을 들어보세요."]}
      meta={[
        `문장 ${material.lineCount}개`,
        `약 ${material.estimatedMinutes}분`,
        `난이도 ${material.difficulty}`,
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
