import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { cn } from "@/shared/utils/cn";

import type { SourceItemProps } from "@/widgets/latest-sources/models/interface";

export const SOURCE_ITEM_SKELETON_COUNT = 4;

export const SourceItem = ({ icon: Icon, type, title, subTitle, href }: SourceItemProps) => {
  const content = (
    <>
      <div
        className={cn(
          "size-11 shrink-0 flex justify-center items-center rounded-chip",
          type === "role-play" ? "bg-gray-background" : "bg-gray-background",
        )}
      >
        <Icon
          className={cn("size-[18px]", type === "role-play" ? "text-brand" : "text-black-primary")}
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-items-start gap-[5px]">
        <p className="text-body-4 font-bold text-black-primary break-words [overflow-wrap:anywhere]">
          {title}
        </p>
        <p className="text-body-1 font-normal text-gray-text-secondary">{subTitle}</p>
      </div>
      <div className="flex shrink-0 items-center">
        <ArrowRight className="size-[16px] text-gray-text-secondary" />
      </div>
    </>
  );
  const className = cn(
    "w-full min-w-0 bg-card-surface flex items-center gap-3 p-3 rounded-panel",
    href
      ? "cursor-pointer hover:bg-gray-background transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      : "cursor-default opacity-70",
    href && (type === "role-play" ? "active:bg-gray-background" : "active:bg-gray-background"),
  );

  return href ? (
    <Link href={href} className={className}>
      {content}
    </Link>
  ) : (
    <div className={className} aria-disabled>
      {content}
    </div>
  );
};

export const SourceItemSkeleton = () => {
  return (
    <div className="flex w-full items-center gap-[15px] rounded-card bg-white p-[10px]" aria-hidden>
      <div className="size-[42px] shrink-0 animate-pulse motion-reduce:animate-none rounded-chip bg-neutral-100" />
      <div className="flex w-full flex-col gap-[5px]">
        <div className="h-[16px] w-[56%] animate-pulse motion-reduce:animate-none rounded-chip bg-neutral-100" />
        <div className="h-[12px] w-[36%] animate-pulse motion-reduce:animate-none rounded-chip bg-neutral-100" />
      </div>
      <div className="size-[16px] shrink-0 animate-pulse motion-reduce:animate-none rounded-chip bg-neutral-100" />
    </div>
  );
};
