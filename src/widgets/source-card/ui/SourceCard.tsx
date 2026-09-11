"use client";

import { ArrowRight, Clock } from "lucide-react";
import Link from "next/link";

// shared
import { Divider, Badge } from "@/shared/components";

// widgets
import type { SourceCardProps } from "@/widgets/source-card/models/interface";
import { SourceCardInnerMenuButton } from "@/widgets/source-card/ui/SourceCardInnerMenuButton";

export const SourceCard = ({
  tags,
  title,
  id,
  subTitle,
  theme,
  contentValue,
  href,
  innerMenuItems,
  onMenuAction,
}: SourceCardProps) => {
  const body = (
    <>
      <div className="w-full flex flex-col items-start gap-[8px]">
        <p className="w-full text-heading-xs text-black-primary font-bold line-clamp-2 wrap-break-word leading-[24px] h-[48px]">
          {title}
        </p>
        <p className="text-body-2 font-normal text-gray-text line-clamp-2 wrap-break-word leading-[18px] h-[36px]">
          {subTitle}
        </p>
      </div>
      <Divider />
      <div className="w-full flex justify-between items-center">
        <div className="flex justify-start items-center gap-[10px]">
          <Clock className="size-[13px] text-gray-text-secondary" />
          <p className="text-body-1 text-gray-text-secondary font-normal">자료 분량</p>
        </div>
        <div className="flex justify-center items-center gap-[10px]">
          <p className="text-body-1 text-gray-text-secondary font-normal">{contentValue}개 문단</p>
          <ArrowRight className="size-[13px] text-gray-text-secondary" />
        </div>
      </div>
    </>
  );

  return (
    <div className="w-full min-w-0 rounded-card border border-card-line bg-card-surface p-6 transition-colors hover:border-control-line">
      <div className="size-full flex flex-col justify-start items-center gap-6">
        <div className="w-full flex justify-between items-center">
          <div className="w-full min-w-0 max-w-[200px] overflow-x-auto scrollbar-none scroll-smooth flex justify-start items-center gap-[10px]">
            {tags.map((tag) => (
              <Badge key={tag.value} size="small" theme={theme} value={tag.value}>
                {tag.label}
              </Badge>
            ))}
          </div>
          <SourceCardInnerMenuButton
            id={id}
            onMenuAction={onMenuAction}
            innerMenuItems={innerMenuItems}
          />
        </div>
        {href ? (
          <Link
            href={href}
            className="w-full flex flex-col justify-start items-start gap-[10px] cursor-pointer rounded-control outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-4"
          >
            {body}
          </Link>
        ) : (
          <div className="w-full flex flex-col justify-start items-start gap-[10px] rounded-control">
            {body}
          </div>
        )}
      </div>
    </div>
  );
};

export const SOURCE_CARD_SKELETON_COUNT = 8;

export const SourceCardSkeleton = () => {
  return (
    <div
      className="min-h-60 w-full min-w-0 rounded-card border border-card-line bg-card-surface p-6"
      aria-hidden
    >
      <div className="flex size-full flex-col items-center justify-start gap-6">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-[10px]">
            <div className="h-[22px] w-[52px] animate-pulse motion-reduce:animate-none rounded-full bg-neutral-100" />
            <div className="h-[22px] w-[44px] animate-pulse motion-reduce:animate-none rounded-full bg-neutral-100" />
          </div>
          <div className="size-9 animate-pulse motion-reduce:animate-none rounded-pill bg-neutral-100" />
        </div>
        <div className="flex w-full flex-1 flex-col items-start gap-[10px]">
          <div className="flex w-full flex-col gap-[8px]">
            <div className="h-[16px] w-[78%] animate-pulse motion-reduce:animate-none rounded-chip bg-neutral-100" />
            <div className="h-[16px] w-[52%] animate-pulse motion-reduce:animate-none rounded-chip bg-neutral-100" />
          </div>
          <div className="flex w-full flex-col gap-[8px]">
            <div className="h-[14px] w-[88%] animate-pulse motion-reduce:animate-none rounded-chip bg-neutral-100" />
            <div className="h-[14px] w-[64%] animate-pulse motion-reduce:animate-none rounded-chip bg-neutral-100" />
          </div>
          <div className="mt-auto flex w-full items-center justify-between pt-[8px]">
            <div className="h-[12px] w-[72px] animate-pulse motion-reduce:animate-none rounded-chip bg-neutral-100" />
            <div className="h-[12px] w-[64px] animate-pulse motion-reduce:animate-none rounded-chip bg-neutral-100" />
          </div>
        </div>
      </div>
    </div>
  );
};
