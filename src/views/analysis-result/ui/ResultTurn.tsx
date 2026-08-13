import { ChatBubble } from "@/shared/components/ui";
import { cn } from "@/shared/lib/tailwind/utils";
import type { ResultTurnProps } from "@/views/analysis-result/models";

import { AnalysisItem } from "./AnalysisItem";

export function ResultTurn({ turn }: ResultTurnProps) {
  const mine = turn.speaker === "me";

  return (
    <article className={cn("flex flex-col gap-2", mine ? "items-end" : "items-start")}>
      <ChatBubble speaker={turn.speaker} className="max-w-[620px]">
        {turn.text}
      </ChatBubble>
      {turn.analysis ? <AnalysisItem item={turn.analysis} /> : null}
    </article>
  );
}
