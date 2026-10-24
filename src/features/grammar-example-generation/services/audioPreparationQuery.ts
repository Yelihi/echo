"use client";
import { createContext } from "react";
import { queryOptions, type QueryClient } from "@tanstack/react-query";
import type { AudioPreparation, AudioPreparationResult } from "@/entities/grammar-audio";
import type { ExampleAudioPreparationProps } from "../models/audioPreparation";
import { isAudioPreparationActive } from "../models/audioPreparationMessage";

export interface AudioPreparationScope extends Pick<
  ExampleAudioPreparationProps,
  "noteId" | "read" | "retry"
> {
  sentenceIds: readonly string[];
  initial?: readonly AudioPreparation[];
  scopeId: string;
}
export const AudioPreparationContext = createContext<AudioPreparationScope | null>(null);

export class AudioPreparationError extends Error {
  constructor(
    readonly code: string,
    readonly operationId?: string,
  ) {
    super(code);
  }
}

export function unwrapPreparation(result: AudioPreparationResult, sentenceIds: readonly string[]) {
  if (!result.ok) throw new AudioPreparationError(result.code, result.operationId);
  if (sentenceIds.some((id) => !result.data.some((item) => item.sentenceId === id))) {
    throw new AudioPreparationError("FAILED");
  }
  return result.data;
}

function retainCommandFailure(
  next: AudioPreparation,
  previous?: AudioPreparation,
): AudioPreparation {
  // 읽기 성공은 작업 등록 성공이 아니다. 실제 진행/완료 또는 명시적 재요청만 요청 오류를 해소한다.
  if (!next.code && previous?.code) {
    if (next.status === "missing") return previous;
    if (next.status === "queued" && previous.status === "queued") {
      return { ...next, code: previous.code, operationId: previous.operationId };
    }
  }
  return next;
}

export function audioPreparationQuery(scope: AudioPreparationScope, client: QueryClient) {
  const { scopeId, noteId, sentenceIds, read, initial } = scope;
  const queryKey = ["example-audio-preparation", scopeId, noteId, sentenceIds] as const;
  return queryOptions({
    queryKey,
    queryFn: async ({ signal }) => {
      const result = await read({ noteId, sentenceIds });
      // Server Action은 계속 실행된다. 구독을 떠난 조회 결과만 캐시에 반영하지 않는다.
      if (signal.aborted) throw new DOMException("Aborted", "AbortError");
      const next = unwrapPreparation(result, sentenceIds);
      const previous = client.getQueryData<readonly AudioPreparation[]>(queryKey);
      return next.map((item) =>
        retainCommandFailure(
          item,
          previous?.find((p) => p.sentenceId === item.sentenceId),
        ),
      );
    },
    initialData: initial,
    enabled: sentenceIds.length > 0,
    staleTime: 0,
    gcTime: 0,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: (query) => {
      if (query.state.error) return false;
      return query.state.data?.some((item) => isAudioPreparationActive(item.status)) ? 3000 : false;
    },
  });
}
