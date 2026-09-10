import type { MemorizationRecordingViewProps } from "@/views/recording/models/ui";
import { MEMORIZATION_READY_MODE_OPTIONS } from "@/features/memorization-sessions/config/ready";
import { RecordingSessionView } from "@/views/recording/ui/common/RecordingSessionView";
import { MemorizationRecordingClient } from "@/views/recording/ui/memorization/MemorizationRecordingClient";

export function MemorizationRecordingView({
  material,
  settings,
  initialPhase,
  saveRecording,
}: MemorizationRecordingViewProps) {
  const phase = initialPhase ?? "ready";
  const selectedMode = settings
    ? MEMORIZATION_READY_MODE_OPTIONS.find((option) => option.value === settings.mode)
    : null;

  return (
    <RecordingSessionView pillar="memo">
      <MemorizationRecordingClient
        key={`${material.id}:${phase}:${material.paragraphCount}`}
        config={{
          navigation: {
            backHref: `/sentence-memorization/${material.id}/ready`,
            closeHref: "/sentence-memorization",
          },
          ready: {
            label: "문장 암기",
            title: material.title,
            description: [material.description, "준비가 되면 시작을 눌러 단락 녹음을 시작하세요."],
            meta: [
              `문단 ${material.paragraphCount}개`,
              `약 ${material.estimatedMinutes}분`,
              `난이도 ${material.difficulty}`,
              ...(selectedMode ? [`모드 ${selectedMode.title}`] : []),
            ],
            previewLabel: "단락 미리 보기",
            previewLines: material.previewLines ?? [],
          },
          initial: {
            initialPhase: phase,
            activeStep: Math.min(1, material.paragraphCount),
            totalSteps: material.paragraphCount,
            demoDurationMs: 12000,
          },
        }}
        saveRecording={saveRecording}
      />
    </RecordingSessionView>
  );
}
