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
  const request = useRef(0);
  const audio = useRef<HTMLAudioElement | null>(null);
  const speech = useRef<Extract<GrammarAudioResult, { ok: true }> | null>(null);
  const release = useRef<(() => void) | null>(null);
  function stop() {
    request.current++;
    audio.current?.pause();
    audio.current = null;
    release.current?.();
    release.current = null;
    setStatus("idle");
  }
  useEffect(() => {
    speech.current = null;
    setStatus("idle");
    const lifecycleRequest = request;
    return () => {
      lifecycleRequest.current++;
      audio.current?.pause();
      audio.current = null;
      release.current?.();
    };
  }, [input.noteId, input.sentenceId, input.noteVersion]);
  async function play() {
    if (status === "playing") {
      stop();
      return;
    }
    // 같은 버튼의 재시도는 이전 소유권만 반납한 뒤 새 요청을 시작한다.
    release.current?.();
    release.current = null;
    const token = ++request.current;
    setMessage("");
    release.current = claimGrammarPlayback(stop);
    let data = speech.current;
    if (!data) {
      setStatus("generating");
      try {
        const result = await generate(input);
        if (token !== request.current) return;
        if (!result.ok) {
          setMessage(result.message);
          setStatus("generation-error");
          return;
        }
        data = result;
        speech.current = result;
      } catch {
        if (token !== request.current) return;
        setMessage("음성 생성 요청에 실패했습니다.");
        setStatus("generation-error");
        return;
      }
    }
    try {
      const player = new Audio(`data:${data.mimeType};base64,${data.audioBase64}`);
      audio.current = player;
      player.onended = () => {
        if (token === request.current) stop();
      };
      player.onerror = () => {
        if (token === request.current) {
          setMessage("음성을 재생하지 못했습니다.");
          setStatus("playback-error");
        }
      };
      await player.play();
      if (token !== request.current) {
        player.pause();
        return;
      }
      setStatus("playing");
    } catch {
      if (token !== request.current) return;
      setMessage("음성을 재생하지 못했습니다. 재생 버튼을 다시 눌러주세요.");
      setStatus("playback-error");
    }
  }
  return { status, message, play };
}
