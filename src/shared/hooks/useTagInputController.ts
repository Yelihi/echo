"use client";

import { useState, type ComponentProps } from "react";

interface UseTagInputControllerParams {
  tags: string[];
  onChange: (tags: string[]) => void;
  getDuplicateKey?: (tag: string) => string;
  onInputDirty?: () => void;
}

export function useTagInputController({
  tags,
  onChange,
  getDuplicateKey = (tag) => tag,
  onInputDirty,
}: UseTagInputControllerParams) {
  const [inputValue, setInputValue] = useState("");

  const addTag = (value: string) => {
    const nextTag = value.trim();
    const nextTagKey = nextTag ? getDuplicateKey(nextTag) : "";
    const tagKeys = new Set(tags.map(getDuplicateKey));

    if (!nextTag || tagKeys.has(nextTagKey)) {
      setInputValue("");
      return;
    }

    onChange([...tags, nextTag]);
    setInputValue("");
  };

  const removeTag = (tag: string) => {
    onChange(tags.filter((item) => item !== tag));
  };

  const inputProps: ComponentProps<"input"> = {
    value: inputValue,
    onChange: (event) => {
      setInputValue(event.target.value);
      if (event.target.value.trim()) onInputDirty?.();
    },
    onKeyDown: (event) => {
      if (event.nativeEvent.isComposing) return;

      if (event.key === "Enter") {
        event.preventDefault();
        addTag(event.currentTarget.value);
      }
    },
  };

  return {
    inputProps,
    removeTag,
  };
}
