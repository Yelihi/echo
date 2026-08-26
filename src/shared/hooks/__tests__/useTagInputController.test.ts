import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, jest } from "@jest/globals";
import type { KeyboardEvent } from "react";

import { useTagInputController } from "@/shared/hooks/useTagInputController";

function createKeyDownEvent(key: string, value: string) {
  return {
    key,
    currentTarget: { value },
    nativeEvent: { isComposing: false },
    preventDefault: jest.fn(),
  } as unknown as KeyboardEvent<HTMLInputElement>;
}

describe("useTagInputController", () => {
  it("should remove the last tag when backspace is pressed on an empty input", () => {
    // Given
    const onChange = jest.fn();
    const { result } = renderHook(() =>
      useTagInputController({
        tags: ["카페", "바리스타"],
        onChange,
      }),
    );

    // When
    act(() => {
      result.current.inputProps.onKeyDown?.(createKeyDownEvent("Backspace", ""));
    });

    // Then
    expect(onChange).toHaveBeenCalledWith(["카페"]);
  });

  it("should not remove a tag when backspace is pressed with draft text", () => {
    // Given
    const onChange = jest.fn();
    const { result } = renderHook(() =>
      useTagInputController({
        tags: ["카페"],
        onChange,
      }),
    );

    // When
    act(() => {
      result.current.inputProps.onKeyDown?.(createKeyDownEvent("Backspace", "바"));
    });

    // Then
    expect(onChange).not.toHaveBeenCalled();
  });
});
