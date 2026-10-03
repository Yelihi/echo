import { TriangleAlert } from "lucide-react";
import { cn } from "@/shared/lib/tailwind/utils";
import type { AnalysisItemProps } from "../models";

export function RecordedSpeechBubble({ item }: AnalysisItemProps) {
  const pending = item.state === "pending";
  const unavailable = !pending && !item.transcript?.trim();
  return (
    <>
      <p className="pt-1 text-body-3 text-gray-text">실제 발화</p>
      <div
        data-slot="recorded-speech"
        lang={!pending && !unavailable ? "en" : "ko"}
        className={cn(
          "min-w-0 whitespace-pre-wrap break-words text-xl leading-relaxed text-black-primary",
          pending && "border border-card-line bg-card-surface text-gray-text",
          unavailable && "border border-red-200 bg-red-50 text-red-800",
        )}
      >
        {pending ? (
          "녹음한 발화를 분석하고 있습니다."
        ) : unavailable ? (
          <span className="flex items-start gap-2">
            <TriangleAlert className="mt-1 size-4 shrink-0" aria-hidden="true" />
            <span>
              녹음의 발화를 문장으로 표시하지 못했습니다.
              {item.audio && (
                <span className="mt-1 block text-sm">저장된 녹음은 아래에서 들을 수 있습니다.</span>
              )}
            </span>
          </span>
        ) : (
          item.transcript
        )}
      </div>
    </>
  );
}
