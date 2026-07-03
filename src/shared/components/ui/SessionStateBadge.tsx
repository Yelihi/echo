import { cva } from "class-variance-authority";
import { cn } from "@/shared/utils/cn";

export interface SessionStateBadgeProps {
  state: "completed" | "failed" | "inProgress";
}

const mappedLabel = {
  completed: "분석 완료",
  failed: "일부 실패",
  inProgress: "분석 중",
};

const sessionStateBadgeGroupVariant = cva(
  "w-[100px] h-[25px] rounded-full flex justify-center items-center gap-[10px]",
  {
    variants: {
      state: {
        completed: "bg-green-secondary text-green-primary",
        failed: "bg-yellow-secondary text-yellow-primary",
        inProgress: "bg-blue-secondary text-blue-primary",
      },
    },
  },
);

export const SessionStateBadge = ({ state }: SessionStateBadgeProps) => {
  return (
    <div className={cn(sessionStateBadgeGroupVariant({ state }))}>
      <p className="text-body-1 font-bold">{mappedLabel[state]}</p>
    </div>
  );
};
