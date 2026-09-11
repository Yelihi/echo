import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/shared/lib/tailwind/utils";

export const voicePillVariants = cva(
  "group/voice-pill relative flex flex-1 cursor-pointer flex-col items-center gap-1.5 rounded-panel border px-3 py-4 text-center transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      selected: {
        false: "border-control-line bg-card-surface hover:border-brand",
        true: "border-brand bg-gray-background inset-ring-1 inset-ring-brand",
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
      aria-pressed={props.role === "radio" ? undefined : selected}
      className={cn(voicePillVariants({ selected }), className)}
      {...props}
    >
      <span className={cn("[&_svg]:size-5", selected ? "text-brand" : "text-gray-text-secondary")}>
        {icon}
      </span>
      <span className="text-body-4 font-bold text-black-primary">{label}</span>
      <span className="text-body-1 text-gray-text-secondary">{sub}</span>
    </button>
  );
};
