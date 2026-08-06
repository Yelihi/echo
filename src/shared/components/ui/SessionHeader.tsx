import * as React from "react";

import { ProgressTrack } from "@/shared/components";
import { cn } from "@/shared/lib/tailwind/utils";

export interface SessionHeaderProps {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  meta?: React.ReactNode;
  progressValue?: number | null;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
}

export function SessionHeader({
  className,
  eyebrow,
  title,
  meta,
  progressValue,
  leading,
  trailing,
  ...props
}: SessionHeaderProps & React.ComponentProps<"header">) {
  return (
    <header
      data-slot="session-header"
      className={cn("flex shrink-0 flex-col gap-4", className)}
      {...props}
    >
      <div className="grid min-h-10 grid-cols-[auto_1fr_auto] items-center gap-3">
        <div className="flex min-w-10 items-center">{leading}</div>
        <div className="min-w-0 text-center">
          {eyebrow ? (
            <p className="truncate text-subtitle-sm font-bold uppercase text-white/55">{eyebrow}</p>
          ) : null}
          <h1 className="truncate text-heading-xs font-bold text-white">{title}</h1>
          {meta ? <p className="truncate text-body-2 text-white/55">{meta}</p> : null}
        </div>
        <div className="flex min-w-10 justify-end">{trailing}</div>
      </div>
      {progressValue == null ? null : (
        <ProgressTrack
          aria-label="세션 진행률"
          className="bg-white/15 [&_[data-slot=progress-track-indicator]]:bg-accent-glow"
          value={progressValue}
        />
      )}
    </header>
  );
}
