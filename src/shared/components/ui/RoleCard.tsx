import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Check } from "lucide-react";

import { cn } from "@/shared/lib/tailwind/utils";

export const roleCardVariants = cva(
  "group/role-card relative flex w-full cursor-pointer flex-col gap-2 rounded-panel border p-4 text-left transition-all disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      selected: {
        false: "border-card-line bg-white",
        true: "border-accent-500 bg-accent-50",
      },
    },
    defaultVariants: {
      selected: false,
    },
  },
);

export interface RoleCardProps {
  title: React.ReactNode;
  description: React.ReactNode;
  selected?: boolean;
}

/**
 * 역할 선택 카드. 롤플레잉 세션 준비 화면의 "역할 선택"에 씁니다.
 */
export const RoleCard = ({
  className,
  title,
  description,
  selected = false,
  ...props
}: RoleCardProps &
  Omit<React.ComponentProps<"button">, "title"> &
  VariantProps<typeof roleCardVariants>) => {
  return (
    <button
      type="button"
      data-slot="role-card"
      data-selected={selected}
      aria-pressed={selected}
      className={cn(roleCardVariants({ selected }), className)}
      {...props}
    >
      {selected && <Check className="absolute top-3 right-3 size-4.5 text-accent-600" />}
      <span className="text-body-5 font-bold text-black-primary">{title}</span>
      <span className="text-body-2 text-gray-text">{description}</span>
    </button>
  );
};
