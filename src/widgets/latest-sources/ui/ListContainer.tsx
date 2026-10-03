import { Children } from "react";
import { EmptyIllustration } from "@/shared/components/motion/EmptyIllustration";

import { cn } from "@/shared/utils/cn";
import { Divider } from "@/shared/components";

import type {
  EmptyContainerProps,
  ListContainerProps,
} from "@/widgets/latest-sources/models/interface";

export const EmptyContainer = ({ title, description }: EmptyContainerProps) => {
  return (
    <div
      className="flex w-full flex-col items-center justify-center gap-3 px-4 py-10 text-center"
      role="status"
    >
      <EmptyIllustration />
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
    <div className="bg-transparent w-full min-w-0 py-2 flex flex-col justify-start items-start gap-[10px]">
      <div className="w-full flex justify-start items-center gap-[10px]">
        <div className="h-[24px] flex justify-center items-start">
          <Icon
            className={cn(
              "size-[18px]",
              type === "role-play" ? "text-brand" : "text-black-primary",
            )}
          />
        </div>
        <p className="text-heading-xs font-medium text-black-primary">{title}</p>
      </div>
      <Divider />
      <div className="flex w-full flex-col justify-items-start gap-[5px]">
        {isEmpty && empty ? <EmptyContainer {...empty} /> : children}
      </div>
    </div>
  );
};
