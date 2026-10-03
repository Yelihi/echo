"use client";

import { Mic, Square } from "lucide-react";
import type {
  GlassButtonProps,
  RecordOrbProps,
  TimerPillProps,
  PartnerCardProps,
} from "@/views/recording/models/ui";

import { cn } from "@/shared/lib/tailwind/utils";

export function GlassButton({ className, emphasis = "secondary", ...props }: GlassButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex min-h-12 items-center justify-center gap-2 rounded-pill border px-5 py-2 text-base font-medium leading-6 transition-colors focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-[18px] [&_svg]:shrink-0",
        emphasis === "primary"
          ? "border-brand bg-brand text-white hover:bg-brand-hover"
          : "border-control-line bg-card-surface text-black-primary hover:bg-gray-background",
        className,
      )}
      {...props}
    />
  );
}

export function RecordOrb({ phase, disabled, onClick }: RecordOrbProps) {
  const recording = phase === "recording";
  const recorded = phase === "recorded";
  const Icon = recording ? Square : Mic;

  return (
    <div data-state={phase} className="relative grid size-[184px] shrink-0 place-items-center">
      <span
        data-recording-halo={recording || undefined}
        className={cn(
          "pointer-events-none absolute size-[184px] rounded-full border",
          recording ? "border-brand" : "border-card-line",
        )}
      />
      <button
        type="button"
        disabled={disabled}
        aria-label={recording ? "녹음 중지" : recorded ? "다시 녹음" : "녹음 시작"}
        onClick={onClick}
        className={cn(
          "relative z-10 inline-flex size-[132px] items-center justify-center rounded-full text-white  transition-transform focus-visible:ring-4 focus-visible:ring-brand focus-visible:outline-none enabled:hover:scale-[1.03] enabled:active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45 [&_svg]:size-11",
          recording ? "bg-brand-hover" : "bg-brand",
        )}
      >
        <Icon />
      </button>
    </div>
  );
}

export function TimerPill({ children, recording }: TimerPillProps) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full  px-[15px] py-2 text-body-4 font-medium text-black-primary tabular-nums">
      <span
        data-rec-dot={recording || undefined}
        aria-hidden="true"
        className="size-[9px] shrink-0 rounded-full bg-red-primary"
      />
      {children}
    </div>
  );
}

export function PartnerCard({ role, children }: PartnerCardProps) {
  return (
    <div className="flex w-full flex-col items-center gap-3 rounded-card  px-5 py-6 text-center  sm:px-8">
      <h1 className="text-sm font-medium text-gray-text">{role}</h1>
      <p
        lang="en"
        className="w-full whitespace-pre-wrap break-words text-2xl font-normal leading-relaxed text-black-primary sm:text-4xl"
      >
        {children}
      </p>
    </div>
  );
}
