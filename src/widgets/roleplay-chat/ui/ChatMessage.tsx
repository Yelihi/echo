"use client";

// import { cva } from "class-variance-authority";
import { ArrowRightLeft } from "lucide-react";

import type { ChatMessageProps } from "@/widgets/roleplay-chat/models/interface";

// const chatMessageVariants = cva("", {
//     variants: {
//         order: {
//             1: "",
//             2: ""
//         }
//     }

// })

// const chatMessageSpeakerVariants = cva()
// const chatMessageContentVariants = cva()

export const ChatMessage = ({ id, order, text, changeOrder, changeMessage }: ChatMessageProps) => {
  const switchSpeakerThisMessage = () => {
    changeOrder(id, order === 1 ? 2 : 1);
  };

  const changeThisMessageText = (e: React.ChangeEvent<HTMLInputElement>) => {
    changeMessage(id, e.target.value);
  };

  return (
    <div className="w-full flex flex-col items-start gap-2">
      <div className="w-fit flex justify-start items-center gap-[3px]">
        <p className="text-body-1 font-extrabold text-gray-text">{order === 1 ? "상대방" : "나"}</p>
        <button
          className="size-8 flex justify-center items-center rounded-pill border border-control-line outline-none focus-visible:ring-2 focus-visible:ring-brand"
          type="button"
          aria-label="화자 바꾸기"
          onClick={switchSpeakerThisMessage}
        >
          <ArrowRightLeft className="size-[12px] text-gray-text" />
        </button>
      </div>
      <input
        aria-label={order === 1 ? "상대방 대사" : "내 대사"}
        type="text"
        value={text}
        onChange={changeThisMessageText}
        className="w-full min-w-0 max-w-xl rounded-panel border border-control-line bg-card-surface px-4 py-3 text-body-4 text-black-primary outline-none focus-visible:ring-1 focus-visible:ring-brand"
      />
    </div>
  );
};
