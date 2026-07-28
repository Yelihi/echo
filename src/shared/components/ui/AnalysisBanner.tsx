import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { AudioLines, CircleCheck, Clock, TriangleAlert } from "lucide-react";

import { cn } from "@/shared/lib/tailwind/utils";

export const analysisBannerVariants = cva(
  "group/analysis-banner flex w-full items-center gap-3 rounded-panel border px-5 py-4",
  {
    variants: {
      state: {
        pending: "border-card-line bg-card-surface",
        analyzing: "border-accent-100 bg-accent-50",
        done: "border-green-secondary bg-green-secondary",
        partial: "border-yellow-secondary bg-yellow-secondary",
      },
    },
    defaultVariants: {
      state: "pending",
    },
  },
);

export const analysisBannerIconVariants = cva(
  "flex size-10 shrink-0 items-center justify-center rounded-control [&_svg]:size-5",
  {
    variants: {
      state: {
        pending: "bg-neutral-100 text-gray-text",
        analyzing: "bg-accent-100 text-accent-700",
        done: "bg-green-secondary text-green-primary",
        partial: "bg-yellow-secondary text-yellow-primary",
      },
    },
    defaultVariants: {
      state: "pending",
    },
  },
);

export type AnalysisBannerState = NonNullable<VariantProps<typeof analysisBannerVariants>["state"]>;

/**
 * 상태별 기본 아이콘. 클래스가 아니라 노드를 고르는 분기라 cva 가 아닌 조회 테이블입니다.
 */
const stateIcons: Record<AnalysisBannerState, React.ReactNode> = {
  pending: <Clock />,
  analyzing: <AudioLines />,
  done: <CircleCheck />,
  partial: <TriangleAlert />,
};

export interface AnalysisBannerProps {
  state?: AnalysisBannerState;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** 상태별 기본 아이콘을 바꾸고 싶을 때 */
  icon?: React.ReactNode;
  /** 우측 액션 슬롯(예: 재시도 버튼) */
  action?: React.ReactNode;
}

/**
 * 분석 상태 배너.
 *
 * 문구는 전부 props 입니다 — 상태별 한국어 카피를 컴포넌트가 들고 있으면
 * 재사용도 다국어 대응도 막히기 때문입니다. 상태가 정하는 것은 색과 기본 아이콘뿐입니다.
 */
export const AnalysisBanner = ({
  className,
  state,
  title,
  description,
  icon,
  action,
  ...props
}: AnalysisBannerProps & React.ComponentProps<"div">) => {
  const resolvedState = state ?? "pending";

  return (
    <div
      data-slot="analysis-banner"
      data-state={resolvedState}
      className={cn(analysisBannerVariants({ state }), className)}
      {...props}
    >
      <span className={cn(analysisBannerIconVariants({ state }))}>
        {icon ?? stateIcons[resolvedState]}
      </span>
      <div className="flex flex-1 flex-col">
        <p className="text-body-4 font-bold text-black-primary">{title}</p>
        {description ? <p className="text-body-2 text-gray-text">{description}</p> : null}
      </div>
      {action}
    </div>
  );
};
