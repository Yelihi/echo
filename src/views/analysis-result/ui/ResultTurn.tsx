import type { ResultTurnProps } from "@/views/analysis-result/models";

import { AnalysisItem } from "./AnalysisItem";

export function ResultTurn({ turn }: ResultTurnProps) {
  const mine = turn.speaker === "me";

  return (
    <article className="grid gap-4 border-t border-card-line py-6 md:grid-cols-[140px_minmax(0,1fr)]">
      <p className="pt-1 text-body-3 text-gray-text">{mine ? "원본 문장" : "상대방"}</p>
      <p lang="en" className="min-w-0 whitespace-pre-wrap break-words text-xl leading-relaxed">
        {turn.text}
      </p>
      {turn.analysis ? (
        <div className="md:col-span-2">
          <AnalysisItem item={turn.analysis} />
        </div>
      ) : null}
    </article>
  );
}
