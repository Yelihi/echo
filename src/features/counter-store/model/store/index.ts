import { createStore } from "@/shared/lib/store/create-store";
import type { CounterStoreState } from "./interface";

export const useCounterStore = createStore<CounterStoreState>("CounterStore", (set) => ({
  count: 0,
  increment: () => set((s) => ({ count: s.count + 1 })),
  decrement: () => set((s) => ({ count: s.count - 1 })),
  reset: () => set({ count: 0 }),
}));
