import * as React from "react";
import { cva } from "class-variance-authority";

import { cn } from "@/shared/lib/tailwind/utils";

export const timerPillVariants = cva(
  "group/timer-pill inline-flex items-center gap-2 rounded-full border border-session-glass-line bg-session-glass px-3.75 py-2 text-body-4 font-bold text-white tabular-nums",
);

export interface TimerPillProps {
  /** 이미 포맷된 시간 문자열(예: "00:12"). 포맷 규칙은 호출자가 정합니다. */
  children: React.ReactNode;
  /** 녹음 중 점멸하는 빨간 점 노출 여부 */
  recording?: boolean;
}

/**
 * 세션 화면의 녹음 시간 표시. 다크 스테이지 위에서 쓰입니다.
 * 타이머를 돌리지 않고 받은 문자열을 보여주기만 합니다.
 */
export const TimerPill = ({
  className,
  children,
  recording = true,
  ...props
}: TimerPillProps & React.ComponentProps<"div">) => {
  return (
    <div data-slot="timer-pill" className={cn(timerPillVariants(), className)} {...props}>
      {recording ? (
        <span aria-hidden="true" className="size-2.25 shrink-0 rounded-full bg-red-primary" />
      ) : null}
      {children}
    </div>
  );
};
