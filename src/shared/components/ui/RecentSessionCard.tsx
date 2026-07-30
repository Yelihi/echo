import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Layers, MessageSquare } from "lucide-react";

import { cn } from "@/shared/lib/tailwind/utils";

export const recentSessionCardVariants = cva(
  "group/recent-session-card flex w-full items-center gap-3 rounded-panel border border-card-line bg-card-surface p-4 text-left transition-shadow hover:shadow-emphasize",
);

export const recentSessionCardIconVariants = cva(
  "flex size-10.5 shrink-0 items-center justify-center rounded-control [&_svg]:size-5",
  {
    variants: {
      kind: {
        roleplay: "bg-blue-secondary text-blue-focus-title",
        memo: "bg-deep-blue-secondary text-deep-blue-primary",
      },
    },
    defaultVariants: {
      kind: "roleplay",
    },
  },
);

export type RecentSessionKind = NonNullable<
  VariantProps<typeof recentSessionCardIconVariants>["kind"]
>;

/** kind 별 기본 아이콘. 클래스가 아니라 노드를 고르는 분기라 조회 테이블입니다. */
const kindIcons: Record<RecentSessionKind, React.ReactNode> = {
  roleplay: <MessageSquare />,
  memo: <Layers />,
};

export interface RecentSessionCardProps {
  kind?: RecentSessionKind;
  title: React.ReactNode;
  /**
   * 보조 정보. 이미 포맷된 문자열을 받습니다 —
   * 날짜 포맷 규칙은 제품 정책이라 컴포넌트가 정하지 않습니다.
   */
  meta?: React.ReactNode;
  /** 우측 상태 슬롯. SessionStateBadge 나 Chip 인스턴스를 넣습니다. */
  status?: React.ReactNode;
  /** kind 별 기본 아이콘을 바꾸고 싶을 때 */
  icon?: React.ReactNode;
}

/**
 * 최근 학습 기록 한 줄.
 *
 * 홈 대시보드와 목록 화면에서 세션 하나를 요약해 보여줍니다.
 */
export const RecentSessionCard = ({
  className,
  kind,
  title,
  meta,
  status,
  icon,
  ...props
}: RecentSessionCardProps & React.ComponentProps<"div">) => {
  const resolvedKind = kind ?? "roleplay";

  return (
    <div
      data-slot="recent-session-card"
      data-kind={resolvedKind}
      className={cn(recentSessionCardVariants(), className)}
      {...props}
    >
      <span className={cn(recentSessionCardIconVariants({ kind }))}>
        {icon ?? kindIcons[resolvedKind]}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="truncate text-body-4 font-bold text-black-primary">{title}</p>
        {meta ? <p className="truncate text-body-1 text-gray-text-secondary">{meta}</p> : null}
      </div>
      {status}
    </div>
  );
};
