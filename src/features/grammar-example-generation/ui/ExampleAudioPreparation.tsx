"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type {
  AudioPreparation,
  AudioPreparationResult,
  ExampleAudioCommand,
} from "@/entities/grammar-audio";
import { CircleCheck, CircleAlert } from "lucide-react";
import { Spinner } from "@/shared/components/atomics/spinner/Spinner";
import { Button } from "@/shared/components/atomics/button/Button";
import { errorPopupManager } from "@/shared/lib/error-popup";

interface Props {
  noteId: string;
  sentenceId: string;
  initial?: AudioPreparation;
  read: (command: ExampleAudioCommand) => Promise<AudioPreparationResult>;
  retry: (command: ExampleAudioCommand) => Promise<AudioPreparationResult>;
  children?: ReactNode;
}
const active = (status?: string) => status === "queued" || status === "processing";
type Failure = { code: string; operationId?: string };
function failureMessage(code: string) {
  if (code === "UNAUTHORIZED") return "로그인이 만료됐어요. 다시 로그인해 주세요.";
  if (code === "INVALID_INPUT") return "예문 정보를 확인할 수 없어요. 페이지를 새로고침해 주세요.";
  if (code === "NOT_INVITED") return "이 계정은 AI 음성 기능을 사용할 권한이 없어요.";
  if (code === "RATE_LIMITED")
    return "음성 생성 요청 한도에 도달했어요. 잠시 후 다시 시도해 주세요.";
  if (code === "PROCESSOR_UNAVAILABLE")
    return "음성 생성 서버에 연결하지 못했어요. 예문은 저장되어 있어요.";
  return "음성 상태를 확인하지 못했어요. 잠시 후 다시 시도해 주세요.";
}
function showFailure(title: string, error: Failure) {
  errorPopupManager.open({
    title,
    code: error.code,
    message:
      failureMessage(error.code) + (error.operationId ? `\n문의 번호: ${error.operationId}` : ""),
  });
}

export function ExampleAudioPreparation(props: Props) {
  return <Preparation key={`${props.noteId}:${props.sentenceId}`} {...props} />;
}

function Preparation({ noteId, sentenceId, initial, read, retry, children }: Props) {
  const [preparation, setPreparation] = useState(initial);
  const [error, setError] = useState<Failure | null>(null);
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
    function failed(failure: Failure) {
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
        if (active(next.status)) timer = setTimeout(poll, 3000);
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
    checking || retrying || (!error && (!preparation || active(preparation.status)));

  return (
    <div className="w-fit max-w-full space-y-3 rounded-2xl border border-practice-line bg-practice-canvas/60 p-4">
      <p
        role="status"
        className="flex items-center gap-2 text-xs font-medium leading-5 text-practice-secondary"
      >
        {preparing ? (
          <Spinner
            className="size-4 text-current"
            aria-hidden="true"
            role={undefined}
            aria-label={undefined}
          />
        ) : ready ? (
          <CircleCheck className="size-4 shrink-0" aria-hidden="true" />
        ) : (
          <CircleAlert className="size-4 shrink-0" aria-hidden="true" />
        )}
        {checking
          ? "음성 상태를 확인하고 있어요."
          : error
            ? failureMessage(error.code)
            : preparation?.status === "ready"
              ? "음성 준비 완료"
              : preparation?.status === "retryable"
                ? "예문은 저장됐어요. 음성 준비를 다시 요청해 주세요."
                : preparation?.status === "missing"
                  ? "아직 준비된 음성이 없어요."
                  : "음성을 준비하고 있어요."}
      </p>
      {error?.operationId && (
        <p className="text-xs text-practice-muted">문의 번호: {error.operationId}</p>
      )}
      {error ? (
        <Button
          variant="outline"
          loading={checking}
          onClick={() => {
            manualRead.current = true;
            setChecking(true);
            setRefresh((value) => value + 1);
          }}
        >
          {checking ? "확인 중…" : "상태 다시 확인"}
        </Button>
      ) : preparation?.status === "ready" ? (
        children
      ) : preparation && !active(preparation.status) ? (
        <Button variant="outline" loading={retrying} onClick={() => void requestRetry()}>
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
