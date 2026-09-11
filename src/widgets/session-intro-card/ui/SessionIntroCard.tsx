"use client";

import { useRouter } from "next/navigation";

import { cva } from "class-variance-authority";
import { cn } from "@/shared/utils/cn";
import { ArrowRight, MessageSquare, Layers } from "lucide-react";

import { Button } from "@/shared/components";
import { SessionIntroCardProps } from "@/widgets/session-intro-card/models/interface";

const sessionIntroCardVariants = cva(
  "relative w-full overflow-hidden rounded-hero border border-card-line p-6 sm:p-8",
  {
    variants: {
      type: {
        "role-play": "bg-silver text-brand",
        memorization: "bg-brand text-on-brand",
      },
    },
  },
);

export const SessionIntroCard = ({ type, currentSessions }: SessionIntroCardProps) => {
  const router = useRouter();

  const routeStartSession = () => {
    return type === "role-play"
      ? router.push("/role-playing")
      : router.push("/sentence-memorization");
  };

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
    <div className={cn(sessionIntroCardVariants({ type }))}>
      <div className="flex w-full flex-col justify-items-center gap-10">
        <div className="flex flex-col justify-start items-start gap-[8px]">
          <p className="text-subtitle-sm font-medium tracking-widest text-current">
            {textByType[type].info}
          </p>
          <h2 className="text-heading-lg font-bold text-current">{textByType[type].title}</h2>
          <p className="max-w-sm text-body-4 font-normal text-current">
            {textByType[type].subTitle}
          </p>
        </div>
        <div className="w-full flex justify-between items-center">
          <p className="text-body-2 text-current font-semibold">자료 {currentSessions}개</p>
          <Button
            variant={"ghost"}
            size={"lg"}
            className={cn(
              "z-10",
              type === "role-play"
                ? "bg-brand text-on-brand hover:bg-brand-hover hover:text-on-brand"
                : "bg-card-surface text-brand hover:bg-silver hover:text-brand",
            )}
            onClick={routeStartSession}
          >
            시작하기
            <ArrowRight />
          </Button>
        </div>
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute -right-6 top-10 flex size-40 items-center justify-center opacity-10"
      >
        {type === "role-play" ? (
          <MessageSquare className="size-full text-current" />
        ) : (
          <Layers className="size-full text-current" />
        )}
      </div>
    </div>
  );
};
