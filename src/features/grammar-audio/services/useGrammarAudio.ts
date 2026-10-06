"use client";
import { useEffect, useRef, useState } from "react";
import type {
  GrammarAudioButtonProps,
  GrammarAudioResult,
  GrammarAudioStatus,
} from "../models/interface";
import { claimGrammarPlayback } from "./playbackCoordinator";
export function useGrammarAudio({ input, generate }: GrammarAudioButtonProps) {
  const [status, setStatus] = useState<GrammarAudioStatus>("idle");
  const [message, setMessage] = useState("");
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
    setMessage("");
    release.current = claimGrammarPlayback(stop);
    let data = speech.current;
    if (!data) {
      setStatus("generating");
      try {
        const result = await generate(input);
        if (currentGeneration !== generation.current) return;
        if (!result.ok) {
          setMessage(result.message);
          setStatus("generation-error");
          return;
        }
        data = result;
        speech.current = result;
      } catch {
        if (currentGeneration !== generation.current) return;
        setMessage("음성 생성 요청에 실패했습니다.");
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
          setMessage("음성을 재생하지 못했습니다.");
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
      setMessage("음성을 재생하지 못했습니다. 재생 버튼을 다시 눌러주세요.");
      setStatus("playback-error");
    }
  }
  return { status, message, play };
}
