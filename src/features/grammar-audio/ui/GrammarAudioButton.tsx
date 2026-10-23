"use client";

import type { GrammarAudioButtonProps } from "../models/interface";
import { grammarAudioErrorMessages } from "./errorMessage";
import { useGrammarAudio } from "../services/useGrammarAudio";

export function GrammarAudioButton(props: GrammarAudioButtonProps) {
  const storedExample = "sentenceId" in props.input && props.input.sentenceId !== "source";
  const { status, error, play } = useGrammarAudio(props);

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={play}
        disabled={status === "generating"}
        className="min-h-11 rounded-full border border-practice-line px-4 text-sm text-practice-body transition-shadow hover:shadow-sm disabled:opacity-50"
      >
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
      </button>
      <span className="ml-3 text-xs text-practice-secondary">AI 생성 음성</span>
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
