"use client";
import { useId, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AudioPreparationContext,
  audioPreparationQuery,
  type AudioPreparationScope,
} from "../services/audioPreparationQuery";

type Props = Omit<AudioPreparationScope, "scopeId"> & { children: ReactNode };

/** 목록이 조회와 폴링을 한 번만 소유하고, 각 행은 자신의 결과만 구독한다. */
export function ExampleAudioPreparationGroup({ children, ...props }: Props) {
  // 화면 수명별 캐시로 다른 화면의 늦은 응답과 이전 요청 오류를 격리한다.
  const scopeId = useId();
  const scope = { ...props, scopeId };
  const client = useQueryClient();
  useQuery({ ...audioPreparationQuery(scope, client), notifyOnChangeProps: [] });
  return (
    <AudioPreparationContext.Provider value={scope}>{children}</AudioPreparationContext.Provider>
  );
}
