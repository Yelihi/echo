"use client";

import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useStore } from "zustand";
import type { StoreApi } from "zustand";
import type { EditorState, GrammarNoteEditorProps } from "../models/interface";
import { createEditorStore } from "../services/createEditorStore";

const Context = createContext<StoreApi<EditorState> | null>(null);

export function EditorProvider({
  children,
  initialNote,
  analyze,
  save,
  onSaved,
}: Omit<GrammarNoteEditorProps, "AnalysisEditor" | "onExit"> & { children: ReactNode }) {
  const latest = useRef({ analyze, save, onSaved });

  useLayoutEffect(() => {
    latest.current = { analyze, save, onSaved };
  }, [analyze, save, onSaved]);
  // initialNote는 초기값이다. 문서 ID·버전이 바뀌면 호출부에서 key로 새 세션을 연다.
  const [store] = useState(() =>
    createEditorStore({
      initialNote,

      analyze: (source) => latest.current.analyze(source),

      save: (command) => latest.current.save(command),

      onSaved: (note) => latest.current.onSaved(note),
    }),
  );

  useEffect(() => () => store.getState().cancel(), [store]);
  useEffect(() => {
    function preventUnload(event: BeforeUnloadEvent) {
      const state = store.getState();

      if (!state.dirty && state.pending !== "save") return;

      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", preventUnload);

    return () => window.removeEventListener("beforeunload", preventUnload);
  }, [store]);

  return <Context.Provider value={store}>{children}</Context.Provider>;
}

export function useEditor<T>(selector: (state: EditorState) => T) {
  const store = useContext(Context);

  if (!store) throw new Error("EditorProvider가 필요합니다.");

  return useStore(store, selector);
}
