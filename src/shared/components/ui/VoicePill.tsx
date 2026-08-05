import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/shared/lib/tailwind/utils";

export const voicePillVariants = cva(
  "group/voice-pill relative flex flex-1 cursor-pointer flex-col items-center gap-1.5 rounded-xl border py-3.25 text-center transition-all disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      selected: {
        false: "border-card-line-strong bg-white",
        true: "border-accent-500 bg-accent-50",
      },
    },
    defaultVariants: {
      selected: false,
    },
  },
);

export interface VoicePillProps {
  icon: React.ReactNode;
  label: React.ReactNode;
  sub: React.ReactNode;
  selected?: boolean;
}

/**
 * TTS 목소리 선택 필. 롤플레잉 세션 준비 화면의 "상대방 음성"에 씁니다.
 */
export const VoicePill = ({
  className,
  icon,
  label,
  sub,
  selected = false,
  ...props
}: VoicePillProps &
  Omit<React.ComponentProps<"button">, "value"> &
  VariantProps<typeof voicePillVariants>) => {
  return (
    <button
      type="button"
      data-slot="voice-pill"
      data-selected={selected}
      aria-pressed={selected}
      className={cn(voicePillVariants({ selected }), className)}
      {...props}
    >
      <span
        className={cn("[&_svg]:size-5", selected ? "text-accent-700" : "text-gray-text-secondary")}
      >
        {icon}
      </span>
      <span className="text-body-4 font-bold text-black-primary">{label}</span>
      <span className="text-body-1 text-gray-text-secondary">{sub}</span>
    </button>
  );
};
