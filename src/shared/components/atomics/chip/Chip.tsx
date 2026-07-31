import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/shared/lib/tailwind/utils";

export const chipVariants = cva(
  "group/chip inline-flex h-6.75 w-fit shrink-0 items-center gap-1.5 rounded-full px-3 text-body-1 font-bold whitespace-nowrap [&_svg]:size-3 [&_svg]:shrink-0",
  {
    variants: {
      tone: {
        neutral: "bg-neutral-100 text-gray-text",
        /** 활성 필라를 따라갑니다 */
        accent: "bg-accent-50 text-accent-700",
        roleplay: "bg-blue-secondary text-blue-focus-title",
        memo: "bg-deep-blue-secondary text-deep-blue-primary",
        positive: "bg-green-secondary text-green-primary",
        warning: "bg-yellow-secondary text-yellow-primary",
        negative: "bg-red-secondary text-red-primary",
        outline: "border border-card-line-strong text-gray-text",
      },
    },
    defaultVariants: {
      tone: "neutral",
    },
  },
);

export interface ChipProps {
  tone?: VariantProps<typeof chipVariants>["tone"];
  children: React.ReactNode;
}

/**
 * 읽기 전용 상태·카테고리 표시.
 *
 * 누를 수 있는 필터에는 TagChip 을 쓰세요.
 * 도메인 의미가 붙은 상태 표시는 Badge / SessionStateBadge 를 씁니다.
 */
export const Chip = ({
  className,
  tone,
  children,
  ...props
}: ChipProps & React.ComponentProps<"span">) => {
  return (
    <span
      data-slot="chip"
      data-tone={tone ?? "neutral"}
      className={cn(chipVariants({ tone }), className)}
      {...props}
    >
      {children}
    </span>
  );
};
