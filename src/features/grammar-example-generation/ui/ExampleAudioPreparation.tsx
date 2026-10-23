"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type {
  AudioPreparation,
  AudioPreparationResult,
  ExampleAudioCommand,
} from "@/entities/grammar-audio";
import { Button } from "@/shared/components/atomics/button/Button";

interface Props {
  noteId: string;
  sentenceId: string;
  initial?: AudioPreparation;
  read: (command: ExampleAudioCommand) => Promise<AudioPreparationResult>;
  retry: (command: ExampleAudioCommand) => Promise<AudioPreparationResult>;
  children?: ReactNode;
}
const active = (status?: string) => status === "queued" || status === "processing";

export function ExampleAudioPreparation(props: Props) {
  return <Preparation key={`${props.noteId}:${props.sentenceId}`} {...props} />;
}

function Preparation({ noteId, sentenceId, initial, read, retry, children }: Props) {
  const [preparation, setPreparation] = useState(initial);
  const [error, setError] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const generation = useRef(0);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    const lifetime = generation;
    const current = ++lifetime.current;
    let timer: ReturnType<typeof setTimeout> | undefined;
    async function poll() {
      try {
        const result = await read({ noteId, sentenceIds: [sentenceId] });
        if (generation.current !== current) return;
        const next = result.ok
          ? result.data.find((item) => item.sentenceId === sentenceId)
          : undefined;
        if (!next) {
          setError(true);
          return;
        }
        setPreparation(next);
        setError(false);
        if (active(next.status)) timer = setTimeout(poll, 3000);
      } catch {
        if (generation.current === current) setError(true);
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
      setError(!next);
      if (next) {
        setPreparation(next);
        setRefresh((value) => value + 1);
      }
    } catch {
      if (current === generation.current) setError(true);
    } finally {
      if (current === generation.current) setRetrying(false);
    }
  }

  return (
    <div className="space-y-2">
      <p role="status" className="text-sm text-practice-muted">
        {error
          ? "음성 상태를 확인하지 못했어요."
          : preparation?.status === "ready"
            ? "음성 준비 완료"
            : preparation?.status === "retryable"
              ? "예문은 저장됐어요. 음성 준비를 다시 요청해 주세요."
              : preparation?.status === "missing"
                ? "아직 준비된 음성이 없어요."
                : "음성을 준비하고 있어요."}
      </p>
      {error ? (
        <Button variant="outline" onClick={() => setRefresh((value) => value + 1)}>
          상태 다시 확인
        </Button>
      ) : preparation?.status === "ready" ? (
        children
      ) : preparation && !active(preparation.status) ? (
        <Button variant="outline" disabled={retrying} onClick={() => void requestRetry()}>
          {retrying
            ? "요청 중…"
            : preparation.status === "missing"
              ? "음성 생성"
              : "음성 준비 재시도"}
        </Button>
      ) : null}
    </div>
  );
}
