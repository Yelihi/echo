import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/shared/lib/tailwind/utils";

export const inputVariants = cva(
  "group/input flex h-12 w-full min-w-0 rounded-control border bg-card-surface px-4 text-body-4 text-black-primary transition-colors outline-none placeholder:text-gray-text-secondary disabled:cursor-not-allowed disabled:border-card-line disabled:bg-gray-background disabled:opacity-60",
  {
    variants: {
      state: {
        default:
          "border-card-line-strong focus-visible:border-accent-500 focus-visible:inset-ring-1 focus-visible:inset-ring-accent-500",
        error: "border-red-primary inset-ring-1 inset-ring-red-primary",
      },
    },
    defaultVariants: {
      state: "default",
    },
  },
);

export interface InputProps {
  /**
   * 시각적 상태. Figma 의 focus / disabled 는 CSS 상태라 여기 포함하지 않고
   * 네이티브 속성(`disabled`, `:focus-visible`)으로 처리합니다.
   */
  state?: VariantProps<typeof inputVariants>["state"];
}

/**
 * 단일 줄 텍스트 입력.
 *
 * `state="error"` 를 주면 `aria-invalid` 가 함께 설정되어 시각 상태와 접근성 상태가
 * 어긋나지 않습니다. 값 관리는 호출자 몫입니다(제어/비제어 모두 그대로 통과).
 */
export const Input = ({
  className,
  state,
  type = "text",
  ...props
}: InputProps & Omit<React.ComponentProps<"input">, "size">) => {
  return (
    <input
      type={type}
      data-slot="input"
      data-state={state ?? "default"}
      aria-invalid={state === "error" || undefined}
      className={cn(inputVariants({ state }), className)}
      {...props}
    />
  );
};
