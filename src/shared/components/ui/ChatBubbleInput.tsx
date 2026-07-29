import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/shared/lib/tailwind/utils";

export const chatBubbleInputVariants = cva(
  "group/chat-bubble-input w-full min-w-60 resize-none border px-4 py-3 text-body-4 leading-normal text-black-primary shadow-button transition-colors outline-none placeholder:text-gray-text-secondary",
  {
    variants: {
      speaker: {
        // 말꼬리 쪽 모서리만 작게 잡아 방향을 만듭니다.
        // Figma 는 18px 이지만 대응 토큰이 없어 panel(16)로 정규화했습니다.
        partner:
          "rounded-t-panel rounded-br-panel rounded-bl-md border-card-line-strong bg-card-surface",
        me: "rounded-t-panel rounded-bl-panel rounded-br-md border-2 border-accent-200 bg-accent-50",
      },
    },
    defaultVariants: {
      speaker: "partner",
    },
  },
);

export interface ChatBubbleInputProps {
  /** partner 는 왼쪽 말꼬리, me 는 오른쪽 말꼬리 + accent 배경 */
  speaker?: VariantProps<typeof chatBubbleInputVariants>["speaker"];
}

/**
 * 편집 가능한 말풍선.
 *
 * 결과 화면의 읽기 전용 `ChatBubble` 과는 다른 컴포넌트입니다 —
 * 이쪽은 테두리와 그림자가 있어 입력 가능하다는 걸 드러냅니다.
 */
export const ChatBubbleInput = ({
  className,
  speaker,
  rows = 1,
  ...props
}: ChatBubbleInputProps & React.ComponentProps<"textarea">) => {
  return (
    <textarea
      rows={rows}
      data-slot="chat-bubble-input"
      data-speaker={speaker ?? "partner"}
      className={cn(chatBubbleInputVariants({ speaker }), className)}
      {...props}
    />
  );
};
