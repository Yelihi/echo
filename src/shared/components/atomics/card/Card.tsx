import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/shared/lib/tailwind/utils";

export const cardVariants = cva("group/card bg-card-surface border border-card-line", {
  variants: {
    variant: {
      /** 기본 컨테이너. 살짝 떠 있는 느낌으로 콘텐츠를 묶습니다. */
      raised: "rounded-card shadow-emphasize",
      /** 리스트 행처럼 반복되는 컨테이너. 그림자를 빼 시각 소음을 줄입니다. */
      flat: "rounded-panel",
    },
  },
  defaultVariants: {
    variant: "raised",
  },
});

export interface CardProps {
  variant?: VariantProps<typeof cardVariants>["variant"];
}

/**
 * 콘텐츠 컨테이너.
 *
 * 패딩은 담는 내용에 따라 달라지므로 기본값을 주지 않습니다 — 호출자가 정합니다.
 */
export const Card = ({ className, variant, ...props }: CardProps & React.ComponentProps<"div">) => {
  return (
    <div
      data-slot="card"
      data-variant={variant ?? "raised"}
      className={cn(cardVariants({ variant }), className)}
      {...props}
    />
  );
};
