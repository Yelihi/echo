import { Feedback } from "@/shared/components/ui";
import type { AnalysisItemProps } from "@/views/analysis-result/models";
import { RecordedSpeechBubble } from "./RecordedSpeechBubble";
import { DiffSegments } from "./DiffSegments";
import { ResultAudioPlayPill } from "./ResultAudioPlayPill";

export function AnalysisItem({ item }: AnalysisItemProps) {
  return (
    <div className="mt-3 flex w-full max-w-[620px] flex-col items-end gap-3 break-words text-sm leading-relaxed">
      <RecordedSpeechBubble item={item} />
      {item.audio && (
        <ResultAudioPlayPill
          signedUrl={item.audio.signedUrl}
          durationSec={item.audio.durationSec}
        />
      )}
      {item.diff?.length ? <DiffSegments segments={item.diff} /> : null}
      {item.feedback ? <Feedback>{item.feedback}</Feedback> : null}
    </div>
  );
}
