import type { SessionTopBarProps } from "@/views/recording/models/ui";
import Link from "next/link";
import { ChevronLeft, X } from "lucide-react";

import { getRecordingProgress } from "@/views/recording/models/recordingSessionProgress";

export function SessionTopBar({ backHref, close, current, total }: SessionTopBarProps) {
  const Icon = close ? X : ChevronLeft;

  return (
    <header className="relative z-10 flex h-20 items-center gap-4 px-6 py-5">
      <Link
        href={backHref}
        aria-label={close ? "세션 종료" : "이전 화면으로 돌아가기"}
        className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-session-glass-line bg-session-glass text-white backdrop-blur-xl transition-colors hover:bg-white/12 focus-visible:ring-2 focus-visible:ring-accent-glow/40 focus-visible:outline-none"
      >
        <Icon className="size-[18px]" />
      </Link>
      <div className="h-[5px] min-w-0 flex-1 overflow-hidden rounded-full bg-session-glass-line">
        <div
          className="h-full rounded-full bg-accent-glow transition-[width]"
          style={{ width: `${getRecordingProgress(current, total)}%` }}
        />
      </div>
      <p className="w-8 shrink-0 text-right text-body-3 font-medium text-white">
        {current} / {total}
      </p>
    </header>
  );
}
