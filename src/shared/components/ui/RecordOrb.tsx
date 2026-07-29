"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { AudioLines, Mic, Square } from "lucide-react";

import { cn } from "@/shared/lib/tailwind/utils";

export const recordOrbVariants = cva(
  "group/record-orb relative grid size-46 shrink-0 place-items-center",
);

export const recordOrbButtonVariants = cva(
  "relative z-10 inline-flex size-33 cursor-pointer items-center justify-center rounded-full text-white shadow-orb transition-transform outline-none hover:scale-103 active:scale-98 focus-visible:ring-4 focus-visible:ring-accent-glow/40 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-11",
  {
    variants: {
      state: {
        idle: "bg-accent-500",
        recording: "bg-red-primary",
        analyzing: "bg-accent-500",
      },
    },
    defaultVariants: {
      state: "idle",
    },
  },
);

export const recordOrbHaloVariants = cva(
  "pointer-events-none absolute size-46 rounded-full border opacity-45",
  {
    variants: {
      state: {
        idle: "border-accent-glow",
        recording: "border-red-primary",
        analyzing: "border-accent-glow",
      },
    },
    defaultVariants: {
      state: "idle",
    },
  },
);

export type RecordOrbState = NonNullable<VariantProps<typeof recordOrbButtonVariants>["state"]>;

/** 상태별 기본 아이콘. 클래스가 아니라 노드를 고르는 분기라 조회 테이블입니다. */
const stateIcons: Record<RecordOrbState, React.ReactNode> = {
  idle: <Mic />,
  recording: <Square />,
  analyzing: <AudioLines />,
};

export interface RecordOrbProps {
  state?: RecordOrbState;
  /** 상태별 기본 아이콘을 바꾸고 싶을 때 */
  icon?: React.ReactNode;
  onToggle?: () => void;
  /** 스크린리더 라벨 */
  label?: string;
}

/**
 * 세션 화면의 녹음 버튼.
 *
 * 녹음 상태를 스스로 갖지 않습니다 — 호흡하는 헤일로와 색만 state 에 따라 바뀝니다.
 * 실제 애니메이션(호흡·펄스)은 화면 단에서 추가합니다.
 */
export const RecordOrb = ({
  className,
  state,
  icon,
  onToggle,
  label,
  ...props
}: RecordOrbProps & React.ComponentProps<"div">) => {
  const resolvedState = state ?? "idle";

  return (
    <div
      data-slot="record-orb"
      data-state={resolvedState}
      className={cn(recordOrbVariants(), className)}
      {...props}
    >
      <span className={cn(recordOrbHaloVariants({ state }))} />
      <button
        type="button"
        onClick={onToggle}
        aria-label={label ?? (resolvedState === "recording" ? "녹음 중지" : "녹음 시작")}
        className={cn(recordOrbButtonVariants({ state }))}
      >
        {icon ?? stateIcons[resolvedState]}
      </button>
    </div>
  );
};
