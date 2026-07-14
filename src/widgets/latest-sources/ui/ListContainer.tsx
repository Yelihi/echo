import { cn } from "@/shared/utils/cn";
import { Divider } from "@/shared/components";

import type { ListContainerProps } from "@/widgets/latest-sources/models/interface";

export const ListContainer = ({ type, icon: Icon, title, children }: ListContainerProps) => {
  return (
    <div className="bg-white w-full rounded-[20px] px-[18px] py-[20px] flex flex-col justify-start items-start gap-[10px]">
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
      <div className="flex flex-col justify-items-start gap-[5px]">{children}</div>
    </div>
  );
};
