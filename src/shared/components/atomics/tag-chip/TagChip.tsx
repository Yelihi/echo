import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

// shared
import { cn } from "@/shared/lib/tailwind/utils";

export const tagChipVariants = cva(
  "group/tag-chip inline-flex h-9 w-fit shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-4 text-body-2 font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-3.5 [&_svg]:shrink-0",
  {
    variants: {
      selected: {
        false:
          "border-control-line bg-card-surface text-gray-text hover:border-brand hover:text-brand",
        true: "border-brand bg-brand text-on-brand hover:bg-brand-hover",
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
  asChild?: boolean;
  children: React.ReactNode;
}

/**
 * 누를 수 있는 태그 필터 칩.
 *
 * 두 필라 모두 선택 시 차콜 면을 사용합니다.
 * 어떤 태그가 선택됐는지, 다중 선택인지는 호출자가 정합니다.
 */
export const TagChip = ({
  className,
  selected = false,
  asChild = false,
  children,
  ...props
}: TagChipProps &
  Omit<React.ComponentProps<"button">, "value"> &
  VariantProps<typeof tagChipVariants>) => {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      {...(asChild ? {} : { type: "button" })}
      data-slot="tag-chip"
      data-selected={selected}
      aria-pressed={asChild ? undefined : selected}
      aria-current={asChild && selected ? "page" : undefined}
      className={cn(tagChipVariants({ selected }), className)}
      {...props}
    >
      {children}
    </Comp>
  );
};

export const TagChipSkeleton = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        "h-9 w-16 shrink-0 animate-pulse motion-reduce:animate-none rounded-full border border-control-line bg-white",
        className,
      )}
      aria-hidden
    />
  );
};
