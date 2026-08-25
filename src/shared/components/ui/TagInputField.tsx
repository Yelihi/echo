"use client";

// shared
import { TagInput, type TagInputProps } from "@/shared/components/ui/TagInput";
import { useTagInputController } from "@/shared/hooks/useTagInputController";

type TagInputFieldProps = Omit<TagInputProps, "onRemoveTag" | "inputProps"> & {
  onChange: (tags: string[]) => void;
  onInputDirty?: () => void;
  getDuplicateKey?: (tag: string) => string;
};

/**
 * 태그 목록은 호출자가 소유하고, 입력칸 초안만 이 컴포넌트가 가집니다.
 * 타이핑은 여기서 끝나고, Enter/삭제로 tags가 바뀔 때만 부모를 갱신합니다.
 */
export function TagInputField({
  tags,
  onChange,
  onInputDirty,
  getDuplicateKey,
  ...props
}: TagInputFieldProps) {
  const tagInput = useTagInputController({
    tags,
    onChange,
    onInputDirty,
    getDuplicateKey,
  });

  return (
    <TagInput
      {...props}
      tags={tags}
      onRemoveTag={tagInput.removeTag}
      inputProps={{
        ...tagInput.inputProps,
        "aria-label": "태그 입력",
      }}
    />
  );
}
