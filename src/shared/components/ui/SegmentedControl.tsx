"use client";

import * as React from "react";
import { cva } from "class-variance-authority";

import { ToggleGroup, ToggleGroupItem } from "@/shared/components/ui/toggle-group";
import { cn } from "@/shared/lib/tailwind/utils";

export const segmentedControlVariants = cva(
  "group/segmented-control w-fit rounded-control bg-neutral-100 p-0.75",
);

export const segmentedControlItemVariants = cva("px-3.75 text-body-2");

export interface SegmentedControlProps {
  /** 제어 모드에서 선택된 값 */
  value?: string;
  /** 비제어 모드 초기값. `value` 와 함께 쓰지 마세요. */
  defaultValue?: string;
  /**
   * 선택 변경 콜백.
   *
   * Radix single 토글 그룹은 같은 항목을 다시 누르면 빈 문자열을 보냅니다.
   * 세그먼트는 보통 해제가 없어야 하므로 호출자가 막아주세요 —
   * `onValueChange={(v) => v && setValue(v)}`
   */
  onValueChange?: (value: string) => void;
  size?: "sm" | "default" | "lg";
  disabled?: boolean;
}

/**
 * 세그먼트 컨트롤.
 *
 * 새로 구현하지 않고 `ToggleGroup` 을 감쌉니다 — 키보드 이동·포커스 관리 같은
 * 접근성 동작을 Radix 에서 그대로 물려받기 위함입니다.
 * 모양은 `toggle` 의 `theme="segmented"` 축이 담당합니다.
 */
export const SegmentedControl = ({
  className,
  value,
  defaultValue,
  onValueChange,
  size,
  disabled,
  children,
  ...props
}: SegmentedControlProps &
  // dir 은 Radix 가 "ltr" | "rtl" 로 좁혀 놓아 div 의 string 과 충돌합니다.
  Omit<React.ComponentProps<"div">, "defaultValue" | "onChange" | "dir">) => {
  return (
    <ToggleGroup
      data-slot="segmented-control"
      type="single"
      theme="segmented"
      // 0 을 쓰면 ToggleGroupItem 의 group-data-[spacing=0] 복합 선택자가 켜지면서
      // 모서리·패딩 재정의를 덮어쓸 수 없게 됩니다. 0.5(=2px)가 Figma 간격이기도 합니다.
      spacing={0.5}
      size={size}
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      disabled={disabled}
      className={cn(segmentedControlVariants(), className)}
      {...props}
    >
      {children}
    </ToggleGroup>
  );
};

/**
 * 세그먼트 항목. 반드시 `SegmentedControl` 안에서 사용합니다.
 */
export const SegmentedControlItem = ({
  className,
  ...props
}: React.ComponentProps<typeof ToggleGroupItem>) => {
  return (
    <ToggleGroupItem
      data-slot="segmented-control-item"
      className={cn(segmentedControlItemVariants(), className)}
      {...props}
    />
  );
};
