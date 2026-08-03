import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { radioVariants } from "@/shared/components/atomics/radio/Radio";
import { cn } from "@/shared/lib/tailwind/utils";

export const selectableOptionCardVariants = cva(
  "group/selectable-option-card flex w-full cursor-pointer items-center gap-3.5 rounded-panel border px-4.5 py-4 text-left transition-all",
  {
    variants: {
      selected: {
        false: "border-card-line bg-card-surface",
        true: "border-[1.5px] border-accent-500 bg-accent-50",
      },
    },
    defaultVariants: {
      selected: false,
    },
  },
);

export interface SelectableOptionCardProps {
  icon: React.ReactNode;
  /** 아이콘 위에 겹쳐 보이는 순번 배지 (문장 암기 연습 모드처럼 순서가 있을 때) */
  badge?: React.ReactNode;
  title: React.ReactNode;
  description: React.ReactNode;
  selected?: boolean;
  /** 설명 아래 추가 콘텐츠 슬롯 (예: 번역 준비 중 로딩 표시) */
  extra?: React.ReactNode;
}

/**
 * 아이콘 + 제목 + 설명 + 라디오점으로 이뤄진 선택형 카드.
 *
 * 롤플레잉 평가 모드, 문장 암기 연습 모드 선택에 함께 씁니다. 선택 상태는
 * 호출자가 소유하며, `accent-*` 를 쓰므로 `data-pillar="memo"` 안에서는
 * 자동으로 네이비 톤으로 바뀝니다.
 */
export const SelectableOptionCard = ({
  className,
  icon,
  badge,
  title,
  description,
  selected = false,
  extra,
  ...props
}: SelectableOptionCardProps &
  Omit<React.ComponentProps<"button">, "title"> &
  VariantProps<typeof selectableOptionCardVariants>) => {
  return (
    <button
      type="button"
      data-slot="selectable-option-card"
      data-selected={selected}
      aria-pressed={selected}
      className={cn(selectableOptionCardVariants({ selected }), className)}
      {...props}
    >
      <span
        className={cn(
          "relative flex size-10.5 shrink-0 items-center justify-center rounded-xl transition-colors [&_svg]:size-5.25",
          selected ? "bg-accent-600 text-white" : "bg-neutral-100 text-gray-text-secondary",
        )}
      >
        {icon}
        {badge && (
          <span className="absolute -top-1.75 -left-1.75 flex size-5 items-center justify-center rounded-full border border-card-line bg-white text-body-1 font-black text-accent-700">
            {badge}
          </span>
        )}
      </span>
      <span className="flex-1">
        <span className="block text-body-4 font-bold text-black-primary">{title}</span>
        <span className="mt-0.5 block text-body-3 text-gray-text">{description}</span>
        {extra}
      </span>
      {/* Radio 와 같은 시각 언어를 쓰되, 카드 전체가 눌리는 영역이라 Radix 컨텍스트 없이 상태만 흉내냅니다. */}
      <span
        data-state={selected ? "checked" : "unchecked"}
        className={cn(radioVariants(), "shrink-0")}
      >
        {selected && <span className="block size-2.25 rounded-full bg-card-surface" />}
      </span>
    </button>
  );
};
