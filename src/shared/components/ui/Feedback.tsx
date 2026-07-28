import * as React from "react";
import { cva } from "class-variance-authority";
import { Sparkles } from "lucide-react";

import { cn } from "@/shared/lib/tailwind/utils";

export const feedbackVariants = cva(
  "group/feedback flex w-full items-start gap-2.5 rounded-control bg-accent-50 px-3.75 py-3.25 text-body-3 text-black-secondary [&_svg]:size-4.25 [&_svg]:shrink-0 [&_svg]:text-accent-600",
);

export interface FeedbackProps {
  /** 기본 아이콘(Sparkles)을 바꾸고 싶을 때 */
  icon?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * AI 코멘트 한 줄. 본문은 `children` 으로 받고 컴포넌트는 문구를 갖지 않습니다.
 * 배경이 accent 계열이라 `data-pillar="memo"` 안에서는 네이비 톤으로 전환됩니다.
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
