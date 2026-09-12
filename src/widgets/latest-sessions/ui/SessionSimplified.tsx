import { MessageSquare, Layers } from "lucide-react";
import Link from "next/link";

import { cn } from "@/shared/utils/cn";
import { SessionStateBadge } from "@/shared/components/ui";
import type { SessionSimplifiedProps } from "@/widgets/latest-sessions/models";

import { convertFormatDate } from "@/widgets/latest-sessions/config/convertFortmatDate";

export const SessionSimplified = ({
  title,
  sessionDate,
  description,
  sessionType,
  sessionState,
  href,
  actionLabel = "이어서 연습",
  disabled = false,
}: SessionSimplifiedProps) => {
  const content = (
    <>
      <div className="flex min-w-0 justify-start items-center gap-[10px]">
        <div
          className={cn(
            "size-[42px] shrink-0 rounded-full flex justify-center items-center",
            sessionType === "role-playing" ? "bg-gray-background" : "bg-gray-background",
          )}
        >
          {sessionType === "role-playing" ? (
            <MessageSquare className={cn("size-[20px] text-brand")} />
          ) : (
            <Layers className={cn("size-[20px] text-black-primary")} />
          )}
        </div>
        <div className="flex min-w-0 flex-col items-start justify-center gap-[4px]">
          <p className="text-body-4 font-bold text-black-primary break-words [overflow-wrap:anywhere]">
            {title}
          </p>
          <p className="text-body-3 font-normal text-gray-text break-words">{`${convertFormatDate(sessionDate)}·${description}`}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3 self-start sm:self-auto">
        <SessionStateBadge state={sessionState} />
        {sessionState === "practicing" && href && !disabled && (
          <span className="text-body-3 font-bold text-blue-primary">{actionLabel} →</span>
        )}
      </div>
    </>
  );
  const className = cn(
    "w-full h-fit bg-card-surface border border-card-line rounded-panel p-5 flex flex-col gap-3 sm:flex-row justify-between sm:items-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
    href && !disabled ? "cursor-pointer hover:bg-gray-background" : "cursor-default opacity-70",
  );

  if (href && !disabled) {
    return (
      <Link data-motion-card="true" href={href} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <div className={className} aria-disabled={disabled}>
      {content}
    </div>
  );
};

export const SESSION_SIMPLIFIED_SKELETON_COUNT = 5;

export const SessionSimplifiedSkeleton = () => {
  return (
    <div
      className="flex h-fit w-full items-center justify-between rounded-panel border border-card-line bg-card-surface p-5"
      aria-hidden
    >
      <div className="flex items-center justify-start gap-[10px]">
        <div className="size-[42px] shrink-0 animate-pulse motion-reduce:animate-none rounded-full bg-neutral-100" />
        <div className="flex flex-col items-start justify-center gap-[4px]">
          <div className="h-[16px] w-[140px] animate-pulse motion-reduce:animate-none rounded-chip bg-neutral-100" />
          <div className="h-[14px] w-[96px] animate-pulse motion-reduce:animate-none rounded-chip bg-neutral-100" />
        </div>
      </div>
      <div className="h-[25px] w-[100px] shrink-0 animate-pulse motion-reduce:animate-none rounded-full bg-neutral-100" />
    </div>
  );
};
