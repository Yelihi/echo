import type { ResultAudioPlayPillProps } from "@/views/analysis-result/models";

export function ResultAudioPlayPill({ signedUrl }: ResultAudioPlayPillProps) {
  return (
    <audio
      controls
      preload="none"
      src={signedUrl}
      aria-label="저장된 내 녹음 듣기"
      className="h-12 w-full max-w-sm"
    />
  );
}
