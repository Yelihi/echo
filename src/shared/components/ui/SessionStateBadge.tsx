import { cva } from "class-variance-authority";
import { cn } from "@/shared/utils/cn";

export interface SessionStateBadgeProps {
  state: "completed" | "failed" | "inProgress" | "pending" | "partial" | "practicing";
}

const mappedLabel = {
  practicing: "연습 중",
  completed: "분석 완료",
  failed: "분석 실패",
  partial: "일부 실패",
  inProgress: "분석 중",
  pending: "분석 전",
};

const sessionStateBadgeGroupVariant = cva(
  "min-w-25 h-7 px-3 rounded-pill flex justify-center items-center gap-[10px]",
  {
    variants: {
      state: {
        practicing: "bg-blue-secondary text-blue-primary",
        completed: "bg-green-secondary text-green-primary",
        failed: "bg-yellow-secondary text-yellow-primary",
        partial: "bg-yellow-secondary text-yellow-primary",
        inProgress: "bg-gray-background text-brand",
        pending: "border border-card-line-strong bg-card-surface text-gray-text",
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
