import * as React from "react";

import { ProgressTrack } from "@/shared/components/atomics/progress-track/ProgressTrack";
import { cn } from "@/shared/lib/tailwind/utils";

export interface SliderFieldProps {
  label: React.ReactNode;
  valueLabel: React.ReactNode;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
  minLabel?: React.ReactNode;
  midLabel?: React.ReactNode;
  maxLabel?: React.ReactNode;
}

/**
 * 라벨/현재값 줄 + 트랙 + 최소·중간·최대 캡션으로 구성된 슬라이더.
 * 롤플레잉 세션 준비 화면의 말하기 속도 조절에 씁니다.
 */
export const SliderField = ({
  className,
  label,
  valueLabel,
  min,
  max,
  step,
  value,
  onChange,
  minLabel,
  midLabel,
  maxLabel,
  ...props
}: SliderFieldProps & Omit<React.ComponentProps<"div">, "onChange">) => {
  const percentage = ((value - min) / (max - min)) * 100;
  const labelId = React.useId();

  return (
    <div data-slot="slider-field" className={cn("flex flex-col gap-2", className)} {...props}>
      <div className="flex items-center justify-between text-body-3">
        <span id={labelId} className="text-gray-text">
          {label}
        </span>
        <span className="font-bold text-accent-700 tabular-nums">{valueLabel}</span>
      </div>
      {/* ProgressTrack 은 시각적 트랙만 그리고(스크린리더에는 숨김), 실제 조작은 위에 겹친 투명
          range 입력이 맡습니다. 래퍼는 트랙(6px)보다 넉넉히 키워 터치 영역을 확보합니다. */}
      <div className="relative flex h-6 w-full items-center">
        <ProgressTrack value={percentage} aria-hidden="true" />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-labelledby={labelId}
          className="absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent [&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-accent-600 [&::-moz-range-thumb]:bg-white [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-accent-600 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow"
        />
      </div>
      {(minLabel || midLabel || maxLabel) && (
        <div className="flex items-center justify-between text-body-1 text-gray-text-secondary">
          <span>{minLabel}</span>
          <span>{midLabel}</span>
          <span>{maxLabel}</span>
        </div>
      )}
    </div>
  );
};
