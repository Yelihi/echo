import { cva } from "class-variance-authority";
import { ArrowRight, MessageSquare, Layers } from "lucide-react";

import { Button } from "@/shared/components";
import { SessionIntroCardProps } from "@/widgets/session-intro-card/models/interface";

export const SessionIntroCard = ({ type, currentSessions }: SessionIntroCardProps) => {
  const sessionIntroCardVariants = cva(
    "relative p-[20px] cursor-pointer rounded-[24px] hover:shadow-lg transition-all duration-300",
    {
      variants: {
        type: {
          "role-play": "bg-blue-primary",
          memorization: "bg-depp-blue-primary",
        },
      },
    },
  );

  /**
   * 현재는 2가지 타입만 존재하기에 dictionary 처리. 타입 추가 시 정리 필요
   */
  const textByType: Record<
    SessionIntroCardProps["type"],
    Record<"info" | "title" | "subTitle", string>
  > = {
    "role-play": {
      info: "ROLEPLAY",
      title: "롤플레잉 회화",
      subTitle: "상대방과 주고받는 1:1 대화를 직접 말하며 연습해요.",
    },
    memorization: {
      info: "MEMORIZATION",
      title: "문장 암기",
      subTitle: "긴 본문을 통째로 외워 한 번에 말하며 확인해요.",
    },
  };

  return (
    <div className={sessionIntroCardVariants({ type })}>
      <div className="w-full min-w-[400px] flex flex-col justify-items-center gap-[30px]">
        <div className="flex flex-col justify-start items-start gap-[8px]">
          <p className="text-body-1 font-bold text-white">{textByType[type].info}</p>
          <h2 className="text-heading-md font-bold text-white">{textByType[type].title}</h2>
          <p className="text-body-3 font-normal text-white whitespace-nowrap">
            {textByType[type].subTitle}
          </p>
        </div>
        <div className="w-full flex justify-between items-center">
          <p className="text-body-2 text-white font-semibold">자료 {currentSessions}개</p>
          <Button
            variant={"ghost"}
            size={"lg"}
            className="apple-glass border-white text-white z-10"
          >
            시작하기
            <ArrowRight />
          </Button>
        </div>
      </div>
      <div className="absolute bottom-[5%] right-[2%] h-[50%] aspect-square flex justify-center items-center opacity-30">
        {type === "role-play" ? (
          <MessageSquare className="size-full text-white" />
        ) : (
          <Layers className="size-full text-white" />
        )}
      </div>
    </div>
  );
};
