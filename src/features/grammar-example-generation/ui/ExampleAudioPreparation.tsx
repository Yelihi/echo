"use client";
import { useContext, type ReactNode } from "react";
import { AudioPreparationContext } from "../services/audioPreparationQuery";
import { ExampleAudioPreparationGroup } from "./ExampleAudioPreparationGroup";
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
  const group = useContext(AudioPreparationContext);
  const content = <Preparation key={`${props.noteId}:${props.sentenceId}`} {...props} />;
  if (group) return content;
  return (
    <ExampleAudioPreparationGroup
      key={`${props.noteId}:${props.sentenceId}`}
      noteId={props.noteId}
      sentenceIds={[props.sentenceId]}
      initial={props.initial ? [props.initial] : undefined}
      read={props.read}
      retry={props.retry}
    >
      {content}
    </ExampleAudioPreparationGroup>
  );
}

function Preparation(props: ExampleAudioPreparationProps) {
  const { children } = props;
  const { preparation, error, retrying, checking, ready, preparing, requestRetry, recheck } =
    useExampleAudioPreparation(props);
  let operationId = !ready && preparation?.code ? preparation.operationId : undefined;
  if (error) operationId = error.operationId;
  let message = "음성을 준비하고 있어요.";
  const statusMessages = {
    ready: "음성 준비 완료",
    retryable: "예문은 저장됐어요. 음성 준비를 다시 요청해 주세요.",
    missing: "아직 준비된 음성이 없어요.",
    queued: message,
    processing: message,
  };
  if (preparation) message = statusMessages[preparation.status];
  if (preparation?.code) message = audioPreparationFailureMessage(preparation.code);
  if (error) message = audioPreparationFailureMessage(error.code);
  if (checking) message = "음성 상태를 확인하고 있어요.";
  const StatusIcon = ready ? CircleCheck : CircleAlert;
  let retryLabel = preparation?.status === "missing" ? "음성 생성" : "음성 준비 재시도";
  if (retrying) retryLabel = "요청 중…";

  let controls: ReactNode = null;
  if (error || checking) {
    controls = (
      <Button variant="outline" loading={checking} onClick={recheck}>
        {checking ? "확인 중…" : "상태 다시 확인"}
      </Button>
    );
  } else if (ready) {
    controls = children;
  } else if (preparation && !isAudioPreparationActive(preparation.status)) {
    controls = (
      <Button variant="outline" loading={retrying} onClick={requestRetry}>
        {retryLabel}
      </Button>
    );
  }

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
        ) : (
          <StatusIcon className="size-4 shrink-0" aria-hidden="true" />
        )}
        {message}
      </p>
      {operationId && <p className="text-xs text-practice-muted">문의 번호: {operationId}</p>}
      {controls}
    </div>
  );
}
