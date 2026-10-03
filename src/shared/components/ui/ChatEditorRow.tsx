import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { ArrowLeftRight, Trash } from "lucide-react";

import { cn } from "@/shared/lib/tailwind/utils";

export const chatEditorRowVariants = cva("group/chat-editor-row flex w-full", {
  variants: {
    speaker: {
      partner: "justify-start",
      me: "justify-end",
    },
  },
  defaultVariants: {
    speaker: "partner",
  },
});

export interface ChatEditorRowProps {
  speaker?: VariantProps<typeof chatEditorRowVariants>["speaker"];
  /** 화자 라벨 텍스트 (예: "상대방" / "나") */
  speakerLabel: React.ReactNode;
  /** 화자 전환 요청 */
  onFlipSpeaker?: () => void;
  onDelete?: () => void;
  /** 말풍선 슬롯. 보통 ChatBubbleInput 을 넣습니다. */
  children: React.ReactNode;
}

/**
 * 롤플레잉 에디터의 대사 한 줄.
 *
 * 화자 라벨(누르면 전환) · 삭제 버튼 · 말풍선으로 구성됩니다.
 * 삭제 버튼은 데스크톱에서는 hover·포커스 시, 모바일에서는 항상 표시합니다.
 */
export const ChatEditorRow = ({
  className,
  speaker,
  speakerLabel,
  onFlipSpeaker,
  onDelete,
  children,
  ...props
}: ChatEditorRowProps & React.ComponentProps<"div">) => {
  const isMe = speaker === "me";

  return (
    <div
      data-slot="chat-editor-row"
      data-speaker={speaker ?? "partner"}
      className={cn(chatEditorRowVariants({ speaker }), className)}
      {...props}
    >
      <div
        className={cn(
          "flex w-full max-w-full sm:max-w-4/5 flex-col gap-1.25",
          isMe ? "items-end" : "items-start",
        )}
      >
        <div className={cn("flex items-center gap-2 px-1", isMe ? "flex-row-reverse" : "flex-row")}>
          <button
            type="button"
            onClick={onFlipSpeaker}
            aria-label="화자 바꾸기"
            className={cn(
              "inline-flex cursor-pointer items-center gap-1 text-body-1 font-black tracking-wider uppercase transition-colors rounded-pill outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 [&_svg]:size-2.75",
              isMe ? "text-brand" : "text-gray-text",
            )}
          >
            {speakerLabel}
            <ArrowLeftRight />
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label="대사 삭제"
            className="inline-flex size-6.5 cursor-pointer items-center justify-center rounded-md text-gray-text-secondary opacity-100 sm:opacity-0 transition-opacity outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 group-hover/chat-editor-row:opacity-100 focus-visible:opacity-100 [&_svg]:size-3.75"
          >
            <Trash />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};
