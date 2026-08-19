import { Children } from "react";
import { Sparkles } from "lucide-react";

import { cn } from "@/shared/utils/cn";
import { Divider } from "@/shared/components";

import type {
  EmptyContainerProps,
  ListContainerProps,
} from "@/widgets/latest-sources/models/interface";

function EmptyColorMark() {
  return (
    <span className="relative block size-[48px]" aria-hidden>
      <span className="absolute top-0 left-0 size-[34px] rounded-[14px] bg-blue-secondary" />
      <span className="absolute right-0 bottom-0 size-[28px] rounded-full bg-yellow-secondary" />
      <span className="absolute top-[14px] left-[14px] size-[22px] rounded-chip bg-deep-blue-secondary" />
      <Sparkles className="absolute top-[2px] right-[2px] size-[14px] text-yellow-primary" />
      <Sparkles className="absolute bottom-[8px] left-[8px] size-[12px] text-blue-primary" />
    </span>
  );
}

export const EmptyContainer = ({ title, description }: EmptyContainerProps) => {
  return (
    <div
      className="flex w-full flex-col items-center justify-center gap-[8px] py-[24px]"
      role="status"
    >
      <EmptyColorMark />
      <p className="text-body-3 font-medium text-black-primary">{title}</p>
      {description ? (
        <p className="text-body-1 font-normal text-gray-text-secondary">{description}</p>
      ) : null}
    </div>
  );
};

export const ListContainer = ({ type, icon: Icon, title, empty, children }: ListContainerProps) => {
  const isEmpty = Children.count(children) === 0;

  return (
    <div className="bg-white w-full rounded-card px-[18px] py-[20px] flex flex-col justify-start items-start gap-[10px]">
      <div className="w-full flex justify-start items-center gap-[10px]">
        <div className="h-[24px] flex justify-center items-start">
          <Icon
            className={cn(
              "size-[18px]",
              type === "role-play" ? "text-blue-primary" : "text-black-primary",
            )}
          />
        </div>
        <p className="text-heading-xs font-bold text-black-primary">{title}</p>
      </div>
      <Divider />
      <div className="flex w-full flex-col justify-items-start gap-[5px]">
        {isEmpty && empty ? <EmptyContainer {...empty} /> : children}
      </div>
    </div>
  );
};
