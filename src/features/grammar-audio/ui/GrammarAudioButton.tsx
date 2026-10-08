"use client";
import type { GrammarAudioButtonProps } from "../models/interface";
import { grammarAudioErrorMessages } from "./errorMessage";
import { useGrammarAudio } from "../services/useGrammarAudio";
export function GrammarAudioButton(props: GrammarAudioButtonProps) {
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
          ? "음성 생성 중…"
          : status === "playing"
            ? "재생 중지"
            : status === "generation-error"
              ? "음성 다시 생성"
              : status === "playback-error"
                ? "재생 재시도"
                : "문장 듣기"}
      </button>
      <span className="ml-3 text-xs text-practice-secondary">AI 생성 음성</span>
      {error && (
        <p role="alert" className="text-sm text-practice-accent">
          {grammarAudioErrorMessages[error]}
        </p>
      )}
    </div>
  );
}
