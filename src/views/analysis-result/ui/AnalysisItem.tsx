import { Feedback } from "@/shared/components/ui";
import type { AnalysisItemProps } from "@/views/analysis-result/models";
import { RecordedSpeechBubble } from "./RecordedSpeechBubble";
import { DiffSegments } from "./DiffSegments";
import { ResultAudioPlayPill } from "./ResultAudioPlayPill";

export function AnalysisItem({ item }: AnalysisItemProps) {
  return (
    <div className="mt-3 flex w-full max-w-[620px] flex-col items-end gap-3 break-words text-sm leading-relaxed">
      <RecordedSpeechBubble item={item} />
      {item.audio ? (
        <ResultAudioPlayPill
          signedUrl={item.audio.signedUrl}
          durationSec={item.audio.durationSec}
        />
      ) : (
        <p className="text-body-2 text-gray-text">녹음 파일을 불러올 수 없어 재생할 수 없습니다.</p>
      )}
      {item.diff?.length ? <DiffSegments segments={item.diff} /> : null}
      {item.feedback ? <Feedback>{item.feedback}</Feedback> : null}
    </div>
  );
}
