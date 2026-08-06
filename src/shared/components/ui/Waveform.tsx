import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/shared/lib/tailwind/utils";

export const waveformVariants = cva("group/waveform flex h-14 items-center justify-center gap-1", {
  variants: {
    tone: {
      accent: "[&>i]:bg-accent-glow",
      recording: "[&>i]:bg-red-primary",
    },
  },
  defaultVariants: {
    tone: "accent",
  },
});

/** 값이 없을 때 보여줄 기본 막대 높이(%) */
const DEFAULT_LEVELS = [18, 39, 61, 32, 79, 50, 21, 68, 43, 54, 29, 14];

export interface WaveformProps {
  /**
   * 막대 높이 배열(0–100). 오디오 레벨은 호출자가 계산해 넘깁니다 —
   * 컴포넌트는 오디오에 접근하지 않습니다.
   */
  levels?: number[];
  /** 실제 오디오 레벨 없이 녹음 중임을 보여주는 반복 애니메이션 */
  animated?: boolean;
  tone?: VariantProps<typeof waveformVariants>["tone"];
}

/**
 * 녹음 레벨 미터. 받은 값을 막대로 그리기만 합니다.
 */
export const Waveform = ({
  className,
  levels = DEFAULT_LEVELS,
  animated = false,
  tone,
  ...props
}: WaveformProps & React.ComponentProps<"div">) => {
  return (
    <div
      data-slot="waveform"
      data-waveform-animated={animated || undefined}
      aria-hidden="true"
      className={cn(waveformVariants({ tone }), className)}
      {...props}
    >
      {levels.map((level, index) => (
        <i
          key={index}
          className="w-1 rounded-sm"
          /* 막대 높이는 런타임 값이라 유틸리티로 표현할 수 없습니다. */
          style={{
            animationDelay: animated ? `${index * 70}ms` : undefined,
            height: `${Math.min(100, Math.max(0, level))}%`,
          }}
        />
      ))}
    </div>
  );
};
