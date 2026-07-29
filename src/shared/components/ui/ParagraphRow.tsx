import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/shared/lib/tailwind/utils";

export const paragraphRowVariants = cva("group/paragraph-row flex w-full gap-2.5", {
  variants: {
    mode: {
      edit: "items-start",
      confirmed: "items-start",
    },
  },
  defaultVariants: {
    mode: "edit",
  },
});

export interface ParagraphRowProps {
  /** 1부터 시작하는 문단 번호 */
  index: number;
  mode?: VariantProps<typeof paragraphRowVariants>["mode"];
  /** edit 모드의 입력 슬롯(Textarea) 또는 confirmed 모드의 본문 */
  children: React.ReactNode;
  /** edit 모드 우측 액션 슬롯(합치기·삭제 버튼) */
  actions?: React.ReactNode;
}

/**
 * AI 문단 분리 결과 한 줄.
 *
 * edit 는 수정 가능한 입력과 액션을, confirmed 는 확정된 본문을 보여줍니다.
 * 합치기·삭제 동작은 슬롯으로 받아 호출자가 소유합니다.
 */
export const ParagraphRow = ({
  className,
  index,
  mode,
  children,
  actions,
  ...props
}: ParagraphRowProps & React.ComponentProps<"div">) => {
  const resolvedMode = mode ?? "edit";

  return (
    <div
      data-slot="paragraph-row"
      data-mode={resolvedMode}
      className={cn(paragraphRowVariants({ mode }), className)}
      {...props}
    >
      <span className="mt-2 flex size-6 shrink-0 items-center justify-center rounded-md bg-deep-blue-secondary text-body-1 font-black text-deep-blue-primary">
        {index}
      </span>
      <div className="flex-1">{children}</div>
      {resolvedMode === "edit" && actions ? (
        <div className="flex flex-col gap-1">{actions}</div>
      ) : null}
    </div>
  );
};
