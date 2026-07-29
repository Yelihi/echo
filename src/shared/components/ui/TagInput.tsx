"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";

import { cn } from "@/shared/lib/tailwind/utils";

export const tagInputVariants = cva(
  "group/tag-input flex w-full flex-wrap items-center gap-2 rounded-control border border-card-line-strong bg-card-surface px-2.5 py-2 focus-within:border-accent-500",
);

export const tagInputChipVariants = cva(
  "inline-flex h-7 shrink-0 items-center gap-1 rounded-full pr-2 pl-2.75 text-body-1 font-bold",
  {
    variants: {
      theme: {
        roleplay: "bg-blue-secondary text-blue-focus-title",
        memo: "bg-deep-blue-secondary text-deep-blue-primary",
      },
    },
    defaultVariants: {
      theme: "roleplay",
    },
  },
);

export interface TagInputProps {
  /** 현재 태그 목록. 상태는 호출자가 소유합니다. */
  tags: string[];
  /** 태그 제거 요청 */
  onRemoveTag?: (tag: string) => void;
  theme?: VariantProps<typeof tagInputChipVariants>["theme"];
  placeholder?: string;
  /** 입력칸에 그대로 전달됩니다(값·키 이벤트 등). */
  inputProps?: React.ComponentProps<"input">;
}

/**
 * 태그 입력.
 *
 * 태그 추가/삭제 규칙(중복 방지, 쉼표 분리 등)은 제품 정책이라 컴포넌트가 갖지 않습니다.
 * 목록을 받아 그리고, 제거 요청과 입력 이벤트만 위로 올려보냅니다.
 */
export const TagInput = ({
  className,
  tags,
  onRemoveTag,
  theme,
  placeholder,
  inputProps,
  ...props
}: TagInputProps & Omit<React.ComponentProps<"div">, "onChange">) => {
  return (
    <div data-slot="tag-input" className={cn(tagInputVariants(), className)} {...props}>
      {tags.map((tag) => (
        <span key={tag} data-slot="tag-input-chip" className={cn(tagInputChipVariants({ theme }))}>
          {tag}
          <button
            type="button"
            aria-label={`${tag} 태그 삭제`}
            onClick={() => onRemoveTag?.(tag)}
            className="inline-flex cursor-pointer items-center text-current opacity-70 transition-opacity hover:opacity-100 [&_svg]:size-3.25"
          >
            <X />
          </button>
        </span>
      ))}
      <input
        type="text"
        placeholder={tags.length ? undefined : placeholder}
        className="min-w-35 flex-1 border-0 bg-transparent text-body-3 text-black-primary outline-none placeholder:text-gray-text-secondary"
        {...inputProps}
      />
    </div>
  );
};
