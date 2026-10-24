"use client";
import { useCallback, useContext } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AudioPreparation } from "@/entities/grammar-audio";
import { errorPopupManager } from "@/shared/lib/error-popup";
import type {
  ExampleAudioPreparationProps,
  AudioPreparationFailure,
} from "../models/audioPreparation";
import {
  audioPreparationFailureMessage,
  isAudioPreparationActive,
} from "../models/audioPreparationMessage";
import {
  AudioPreparationContext,
  AudioPreparationError,
  audioPreparationQuery,
  unwrapPreparation,
} from "./audioPreparationQuery";

function failure(error: unknown): AudioPreparationFailure {
  return error instanceof AudioPreparationError ? error : { code: "FAILED" };
}
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
  sentenceId,
}: Pick<ExampleAudioPreparationProps, "sentenceId">) {
  const scope = useContext(AudioPreparationContext);
  if (!scope) throw new Error("ExampleAudioPreparationGroup is required");
  const client = useQueryClient();
  const options = audioPreparationQuery(scope, client);
  const select = useCallback(
    (items: readonly AudioPreparation[]) => items.find((item) => item.sentenceId === sentenceId),
    [sentenceId],
  );
  const query = useQuery({ ...options, enabled: false, refetchInterval: false, select });
  const retryKey = [...options.queryKey, sentenceId, "retry"] as const;
  const retry = useMutation({
    mutationKey: retryKey,
    retry: false,
    mutationFn: async () => {
      await client.cancelQueries({ queryKey: options.queryKey, exact: true });
      const result = await scope.retry({ noteId: scope.noteId, sentenceIds: [sentenceId] });
      await client.cancelQueries({ queryKey: options.queryKey, exact: true });
      return unwrapPreparation(result, [sentenceId]).find(
        (item) => item.sentenceId === sentenceId,
      )!;
    },
  });
  const check = useMutation({
    retry: false,
    mutationFn: async () => {
      const result = await query.refetch();
      if (result.error) throw result.error;
    },
  });

  function requestRetry() {
    if (client.isMutating({ mutationKey: retryKey, exact: true })) return;
    // per-call 콜백은 구독 해제 후 실행되지 않는다. 서버 작업은 취소하지 않는다.
    retry.mutate(undefined, {
      onSuccess(next) {
        client.setQueryData<readonly AudioPreparation[]>(options.queryKey, (previous = []) => {
          if (!previous.some((item) => item.sentenceId === sentenceId)) return [...previous, next];
          return previous.map((item) => (item.sentenceId === sentenceId ? next : item));
        });
        if (next.status === "retryable" || next.code)
          showFailure("음성 준비를 요청하지 못했습니다", {
            code: next.code ?? "FAILED",
            operationId: next.operationId,
          });
      },
      onError(error) {
        showFailure("음성 준비를 요청하지 못했습니다", failure(error));
      },
    });
  }
  function recheck() {
    if (check.isPending) return;
    retry.reset();
    check.mutate(undefined, {
      onError(error) {
        showFailure("음성 상태를 확인하지 못했습니다", failure(error));
      },
    });
  }
  const preparation = query.data;
  const requestError = retry.error;
  const error = query.error || requestError ? failure(query.error ?? requestError) : null;
  const checking = check.isPending;
  const retrying = retry.isPending;
  const ready = !error && preparation?.status === "ready";
  const preparing =
    checking ||
    retrying ||
    (!error && (!preparation || isAudioPreparationActive(preparation.status)));
  return { preparation, error, retrying, checking, ready, preparing, requestRetry, recheck };
}
