"use client";
import type { RecordedAudioPlayerProps } from "@/views/recording/models/ui";

import { useRecordedAudioUrl } from "@/views/recording/services/hooks/useRecordedAudioUrl";

export function RecordedAudioPlayer({ blob }: RecordedAudioPlayerProps) {
  const source = useRecordedAudioUrl(blob);
  return (
    <div className="w-full max-w-sm">
      <p className="mb-2 text-sm font-medium text-white">내 녹음 듣기</p>
      <audio aria-label="내 녹음 듣기" controls src={source} className="h-12 w-full" />
    </div>
  );
}
