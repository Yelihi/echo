"use client";
import { useEffect, useRef, useState } from "react";
import { errorPopupManager } from "@/shared/lib/error-popup";
import type {
  ExampleAudioPreparationProps,
  AudioPreparationFailure,
} from "../models/audioPreparation";
import {
  audioPreparationFailureMessage,
  isAudioPreparationActive,
} from "../models/audioPreparationMessage";

function showFailure(title: string, error: AudioPreparationFailure) {
  errorPopupManager.open({
    title,
    code: error.code,
    message:
      audioPreparationFailureMessage(error.code) +
      (error.operationId ? `\n문의 번호: ${error.operationId}` : ""),
  });
}

export function useExampleAudioPreparation({
  noteId,
  sentenceId,
  initial,
  read,
  retry,
}: ExampleAudioPreparationProps) {
  const [preparation, setPreparation] = useState(initial);
  const [error, setError] = useState<AudioPreparationFailure | null>(null);
  const [retrying, setRetrying] = useState(false);
  const [checking, setChecking] = useState(false);
  const generation = useRef(0);
  const manualRead = useRef(false);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    const lifetime = generation;
    const current = ++lifetime.current;
    let notify = manualRead.current;
    manualRead.current = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    function failed(failure: AudioPreparationFailure) {
      setError(failure);
      if (notify) showFailure("음성 상태를 확인하지 못했습니다", failure);
    }
    async function poll() {
      try {
        const result = await read({ noteId, sentenceIds: [sentenceId] });
        if (generation.current !== current) return;
        const next = result.ok
          ? result.data.find((item) => item.sentenceId === sentenceId)
          : undefined;
        if (!next) {
          failed(result.ok ? { code: "FAILED" } : result);
          return;
        }
        setPreparation(next);
        setError(null);
        if (isAudioPreparationActive(next.status)) timer = setTimeout(poll, 3000);
      } catch {
        if (generation.current === current) failed({ code: "FAILED" });
      } finally {
        notify = false;
        if (generation.current === current) setChecking(false);
      }
    }
    void poll();
    return () => {
      lifetime.current++;
      clearTimeout(timer);
    };
  }, [noteId, sentenceId, read, refresh]);

  async function requestRetry() {
    if (retrying) return;
    const current = ++generation.current;
    setRetrying(true);
    try {
      const result = await retry({ noteId, sentenceIds: [sentenceId] });
      if (current !== generation.current) return;
      const next = result.ok
        ? result.data.find((item) => item.sentenceId === sentenceId)
        : undefined;
      if (!next) {
        const failure = result.ok ? { code: "FAILED" } : result;
        setError(failure);
        showFailure("음성 준비를 요청하지 못했습니다", failure);
      } else {
        setError(null);
        setPreparation(next);
        if (next.status === "retryable" || next.code) {
          showFailure("음성 준비를 요청하지 못했습니다", {
            code: next.code ?? "FAILED",
            operationId: next.operationId,
          });
        }
        setRetrying(false);
        setRefresh((value) => value + 1);
      }
    } catch {
      if (current === generation.current) {
        setError({ code: "FAILED" });
        showFailure("음성 준비를 요청하지 못했습니다", { code: "FAILED" });
      }
    } finally {
      if (current === generation.current) setRetrying(false);
    }
  }

  const ready = !error && preparation?.status === "ready";
  const preparing =
    checking ||
    retrying ||
    (!error && (!preparation || isAudioPreparationActive(preparation.status)));

  function recheck() {
    manualRead.current = true;
    setChecking(true);
    setRefresh((value) => value + 1);
  }
  return { preparation, error, retrying, checking, ready, preparing, requestRetry, recheck };
}
