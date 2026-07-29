import * as React from "react";
import { cva } from "class-variance-authority";

import { cn } from "@/shared/lib/tailwind/utils";

export const partnerCardVariants = cva(
  // Figma 는 22px 이지만 대응 토큰이 없어 hero(24)로 정규화했습니다.
  "group/partner-card flex w-full flex-col items-center gap-3 rounded-hero border border-session-glass-line bg-session-glass px-6.5 py-6 text-center backdrop-blur-xl",
);

export interface PartnerCardProps {
  /** 역할 라벨(예: "BARISTA"). 대문자 강조로 표시됩니다. */
  role?: React.ReactNode;
  /** 상대방 대사 */
  children: React.ReactNode;
}

/**
 * 세션 화면에서 상대방 대사를 보여주는 카드. 다크 스테이지 위 글래스 표면입니다.
 */
export const PartnerCard = ({
  className,
  role,
  children,
  ...props
}: PartnerCardProps & React.ComponentProps<"div">) => {
  return (
    <div data-slot="partner-card" className={cn(partnerCardVariants(), className)} {...props}>
      {role ? (
        <span className="text-body-1 font-bold tracking-widest text-accent-glow uppercase">
          {role}
        </span>
      ) : null}
      <p className="text-heading-md font-medium text-balance text-white">{children}</p>
    </div>
  );
};
