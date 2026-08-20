import { ArrowRight } from "lucide-react";

import { cn } from "@/shared/utils/cn";

import type { SourceItemProps } from "@/widgets/latest-sources/models/interface";

export const SOURCE_ITEM_SKELETON_COUNT = 4;

export const SourceItem = ({ icon: Icon, type, title, subTitle }: SourceItemProps) => {
  return (
    <div
      className={cn(
        "w-fit bg-white flex justify-start items-center gap-[15px] p-[10px] rounded-card cursor-pointer hover:shadow-emphasize transition-shadow duration-300 active:scale-96",
        type === "role-play" ? "active:bg-blue-secondary" : "active:bg-deep-blue-secondary",
      )}
    >
      <div
        className={cn(
          "size-[42px] flex justify-center items-center rounded-chip",
          type === "role-play" ? "bg-blue-secondary" : "bg-deep-blue-secondary",
        )}
      >
        <Icon
          className={cn(
            "size-[18px]",
            type === "role-play" ? "text-blue-primary" : "text-black-primary",
          )}
        />
      </div>
      <div className="flex flex-col justify-items-start gap-[5px]">
        <p className="text-body-4 font-bold text-black-primary">{title}</p>
        <p className="text-body-1 font-normal text-gray-text-secondary">{subTitle}</p>
      </div>
      <div className="flex justify-items-center">
        <ArrowRight className="size-[16px] text-gray-text-secondary" />
      </div>
    </div>
  );
};

export const SourceItemSkeleton = () => {
  return (
    <div className="flex w-full items-center gap-[15px] rounded-card bg-white p-[10px]" aria-hidden>
      <div className="size-[42px] shrink-0 animate-pulse rounded-chip bg-neutral-100" />
      <div className="flex w-full flex-col gap-[5px]">
        <div className="h-[16px] w-[56%] animate-pulse rounded-chip bg-neutral-100" />
        <div className="h-[12px] w-[36%] animate-pulse rounded-chip bg-neutral-100" />
      </div>
      <div className="size-[16px] shrink-0 animate-pulse rounded-chip bg-neutral-100" />
    </div>
  );
};
