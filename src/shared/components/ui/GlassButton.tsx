import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/shared/lib/tailwind/utils";

export const glassButtonVariants = cva(
  "group/glass-button inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-panel border px-5 text-body-3 font-bold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-accent-glow/40 disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-4.5 [&_svg]:shrink-0",
  {
    variants: {
      emphasis: {
        secondary: "border-session-glass-line bg-session-glass text-white hover:bg-white/12",
        primary: "border-accent-600 bg-accent-600 text-white hover:bg-accent-700",
      },
    },
    defaultVariants: {
      emphasis: "secondary",
    },
  },
);

export interface GlassButtonProps {
  emphasis?: VariantProps<typeof glassButtonVariants>["emphasis"];
  children: React.ReactNode;
}

/**
 * 세션 화면 전용 버튼.
 *
 * 다크 스테이지 위에서만 쓰세요 — 밝은 화면에서는 대비가 나오지 않습니다.
 * 일반 화면은 Button 을 사용합니다.
 */
export const GlassButton = ({
  className,
  emphasis,
  children,
  ...props
}: GlassButtonProps & React.ComponentProps<"button">) => {
  return (
    <button
      type="button"
      data-slot="glass-button"
      data-emphasis={emphasis ?? "secondary"}
      className={cn(glassButtonVariants({ emphasis }), className)}
      {...props}
    >
      {children}
    </button>
  );
};
