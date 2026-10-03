import { Feedback } from "@/shared/components/ui";
import type { AnalysisItemProps } from "@/views/analysis-result/models";
import { RecordedSpeechBubble } from "./RecordedSpeechBubble";
import { DiffSegments } from "./DiffSegments";
import { ResultAudioPlayPill } from "./ResultAudioPlayPill";

export function AnalysisItem({ item }: AnalysisItemProps) {
  return (
    <div className="grid w-full gap-4 border-t border-card-line pt-5 break-words text-body-4 leading-relaxed md:grid-cols-[140px_minmax(0,1fr)]">
      <RecordedSpeechBubble item={item} />
      <div className="flex flex-col items-start gap-4 md:col-start-2">
        {item.audio ? (
          <ResultAudioPlayPill
            signedUrl={item.audio.signedUrl}
            durationSec={item.audio.durationSec}
          />
        ) : (
          <p className="text-body-2 text-gray-text">
            녹음 파일을 불러올 수 없어 재생할 수 없습니다.
          </p>
        )}
        {item.diff?.length ? <DiffSegments segments={item.diff} /> : null}
        {item.feedback ? <Feedback>{item.feedback}</Feedback> : null}
      </div>
    </div>
  );
}
