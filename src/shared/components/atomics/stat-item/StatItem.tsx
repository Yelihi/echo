import * as React from "react";

import { cn } from "@/shared/lib/tailwind/utils";

export interface StatItemProps {
  icon: React.ReactNode;
  value: React.ReactNode;
  label: React.ReactNode;
}

/**
 * 세션 준비 화면 히어로에 반복되는 통계 한 칸(아이콘+캡션, 큰 값).
 */
export const StatItem = ({
  className,
  icon,
  value,
  label,
  ...props
}: StatItemProps & React.ComponentProps<"div">) => {
  return (
    <div data-slot="stat-item" className={cn("flex flex-col gap-1", className)} {...props}>
      <span className="flex items-center gap-1.5 text-body-1 font-semibold opacity-85 [&_svg]:size-3.75">
        {icon}
        {label}
      </span>
      <span className="text-[24px] leading-none font-extrabold tracking-tight tabular-nums">
        {value}
      </span>
    </div>
  );
};
