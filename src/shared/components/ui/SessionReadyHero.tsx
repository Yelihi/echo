import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/shared/lib/tailwind/utils";

export const sessionReadyHeroVariants = cva(
  "group/session-ready-hero relative overflow-hidden rounded-hero px-8 py-7.5 text-white",
  {
    variants: {
      theme: {
        roleplay: "bg-blue-primary",
        memo: "bg-deep-blue-primary",
      },
    },
    defaultVariants: {
      theme: "roleplay",
    },
  },
);

export interface SessionReadyHeroProps {
  theme: VariantProps<typeof sessionReadyHeroVariants>["theme"];
  tags: string[];
  title: React.ReactNode;
  subtitle: React.ReactNode;
  /** 통계 줄 슬롯. 보통 StatItem 을 나란히 배치합니다. */
  children: React.ReactNode;
}

/**
 * 세션 준비 화면 상단 히어로 배너.
 *
 * 필러별로 배경(blue/deep-blue)만 다르고 구조는 동일해, SourceCard/EntryCard 와
 * 같은 축인 명시적 `theme` prop 하나로 나눕니다 (선택 카드류의 `accent-*`
 * 자동 전환과 달리, 이 배너는 두 필러가 한 화면에 섞이지 않는다는 보장이 없습니다).
 */
export const SessionReadyHero = ({
  className,
  theme,
  tags,
  title,
  subtitle,
  children,
  ...props
}: SessionReadyHeroProps & React.ComponentProps<"div">) => {
  return (
    <div
      data-slot="session-ready-hero"
      data-theme={theme}
      className={cn(sessionReadyHeroVariants({ theme }), className)}
      {...props}
    >
      <div className="flex gap-1.5">
        {tags.map((tag) => (
          <span key={tag} className="text-body-1 font-bold tracking-wide uppercase opacity-85">
            #{tag}
          </span>
        ))}
      </div>
      <h1 className="mt-2 text-[30px] leading-tight font-bold text-white">{title}</h1>
      <div className="mt-1 text-body-4 opacity-90">{subtitle}</div>
      <div className="mt-5.5 flex gap-6.5">{children}</div>
    </div>
  );
};
