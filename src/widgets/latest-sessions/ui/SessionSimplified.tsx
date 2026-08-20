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
  disabled = false,
}: SessionSimplifiedProps) => {
  const content = (
    <>
      <div className="flex justify-start items-center gap-[10px]">
        <div
          className={cn(
            "size-[42px] rounded-control flex justify-center items-center",
            sessionType === "role-playing" ? "bg-blue-secondary" : "bg-deep-blue-secondary",
          )}
        >
          {sessionType === "role-playing" ? (
            <MessageSquare className={cn("size-[20px] text-blue-primary")} />
          ) : (
            <Layers className={cn("size-[20px] text-black-primary")} />
          )}
        </div>
        <div className="flex flex-col items-start justify-center gap-[4px]">
          <p className="text-body-4 font-bold text-black-primary">{title}</p>
          <p className="text-body-3 font-normal text-gray-text-secondary">{`${convertFormatDate(sessionDate)}·${description}`}</p>
        </div>
      </div>
      <div className="size-fit">
        <SessionStateBadge state={sessionState} />
      </div>
    </>
  );
  const className = cn(
    "w-full h-fit bg-white border border-gray-border rounded-panel p-[16px] flex justify-between items-center transition-colors",
    href && !disabled ? "cursor-pointer hover:bg-gray-background" : "cursor-default opacity-70",
  );

  if (href && !disabled) {
    return (
      <Link href={href} className={className}>
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
      className="flex h-fit w-full items-center justify-between rounded-panel border border-gray-border bg-white p-[16px]"
      aria-hidden
    >
      <div className="flex items-center justify-start gap-[10px]">
        <div className="size-[42px] shrink-0 animate-pulse rounded-control bg-neutral-100" />
        <div className="flex flex-col items-start justify-center gap-[4px]">
          <div className="h-[16px] w-[140px] animate-pulse rounded-chip bg-neutral-100" />
          <div className="h-[14px] w-[96px] animate-pulse rounded-chip bg-neutral-100" />
        </div>
      </div>
      <div className="h-[25px] w-[100px] shrink-0 animate-pulse rounded-full bg-neutral-100" />
    </div>
  );
};
