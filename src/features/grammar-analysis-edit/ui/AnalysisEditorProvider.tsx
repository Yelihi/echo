"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useStore } from "zustand";
import type { StoreApi } from "zustand";
import type { AnalysisEditorProviderProps, AnalysisEditorState } from "../models/interface";
import { createAnalysisEditorStore } from "../models/store";

const Context = createContext<StoreApi<AnalysisEditorState> | null>(null);

/**
 * 에디터 인스턴스마다 초기 분석·선택·미적용 입력을 격리한다.
 * Context에는 변경되는 상태가 아닌 고정된 store 참조만 전달한다.
 * initialAnalysis는 초기값이므로 다른 문서/분석으로 교체할 때는 소비자가 key를 변경한다.
 */
export function AnalysisEditorProvider({
  initialAnalysis,
  onChange,
  onDirtyChange,
  children,
}: AnalysisEditorProviderProps) {
  // 부모가 콜백을 변경해도 편집 상태를 초기화하지 않고 최신 수신자에게 알린다.
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);
  const [store] = useState(() =>
    createAnalysisEditorStore({
      initialAnalysis,
      onChange: (analysis) => onChangeRef.current(analysis),
    }),
  );
  useEffect(() => {
    onDirtyChange?.(store.getState().dirty);
    return store.subscribe((state, previous) => {
      if (state.dirty !== previous.dirty) onDirtyChange?.(state.dirty);
    });
  }, [store, onDirtyChange]);
  return <Context.Provider value={store}>{children}</Context.Provider>;
}

export function useAnalysisEditorStore(): StoreApi<AnalysisEditorState> {
  const store = useContext(Context);
  if (!store) throw new Error("AnalysisEditorProvider is required");
  return store;
}

export function useAnalysisEditor<T>(selector: (state: AnalysisEditorState) => T): T {
  return useStore(useAnalysisEditorStore(), selector);
}
