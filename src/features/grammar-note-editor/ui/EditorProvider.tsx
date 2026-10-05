"use client";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useStore } from "zustand";
import type { StoreApi } from "zustand";
import type { EditorState, GrammarNoteEditorProps } from "../models/interface";
import { createEditorStore } from "../services/createEditorStore";
const Context = createContext<StoreApi<EditorState> | null>(null);
export function EditorProvider({
  children,
  ...dependencies
}: Omit<GrammarNoteEditorProps, "AnalysisEditor" | "onExit"> & { children: ReactNode }) {
  const latest = useRef(dependencies);
  useEffect(() => {
    latest.current = dependencies;
  }, [dependencies]);
  const [store] = useState(() =>
    createEditorStore({
      initialNote: dependencies.initialNote,
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
