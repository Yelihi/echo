import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Check, Clock } from "lucide-react";

import { cn } from "@/shared/lib/tailwind/utils";

export const stageRowVariants = cva(
  "group/stage-row flex w-full items-center gap-3 transition-opacity",
  {
    variants: {
      state: {
        pending: "opacity-40",
        active: "opacity-100",
        done: "opacity-85",
      },
    },
    defaultVariants: {
      state: "pending",
    },
  },
);

export const stageRowIconVariants = cva(
  "flex size-7.5 shrink-0 items-center justify-center rounded-full border-2 transition-colors [&_svg]:size-3.75",
  {
    variants: {
      state: {
        pending: "border-session-glass-line text-white",
        active: "border-accent-glow text-accent-glow",
        done: "border-accent-600 bg-accent-600 text-white",
      },
    },
    defaultVariants: {
      state: "pending",
    },
  },
);

export type StageRowState = NonNullable<VariantProps<typeof stageRowVariants>["state"]>;

const stateIcons: Record<StageRowState, React.ReactNode> = {
  pending: <Clock />,
  active: <Clock />,
  done: <Check />,
};

export interface StageRowProps {
  state?: StageRowState;
  /** 상태별 기본 아이콘을 바꾸고 싶을 때 */
  icon?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * 분석 진행 단계 한 줄. 세션 화면(다크 스테이지) 위에서 쓰입니다.
 */
export const StageRow = ({
  className,
  state,
  icon,
  children,
  ...props
}: StageRowProps & React.ComponentProps<"div">) => {
  const resolvedState = state ?? "pending";

  return (
    <div
      data-slot="stage-row"
      data-state={resolvedState}
      className={cn(stageRowVariants({ state }), className)}
      {...props}
    >
      <span className={cn(stageRowIconVariants({ state }))}>
        {icon ?? stateIcons[resolvedState]}
      </span>
      <span
        className={cn(
          "flex-1 text-body-4 font-bold",
          resolvedState === "active" ? "text-accent-glow" : "text-white",
        )}
      >
        {children}
      </span>
    </div>
  );
};
