import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/shared/lib/tailwind/utils";

export const textareaVariants = cva(
  "group/textarea flex w-full min-w-0 rounded-control border bg-card-surface px-4 py-3.25 text-body-5 leading-relaxed text-black-primary transition-colors outline-none placeholder:text-gray-text-secondary disabled:cursor-not-allowed disabled:border-card-line disabled:bg-gray-background disabled:opacity-60",
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

export interface TextareaProps {
  /** Input 과 동일하게 error 만 시각 variant 입니다. focus/disabled 는 네이티브 상태입니다. */
  state?: VariantProps<typeof textareaVariants>["state"];
}

/**
 * 여러 줄 텍스트 입력. Input 의 여러 줄 대응이며 높이는 호출자가 정합니다
 * (기본은 브라우저 rows, 필요하면 className 으로 min-h-* 를 주세요).
 */
export const Textarea = ({
  className,
  state,
  ...props
}: TextareaProps & React.ComponentProps<"textarea">) => {
  return (
    <textarea
      data-slot="textarea"
      data-state={state ?? "default"}
      aria-invalid={state === "error" || undefined}
      className={cn(textareaVariants({ state }), className)}
      {...props}
    />
  );
};
