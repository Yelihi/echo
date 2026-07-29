import * as React from "react";
import { cva } from "class-variance-authority";

import { cn } from "@/shared/lib/tailwind/utils";

export const titleFieldVariants = cva(
  "group/title-field flex h-13.5 w-full min-w-0 border-0 bg-transparent px-0.5 text-heading-sm font-bold text-black-primary outline-none placeholder:text-gray-text-secondary disabled:cursor-not-allowed disabled:opacity-60",
);

/**
 * 에디터 상단 제목 입력.
 *
 * 테두리와 배경 없이 타이핑 영역만 크게 잡아, 문서 제목처럼 보이게 합니다.
 * 일반 폼 입력에는 Input 을 쓰세요.
 */
export const TitleField = ({ className, ...props }: React.ComponentProps<"input">) => {
  return (
    <input
      type="text"
      data-slot="title-field"
      className={cn(titleFieldVariants(), className)}
      {...props}
    />
  );
};
