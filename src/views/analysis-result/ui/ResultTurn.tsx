import { ChatBubble } from "@/shared/components/ui";
import { cn } from "@/shared/lib/tailwind/utils";
import type { ResultTurnProps } from "@/views/analysis-result/models";

import { AnalysisItem } from "./AnalysisItem";

export function ResultTurn({ turn }: ResultTurnProps) {
  const mine = turn.speaker === "me";

  return (
    <article className={cn("flex flex-col gap-2", mine ? "items-end" : "items-start")}>
      <p className="text-xs font-semibold text-gray-text">{mine ? "원본 문장" : "상대방"}</p>
      <ChatBubble
        speaker="partner"
        lang="en"
        className="max-w-full break-words rounded-lg text-base leading-relaxed sm:max-w-[620px]"
      >
        {turn.text}
      </ChatBubble>
      {turn.analysis ? <AnalysisItem item={turn.analysis} /> : null}
    </article>
  );
}
