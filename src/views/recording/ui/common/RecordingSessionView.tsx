import { PageEnter } from "@/shared/components/motion/PageEnter";
import type { RecordingSessionViewProps } from "@/views/recording/models/ui";

export type { RecordingPhase, RecordingPillar } from "@/views/recording/models/interface";

export function RecordingSessionView({ pillar, children }: RecordingSessionViewProps) {
  return (
    <main
      data-pillar={pillar === "memo" ? "memo" : undefined}
      className="relative min-h-lvh bg-card-surface text-black-primary"
    >
      <PageEnter>{children}</PageEnter>
    </main>
  );
}
