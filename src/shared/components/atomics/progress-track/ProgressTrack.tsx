"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Progress as ProgressPrimitive } from "radix-ui";

import { cn } from "@/shared/lib/tailwind/utils";

export const progressTrackVariants = cva(
  "group/progress-track relative w-full overflow-hidden rounded-full bg-neutral-150",
  {
    variants: {
      size: {
        /** PlayPill 등 좁은 자리용 4px */
        sm: "h-1",
        /** 기본 6px */
        default: "h-1.5",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

export interface ProgressTrackProps {
  /** 진행률 0–100. 범위를 벗어난 값은 렌더 시점에 clamp 됩니다. */
  value?: number | null;
}

/**
 * 진행 바. 값 계산이나 타이머는 갖지 않으며 받은 값을 그리기만 합니다.
 */
export const ProgressTrack = ({
  className,
  size,
  value,
  ...props
}: ProgressTrackProps &
  Omit<React.ComponentProps<typeof ProgressPrimitive.Root>, "value"> &
  VariantProps<typeof progressTrackVariants>) => {
  const percentage = Math.min(100, Math.max(0, value ?? 0));

  return (
    <ProgressPrimitive.Root
      data-slot="progress-track"
      data-size={size ?? "default"}
      value={percentage}
      className={cn(progressTrackVariants({ size }), className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-track-indicator"
        className="size-full rounded-full bg-accent-600 transition-transform duration-300"
        /* 진행률은 런타임 값이라 유틸리티 클래스로 표현할 수 없는 유일한 인라인 스타일입니다. */
        style={{ transform: `translateX(-${100 - percentage}%)` }}
      />
    </ProgressPrimitive.Root>
  );
};
