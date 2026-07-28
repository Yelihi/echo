"use client";

import * as React from "react";
import { cva } from "class-variance-authority";
import { RadioGroup as RadioGroupPrimitive } from "radix-ui";

import { cn } from "@/shared/lib/tailwind/utils";

export const radioGroupVariants = cva("group/radio-group grid gap-3");

export const radioVariants = cva(
  // 22px 원 + 2px 테두리, 선택 시 accent 로 가득 채우고 9px 흰 점을 뚫습니다.
  // (22 - 9) / 2 = 6.5 → Figma 의 6.5px 링과 픽셀 단위로 동일합니다.
  "group/radio relative inline-flex size-5.5 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 border-card-line-strong bg-card-surface outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent-500/30 disabled:cursor-not-allowed disabled:opacity-60 data-[state=checked]:border-accent-600 data-[state=checked]:bg-accent-600",
);

export interface RadioProps {
  /** 이 항목이 대표하는 값. RadioGroup 의 `value` 와 비교됩니다. */
  value: string;
}

/**
 * 라디오 그룹. Radix 계약을 그대로 따릅니다 —
 * 비제어는 `defaultValue`, 제어는 `value` + `onValueChange`. 둘을 함께 쓰지 마세요.
 */
export const RadioGroup = ({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) => {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn(radioGroupVariants(), className)}
      {...props}
    />
  );
};

/**
 * 라디오 항목. 반드시 `RadioGroup` 안에서 사용해야 합니다(Radix 컨텍스트 필요).
 */
export const Radio = ({
  className,
  ...props
}: RadioProps & React.ComponentProps<typeof RadioGroupPrimitive.Item>) => {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio"
      className={cn(radioVariants(), className)}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-indicator"
        className="block size-2.25 rounded-full bg-card-surface"
      />
    </RadioGroupPrimitive.Item>
  );
};
