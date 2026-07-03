import { MessageSquare, Layers } from "lucide-react";

import { cn } from "@/shared/utils/cn";
import { SessionStateBadge } from "@/shared/components/ui";

import { convertFormatDate } from "@/widgets/latest-sessions/config/convertFortmatDate";

export interface SessionSimplifiedProps {
  title: string;
  sessionDate: Date;
  description: string;
  sessionType: "role-playing" | "memorization";
  sessionState: "completed" | "failed" | "inProgress";
}

export const SessionSimplified = ({
  title,
  sessionDate,
  description,
  sessionType,
  sessionState,
}: SessionSimplifiedProps) => {
  return (
    <div className="w-full h-fit bg-white border border-gray-border rounded-[16px] p-[16px] flex justify-between items-center cursor-pointer">
      <div className="flex justify-start items-center gap-[10px]">
        <div
          className={cn(
            "size-[42px] rounded-[12px] flex justify-center items-center",
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
    </div>
  );
};
