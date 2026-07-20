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
    <div className="w-full flex flex-col items-start gap-[5px]">
      <div className="w-fit flex justify-start items-center gap-[3px]">
        <p className="text-body-1 font-extrabold text-gray-text">{order === 1 ? "상대방" : "나"}</p>
        <button
          className="size-[12px] flex justify-center items-center"
          onClick={switchSpeakerThisMessage}
        >
          <ArrowRightLeft className="size-[12px] text-gray-text" />
        </button>
      </div>
      <input
        type="text"
        value={text}
        onChange={changeThisMessageText}
        className="w-full max-w-[300px] h-fit p-[10px] text-body-4 font-normal text-black-primary border-[1.5px] border-gray-border"
      />
    </div>
  );
};
