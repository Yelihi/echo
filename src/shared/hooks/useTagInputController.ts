"use client";

import { useState, type ComponentProps } from "react";

interface UseTagInputControllerParams {
  tags: string[];
  onChange: (tags: string[]) => void;
}

export function useTagInputController({ tags, onChange }: UseTagInputControllerParams) {
  const [inputValue, setInputValue] = useState("");

  const addTag = (value: string) => {
    const nextTag = value.trim();
    if (!nextTag || tags.includes(nextTag)) {
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
    onChange: (event) => setInputValue(event.target.value),
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
