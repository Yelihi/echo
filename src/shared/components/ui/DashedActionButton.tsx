import * as React from "react";
import { Loader2 } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/shared/lib/tailwind/utils";

export const dashedActionButtonVariants = cva(
  "group/dashed-action-button flex w-full cursor-pointer items-center justify-center gap-2 rounded-panel border border-dashed border-control-line bg-card-surface px-5 text-body-3 font-bold text-black-secondary transition-colors outline-none hover:border-accent-400 hover:bg-accent-50 hover:text-brand focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[dragging=true]:border-accent-400 data-[dragging=true]:bg-accent-50 data-[dragging=true]:text-brand [&_svg]:shrink-0",
  {
    variants: {
      size: {
        md: "h-14 [&_svg]:size-4.5",
        lg: "h-16 [&_svg]:size-5",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

export interface DashedActionButtonProps {
  size?: VariantProps<typeof dashedActionButtonVariants>["size"];
  /** 좌측 아이콘 슬롯 */
  icon?: React.ReactNode;
  pending?: boolean;
  children: React.ReactNode;
}

/**
 * 점선 CTA. 파일 업로드나 AI 제안 요청처럼 "여기를 눌러 시작" 성격의 넓은 버튼입니다.
 * 일반 액션에는 Button 을 쓰세요.
 */
export const DashedActionButton = ({
  className,
  size,
  icon,
  pending,
  children,
  ...props
}: DashedActionButtonProps & React.ComponentProps<"button">) => {
  return (
    <button
      type="button"
      data-slot="dashed-action-button"
      data-size={size ?? "md"}
      className={cn(dashedActionButtonVariants({ size }), className)}
      {...props}
    >
      {pending ? <Loader2 className="size-4 animate-spin" /> : icon}
      {pending ? "변환중입니다!" : children}
    </button>
  );
};
