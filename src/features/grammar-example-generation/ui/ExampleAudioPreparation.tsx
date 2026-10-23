"use client";
import { CircleCheck, CircleAlert } from "lucide-react";
import { Spinner } from "@/shared/components/atomics/spinner/Spinner";
import { Button } from "@/shared/components/atomics/button/Button";
import type { ExampleAudioPreparationProps } from "../models/audioPreparation";
import {
  audioPreparationFailureMessage,
  isAudioPreparationActive,
} from "../models/audioPreparationMessage";
import { useExampleAudioPreparation } from "../services/useExampleAudioPreparation";

export function ExampleAudioPreparation(props: ExampleAudioPreparationProps) {
  return <Preparation key={`${props.noteId}:${props.sentenceId}`} {...props} />;
}

function Preparation(props: ExampleAudioPreparationProps) {
  const { children } = props;
  const { preparation, error, retrying, checking, ready, preparing, requestRetry, recheck } =
    useExampleAudioPreparation(props);
  const operationId = error
    ? error.operationId
    : !ready && preparation?.code
      ? preparation.operationId
      : undefined;

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
            ? audioPreparationFailureMessage(error.code)
            : preparation?.status === "ready"
              ? "음성 준비 완료"
              : preparation?.code
                ? audioPreparationFailureMessage(preparation.code)
                : preparation?.status === "retryable"
                  ? "예문은 저장됐어요. 음성 준비를 다시 요청해 주세요."
                  : preparation?.status === "missing"
                    ? "아직 준비된 음성이 없어요."
                    : "음성을 준비하고 있어요."}
      </p>
      {operationId && <p className="text-xs text-practice-muted">문의 번호: {operationId}</p>}
      {error ? (
        <Button variant="outline" loading={checking} onClick={recheck}>
          {checking ? "확인 중…" : "상태 다시 확인"}
        </Button>
      ) : preparation?.status === "ready" ? (
        children
      ) : preparation && !isAudioPreparationActive(preparation.status) ? (
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
