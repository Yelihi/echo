import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/shared/lib/tailwind/utils";

export const tagChipVariants = cva(
  "group/tag-chip inline-flex h-8.5 w-fit shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-4 text-body-2 font-bold whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-accent-500/30 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-3.5 [&_svg]:shrink-0",
  {
    variants: {
      selected: {
        false:
          "border-card-line-strong bg-card-surface text-gray-text hover:border-accent-300 hover:text-accent-700",
        true: "border-accent-600 bg-accent-600 text-white",
      },
    },
    defaultVariants: {
      selected: false,
    },
  },
);

export interface TagChipProps {
  /** 선택 상태. 상태는 호출자가 소유합니다. */
  selected?: boolean;
  children: React.ReactNode;
}

/**
 * 누를 수 있는 태그 필터 칩.
 *
 * 선택 시 accent 계열이라 `data-pillar="memo"` 안에서는 네이비로 전환됩니다.
 * 어떤 태그가 선택됐는지, 다중 선택인지는 호출자가 정합니다.
 */
export const TagChip = ({
  className,
  selected = false,
  children,
  ...props
}: TagChipProps &
  Omit<React.ComponentProps<"button">, "value"> &
  VariantProps<typeof tagChipVariants>) => {
  return (
    <button
      type="button"
      data-slot="tag-chip"
      data-selected={selected}
      aria-pressed={selected}
      className={cn(tagChipVariants({ selected }), className)}
      {...props}
    >
      {children}
    </button>
  );
};
