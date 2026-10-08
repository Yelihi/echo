"use client";
import { useEffect, useRef, useState } from "react";
import type {
  GrammarAudioButtonProps,
  GrammarAudioResult,
  GrammarAudioStatus,
  GrammarAudioErrorCode,
} from "../models/interface";
import { claimGrammarPlayback } from "./playbackCoordinator";
export function useGrammarAudio({ input, generate }: GrammarAudioButtonProps) {
  const [status, setStatus] = useState<GrammarAudioStatus>("idle");
  const [error, setError] = useState<GrammarAudioErrorCode | null>(null);
  const generation = useRef(0);
  const audio = useRef<HTMLAudioElement | null>(null);
  const speech = useRef<Extract<GrammarAudioResult, { ok: true }> | null>(null);
  const release = useRef<(() => void) | null>(null);
  const sourceKey =
    "sessionId" in input
      ? JSON.stringify(["session", input.sessionId, input.questionId])
      : JSON.stringify(["note", input.noteId, input.sentenceId, input.noteVersion]);
  function stop() {
    generation.current++;
    audio.current?.pause();
    audio.current = null;
    release.current?.();
    release.current = null;
    setStatus("idle");
  }
  useEffect(() => {
    speech.current = null;
    setError(null);
    setStatus("idle");
    const lifecycleGeneration = generation;
    return () => {
      lifecycleGeneration.current++;
      audio.current?.pause();
      audio.current = null;
      release.current?.();
    };
  }, [sourceKey]);
  async function play() {
    if (status === "playing") {
      stop();
      return;
    }
    // 이전 소유권을 남겨 두면 재획득 시 stop이 호출되어 새 요청의 세대까지 무효화되므로 먼저 반납한다.
    release.current?.();
    release.current = null;
    const currentGeneration = ++generation.current;
    setError(null);
    release.current = claimGrammarPlayback(stop);
    let data = speech.current;
    if (!data) {
      setStatus("generating");
      try {
        const result = await generate(input);
        if (currentGeneration !== generation.current) return;
        if (!result.ok) {
          setError(result.code);
          setStatus("generation-error");
          return;
        }
        data = result;
        speech.current = result;
      } catch {
        if (currentGeneration !== generation.current) return;
        setError("GENERATION_FAILED");
        setStatus("generation-error");
        return;
      }
    }
    try {
      const player = new Audio(`data:${data.mimeType};base64,${data.audioBase64}`);
      audio.current = player;
      player.onended = () => {
        if (currentGeneration === generation.current) stop();
      };
      player.onerror = () => {
        if (currentGeneration === generation.current) {
          setError("PLAYBACK_FAILED");
          setStatus("playback-error");
        }
      };
      await player.play();
      if (currentGeneration !== generation.current) {
        player.pause();
        return;
      }
      setStatus("playing");
    } catch {
      if (currentGeneration !== generation.current) return;
      setError("PLAYBACK_FAILED");
      setStatus("playback-error");
    }
  }
  return { status, error, play };
}
