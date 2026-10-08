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
import { useStore, type StoreApi } from "zustand";
import type { ExampleState, GrammarExampleManagerProps } from "../models/interface";
import { createExampleStore } from "../services/createExampleStore";
const Context = createContext<StoreApi<ExampleState> | null>(null);
export function ExampleProvider({
  children,
  note,
  generate,
  save,
  onUpdated,
  onBack,
}: GrammarExampleManagerProps & { children: ReactNode }) {
  const latest = useRef({ generate, save, onUpdated });
  useLayoutEffect(() => {
    latest.current = { generate, save, onUpdated };
  }, [generate, save, onUpdated]);
  const [store] = useState(() =>
    createExampleStore({
      note,
      onBack,
      generate: (command) => latest.current.generate(command),
      save: (command) => latest.current.save(command),
      onUpdated: (note) => latest.current.onUpdated(note),
    }),
  );
  useEffect(() => () => store.getState().cancel(), [store]);
  useEffect(() => {
    function beforeUnload(event: BeforeUnloadEvent) {
      if (store.getState().dirty) {
        event.preventDefault();
        event.returnValue = "";
      }
    }
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [store]);
  return <Context.Provider value={store}>{children}</Context.Provider>;
}
export function useExamples<T>(selector: (state: ExampleState) => T) {
  const store = useContext(Context);
  if (!store) throw new Error("ExampleProvider가 필요합니다.");
  return useStore(store, selector);
}
