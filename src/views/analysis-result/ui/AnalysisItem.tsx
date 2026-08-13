import { Feedback } from "@/shared/components/ui";
import type { AnalysisItemProps } from "@/views/analysis-result/models";

import { DiffSegments } from "./DiffSegments";
import { ResultAudioPlayPill } from "./ResultAudioPlayPill";

export function AnalysisItem({ item }: AnalysisItemProps) {
  if (item.state === "pending") {
    return <p className="text-body-2 text-gray-text">분석 대기 중</p>;
  }

  if (item.state === "missing") {
    return <p className="text-body-2 text-red-primary">결과 없음</p>;
  }

  return (
    <div className="flex max-w-[620px] flex-col items-end gap-2">
      {item.audio ? (
        <ResultAudioPlayPill
          signedUrl={item.audio.signedUrl}
          durationSec={item.audio.durationSec}
        />
      ) : null}
      {item.transcript ? (
        <p className="text-body-2 text-gray-text">Transcript: {item.transcript}</p>
      ) : null}
      {item.diff?.length ? <DiffSegments segments={item.diff} /> : null}
      {item.feedback ? <Feedback>{item.feedback}</Feedback> : null}
    </div>
  );
}
