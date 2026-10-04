"use client";

import * as React from "react";
import { X } from "lucide-react";

import { cn } from "@/shared/lib/tailwind/utils";

export interface TagInputProps {
  /** 현재 태그 목록. 상태는 호출자가 소유합니다. */
  tags: string[];
  /** 태그 제거 요청 */
  onRemoveTag?: (tag: string) => void;
  theme?: "roleplay" | "memo" | null;
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
    <div
      data-slot="tag-input"
      data-theme={theme ?? "roleplay"}
      className={cn(
        "group/tag-input flex min-h-12 w-full flex-wrap items-center gap-2 rounded-[7px] border border-practice-input-line bg-white px-2.5 py-1.25 focus-within:border-brand focus-within:inset-ring-1 focus-within:inset-ring-brand",
        className,
      )}
      {...props}
    >
      {tags.map((tag) => (
        <span
          key={tag}
          data-slot="tag-input-chip"
          className="inline-flex min-h-7 max-w-full items-center gap-1 rounded border-0 bg-practice-chip pr-2 pl-2.75 text-[12px] font-medium text-practice-secondary"
        >
          <span className="min-w-0 break-all">{tag}</span>
          <button
            type="button"
            aria-label={`${tag} 태그 삭제`}
            onClick={() => onRemoveTag?.(tag)}
            className="inline-flex h-8 w-6.5 shrink-0 cursor-pointer items-center justify-center rounded-full text-current outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 opacity-70 transition-opacity hover:opacity-100 [&_svg]:size-3.25"
          >
            <X />
          </button>
        </span>
      ))}
      <input
        type="text"
        placeholder={tags.length ? undefined : placeholder}
        className="h-8 min-w-0 flex-1 basis-32 border-0 bg-white p-0 text-[15px] leading-[1.7] font-normal text-practice-body shadow-none outline-none placeholder:text-practice-muted"
        {...inputProps}
      />
    </div>
  );
};
