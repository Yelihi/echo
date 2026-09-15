import { PageEnter } from "@/shared/components/motion/PageEnter";
import type { RecordingSessionViewProps } from "@/views/recording/models/ui";

export type { RecordingPhase, RecordingPillar } from "@/views/recording/models/interface";

export function RecordingSessionView({ pillar, children }: RecordingSessionViewProps) {
  return (
    <main
      data-pillar={pillar === "memo" ? "memo" : undefined}
      className="relative min-h-lvh overflow-hidden bg-session-bg text-white"
    >
      <div className="pointer-events-none absolute left-1/2 top-[-520px] h-[900px] w-[min(1600px,120vw)] -translate-x-1/2 rounded-full bg-accent-glow/18 blur-[120px]" />
      <PageEnter>{children}</PageEnter>
    </main>
  );
}
