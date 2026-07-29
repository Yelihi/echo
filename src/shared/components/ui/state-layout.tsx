import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/shared/lib/tailwind/utils";

/**
 * EmptyState / ErrorState / LoadingState 가 공유하는 내부 뼈대입니다.
 * 세 컴포넌트의 골격이 동일해 중복을 막으려고 분리했으며, 배럴로 내보내지 않습니다.
 */
export const stateLayoutVariants = cva(
  "flex w-full flex-col items-center gap-5 px-5 py-17.5 text-center",
);

export const stateIllustrationVariants = cva("flex shrink-0 items-center justify-center", {
  variants: {
    tone: {
      empty:
        "size-24 rounded-hero border border-accent-100 bg-accent-50 text-accent-500 [&_svg]:size-9.5",
      error: "size-22 rounded-hero bg-yellow-secondary text-yellow-primary [&_svg]:size-9",
      loading: "size-16 rounded-full",
    },
  },
  defaultVariants: {
    tone: "empty",
  },
});

export interface StateLayoutProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  /** 일러스트 박스 안에 들어갈 노드(보통 아이콘 또는 Spinner) */
  illustration: React.ReactNode;
  /** 하단 액션 슬롯. 호출자가 Button 인스턴스를 그대로 넣습니다. */
  action?: React.ReactNode;
}

export const StateLayout = ({
  title,
  description,
  illustration,
  action,
  tone,
  className,
  ...props
}: StateLayoutProps &
  React.ComponentProps<"div"> &
  VariantProps<typeof stateIllustrationVariants>) => {
  return (
    <div className={cn(stateLayoutVariants(), className)} {...props}>
      <div className={cn(stateIllustrationVariants({ tone }))}>{illustration}</div>
      <div className="flex flex-col items-center gap-2">
        <p className="text-heading-sm font-bold text-black-primary">{title}</p>
        {description ? <p className="text-body-3 text-gray-text">{description}</p> : null}
      </div>
      {action}
    </div>
  );
};
