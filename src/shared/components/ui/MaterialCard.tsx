import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { ArrowRight, Clock } from "lucide-react";

import { Divider } from "@/shared/components/atomics/divider/Divider";
import { cn } from "@/shared/lib/tailwind/utils";

export const materialCardVariants = cva(
  "group/material-card flex h-55 w-full min-w-75 flex-col gap-5 rounded-card bg-card-surface p-5 shadow-emphasize transition-shadow hover:shadow-strong",
);

export interface MaterialCardProps {
  title: React.ReactNode;
  /** 부제(원문 번역 등) */
  subTitle?: React.ReactNode;
  /**
   * 좌상단 태그 슬롯. Chip 또는 Badge 인스턴스를 넣습니다 —
   * 어떤 톤을 쓸지는 필라를 아는 호출자가 정합니다.
   */
  tags?: React.ReactNode;
  /** 우상단 메뉴 슬롯(수정/삭제 등). 메뉴 동작은 호출자가 소유합니다. */
  menu?: React.ReactNode;
  /** 좌하단 보조 정보(예: "문장 8개 · 3분") */
  meta?: React.ReactNode;
}

/**
 * 학습 자료 카드.
 *
 * 목록에서 자료 하나를 표현합니다. 저장·삭제·시작 규칙은 갖지 않으며
 * 태그와 메뉴는 슬롯으로 받습니다.
 */
export const MaterialCard = ({
  className,
  title,
  subTitle,
  tags,
  menu,
  meta,
  ...props
}: MaterialCardProps & React.ComponentProps<"div"> & VariantProps<typeof materialCardVariants>) => {
  return (
    <div data-slot="material-card" className={cn(materialCardVariants(), className)} {...props}>
      <div className="flex w-full items-center justify-between gap-2.5">
        <div className="flex min-w-0 items-center gap-2.5 overflow-hidden">{tags}</div>
        {menu}
      </div>

      <div className="flex flex-1 flex-col gap-2.5">
        <div className="flex flex-col gap-2">
          <p className="line-clamp-2 text-heading-xs font-bold text-black-primary">{title}</p>
          {subTitle ? <p className="line-clamp-2 text-body-2 text-gray-text">{subTitle}</p> : null}
        </div>

        <div className="mt-auto flex flex-col gap-2.5">
          <Divider />
          <div className="flex w-full items-center justify-between">
            <span className="flex items-center gap-2.5 text-body-1 text-gray-text-secondary [&_svg]:size-3.25">
              <Clock />
              {meta}
            </span>
            <ArrowRight className="size-4 shrink-0 text-gray-text-secondary" />
          </div>
        </div>
      </div>
    </div>
  );
};
