import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Plus } from "lucide-react";

import { cn } from "@/shared/lib/tailwind/utils";

export const addLineButtonVariants = cva(
  "group/add-line-button inline-flex h-9.25 cursor-pointer items-center justify-center gap-1.5 rounded-chip border border-control-line bg-transparent px-3.5 text-body-2 font-bold text-gray-text transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      // 평상시 모습은 같고 hover 시 화자별로 다른 강조가 들어옵니다.
      speaker: {
        partner: "hover:border-brand hover:bg-gray-background hover:text-brand",
        me: "hover:border-brand hover:bg-gray-background hover:text-brand",
      },
    },
    defaultVariants: {
      speaker: "partner",
    },
  },
);

export interface AddLineButtonProps {
  speaker?: VariantProps<typeof addLineButtonVariants>["speaker"];
  children: React.ReactNode;
}

/**
 * 대사 추가 버튼. 롤플레잉 에디터 하단에 상대방/내 대사용으로 두 개가 놓입니다.
 */
export const AddLineButton = ({
  className,
  speaker,
  children,
  ...props
}: AddLineButtonProps & React.ComponentProps<"button">) => {
  return (
    <button
      type="button"
      data-slot="add-line-button"
      data-speaker={speaker ?? "partner"}
      className={cn(addLineButtonVariants({ speaker }), className)}
      {...props}
    >
      <Plus />
      {children}
    </button>
  );
};
