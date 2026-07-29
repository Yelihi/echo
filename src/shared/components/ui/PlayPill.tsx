import * as React from "react";
import { cva } from "class-variance-authority";
import { Pause, Play } from "lucide-react";

import { ProgressTrack } from "@/shared/components/atomics/progress-track/ProgressTrack";
import { cn } from "@/shared/lib/tailwind/utils";

export const playPillVariants = cva(
  "group/play-pill inline-flex w-fit items-center gap-2 rounded-full border border-card-line-strong bg-card-surface py-1.5 pr-3.5 pl-1.5",
);

const playPillButtonVariants = cva(
  "inline-flex size-7.5 shrink-0 cursor-pointer items-center justify-center rounded-full bg-accent-600 text-white transition-colors outline-none hover:bg-accent-700 focus-visible:ring-2 focus-visible:ring-accent-500/30 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-3.25 [&_svg]:fill-current",
);

/** 재생/일시정지 버튼. PlayPill 내부 전용이라 내보내지 않습니다. */
const PlayPillButton = ({
  playing,
  onToggle,
  ...props
}: { playing: boolean; onToggle?: () => void } & React.ComponentProps<"button">) => {
  return (
    <button
      type="button"
      data-slot="play-pill-button"
      aria-label={playing ? "일시정지" : "재생"}
      onClick={onToggle}
      className={cn(playPillButtonVariants())}
      {...props}
    >
      {playing ? <Pause /> : <Play />}
    </button>
  );
};

/** 진행 바. 폭만 고정하고 그리기는 ProgressTrack 에 위임합니다. */
const PlayPillProgress = ({ value }: { value: number }) => {
  return <ProgressTrack data-slot="play-pill-progress" size="sm" value={value} className="w-23" />;
};

/** 재생 시간. 숫자 폭이 흔들리지 않도록 tabular-nums 를 씁니다. */
const PlayPillDuration = ({ children }: { children: React.ReactNode }) => {
  return (
    <span data-slot="play-pill-duration" className="text-body-1 text-gray-text tabular-nums">
      {children}
    </span>
  );
};

export interface PlayPillProps {
  /** 재생 중이면 true. 내부 상태를 갖지 않으므로 호출자가 소유합니다. */
  playing?: boolean;
  /** 진행률 0–100 */
  progress?: number;
  /**
   * 이미 포맷된 시간 문자열(예: "0:06").
   * 포맷 규칙(자릿수·시간 단위 표기)은 제품 정책이라 컴포넌트가 정하지 않습니다.
   */
  duration: React.ReactNode;
  onToggle?: () => void;
}

/**
 * 녹음 재생 컨트롤.
 *
 * 오디오 요소나 타이머를 갖지 않습니다 — 재생 상태·진행률·시간을 전부 props 로 받아
 * 그리기만 합니다.
 */
export const PlayPill = ({
  className,
  playing = false,
  progress = 0,
  duration,
  onToggle,
  ...props
}: PlayPillProps & React.ComponentProps<"div">) => {
  return (
    <div data-slot="play-pill" className={cn(playPillVariants(), className)} {...props}>
      <PlayPillButton playing={playing} onToggle={onToggle} />
      <PlayPillProgress value={progress} />
      <PlayPillDuration>{duration}</PlayPillDuration>
    </div>
  );
};
