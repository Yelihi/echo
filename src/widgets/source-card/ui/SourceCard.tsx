"use client";

import { ArrowRight, Clock } from "lucide-react";

import { Divider, Badge } from "@/shared/components";
import { SourceCardInnerMenuButton } from "@/widgets/source-card/ui/SourceCardInnerMenuButton";

import type { SourceCardProps } from "@/widgets/source-card/models/interface";

export const SourceCard = ({
  tags,
  title,
  id,
  subTitle,
  theme,
  contentValue,
  innerMenuItems,
  onMenuAction,
}: SourceCardProps) => {
  return (
    <div className="bg-white rounded-[20px] w-full min-w-[300px] h-[220px] p-[20px] shadow-md hover:shadow-lg transition-all duration-300">
      <div className="size-full flex flex-col justify-start items-center gap-[20px]">
        <div className="w-full flex justify-between items-center">
          <div className="w-full max-w-[200px] overflow-x-scroll scrollbar-hide scroll-smooth flex justify-start items-center gap-[10px]">
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
        <div className="w-full flex flex-col justify-start items-start gap-[10px] cursor-pointer rounded-[10px] hover:shadow-md transition-all duration-300">
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
              <p className="text-body-1 text-gray-text-secondary font-normal">
                {contentValue}개 문단
              </p>
              <ArrowRight className="size-[13px] text-gray-text-secondary" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
