import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/shared/lib/tailwind/utils";

export const chatBubbleVariants = cva(
  "group/chat-bubble w-fit max-w-4/5 px-4.25 py-3.25 text-body-4 leading-normal",
  {
    variants: {
      speaker: {
        // 말꼬리 쪽 모서리만 작게. Figma 18px → 토큰이 없어 panel(16)로 정규화.
        partner:
          "rounded-t-panel rounded-br-panel rounded-bl-md border border-card-line bg-card-surface text-black-secondary",
        me: "rounded-t-panel rounded-bl-panel rounded-br-md bg-accent-600 text-white",
      },
    },
    defaultVariants: {
      speaker: "partner",
    },
  },
);

export interface ChatBubbleProps {
  speaker?: VariantProps<typeof chatBubbleVariants>["speaker"];
  children: React.ReactNode;
}

/**
 * 결과 화면의 읽기 전용 대화 말풍선.
 *
 * 편집용은 `ChatBubbleInput` 입니다 — 이쪽은 테두리·그림자 없이 읽기에 집중합니다.
 */
export const ChatBubble = ({
  className,
  speaker,
  children,
  ...props
}: ChatBubbleProps & React.ComponentProps<"div">) => {
  return (
    <div
      data-slot="chat-bubble"
      data-speaker={speaker ?? "partner"}
      className={cn(chatBubbleVariants({ speaker }), className)}
      {...props}
    >
      {children}
    </div>
  );
};
