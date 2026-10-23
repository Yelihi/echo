"use client";

import { AudioLines, Pause, Play, RotateCcw } from "lucide-react";
import { Button } from "@/shared/components/atomics/button/Button";
import type { GrammarAudioButtonProps } from "../models/interface";
import { grammarAudioErrorMessages } from "./errorMessage";
import { useGrammarAudio } from "../services/useGrammarAudio";

export function GrammarAudioButton(props: GrammarAudioButtonProps) {
  const storedExample = "sentenceId" in props.input && props.input.sentenceId !== "source";
  const { status, error, play } = useGrammarAudio(props);

  const playing = status === "playing";
  const loading = status === "generating";
  const failed = status === "generation-error" || status === "playback-error";

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          onClick={play}
          loading={loading}
          className="min-h-11 gap-2.5 px-4 shadow-sm"
        >
          {!loading &&
            (playing ? (
              <Pause aria-hidden="true" className="size-4 fill-current" />
            ) : failed ? (
              <RotateCcw aria-hidden="true" className="size-4" />
            ) : (
              <Play aria-hidden="true" className="size-4 fill-current" />
            ))}
          {status === "generating"
            ? storedExample
              ? "음성 불러오는 중…"
              : "음성 생성 중…"
            : status === "playing"
              ? "재생 중지"
              : status === "generation-error"
                ? storedExample
                  ? "음성 다시 불러오기"
                  : "음성 다시 생성"
                : status === "playback-error"
                  ? "재생 재시도"
                  : "문장 듣기"}
        </Button>
        <span className="inline-flex items-center gap-2 text-xs text-practice-secondary">
          {playing ? (
            <svg
              viewBox="0 0 24 20"
              className="echo-audio-wave size-5 text-practice-ink"
              aria-hidden="true"
            >
              <rect x="2" y="6" width="3" height="8" rx="1.5" />
              <rect x="8" y="2" width="3" height="16" rx="1.5" />
              <rect x="14" y="4" width="3" height="12" rx="1.5" />
              <rect x="20" y="7" width="3" height="6" rx="1.5" />
            </svg>
          ) : (
            <AudioLines aria-hidden="true" className="size-4" />
          )}
          AI 생성 음성
        </span>
      </div>
      {error && (
        <p role="alert" className="text-sm text-practice-accent">
          {storedExample && error === "GENERATION_FAILED"
            ? "준비된 음성을 불러오지 못했습니다. 다시 불러오거나 상태를 확인해주세요."
            : grammarAudioErrorMessages[error]}
        </p>
      )}
    </div>
  );
}
