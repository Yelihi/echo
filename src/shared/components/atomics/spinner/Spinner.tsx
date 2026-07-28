import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { LoaderCircle } from "lucide-react";

import { cn } from "@/shared/lib/tailwind/utils";

export const spinnerVariants = cva("shrink-0 animate-spin stroke-3 text-accent-500", {
  variants: {
    size: {
      sm: "size-5",
      default: "size-8",
      lg: "size-12",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

export interface SpinnerProps {
  /** 스크린리더에 읽힐 라벨. 화면에는 보이지 않습니다. */
  label?: string;
}

/**
 * 로딩 인디케이터. 회전은 CSS 애니메이션이라 클라이언트 경계가 필요 없습니다.
 *
 * 색은 `text-accent-500` 이므로 `data-pillar="memo"` 안에서는 네이비로 전환됩니다.
 */
export const Spinner = ({
  className,
  size,
  label = "로딩 중",
  ...props
}: SpinnerProps &
  React.ComponentProps<typeof LoaderCircle> &
  VariantProps<typeof spinnerVariants>) => {
  return (
    <LoaderCircle
      data-slot="spinner"
      data-size={size ?? "default"}
      role="status"
      aria-label={label}
      className={cn(spinnerVariants({ size }), className)}
      {...props}
    />
  );
};
