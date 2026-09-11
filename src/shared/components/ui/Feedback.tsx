import * as React from "react";
import { cva } from "class-variance-authority";
import { Sparkles } from "lucide-react";

import { cn } from "@/shared/lib/tailwind/utils";

export const feedbackVariants = cva(
  "group/feedback flex w-full items-start gap-2.5 rounded-panel border border-card-line bg-gray-background px-4 py-4 text-body-3 text-black-secondary [&_svg]:size-4.25 [&_svg]:shrink-0 [&_svg]:text-accent-600",
);

export interface FeedbackProps {
  /** 기본 아이콘(Sparkles)을 바꾸고 싶을 때 */
  icon?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * AI 코멘트 한 줄. 본문은 `children` 으로 받고 컴포넌트는 문구를 갖지 않습니다.
 * 두 필라에서 동일한 중립 배경을 사용합니다.
 */
export const Feedback = ({
  className,
  icon = <Sparkles />,
  children,
  ...props
}: FeedbackProps & React.ComponentProps<"div">) => {
  return (
    <div data-slot="feedback" className={cn(feedbackVariants(), className)} {...props}>
      {icon}
      <div>{children}</div>
    </div>
  );
};
