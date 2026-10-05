"use client";

import { createContext, useContext, useState } from "react";
import { useStore } from "zustand";
import type { StoreApi } from "zustand";
import type { AnalysisEditorProviderProps, AnalysisEditorState } from "../models/interface";
import { createAnalysisEditorStore } from "../models/store";

const Context = createContext<StoreApi<AnalysisEditorState> | null>(null);

/** Remount with a source revision key after a new analysis replaces the source. */
export function AnalysisEditorProvider({
  initialAnalysis,
  onChange,
  children,
}: AnalysisEditorProviderProps) {
  const [store] = useState(() => createAnalysisEditorStore({ initialAnalysis, onChange }));
  return <Context.Provider value={store}>{children}</Context.Provider>;
}

export function useAnalysisEditor<T>(selector: (state: AnalysisEditorState) => T): T {
  const store = useContext(Context);
  if (!store) throw new Error("AnalysisEditorProvider is required");
  return useStore(store, selector);
}
