import { create, type StateCreator } from "zustand";
import { devtools } from "zustand/middleware";

/**
 * Zustand 스토어 생성 헬퍼
 * devtools 미들웨어가 포함되어 있어 Redux DevTools 에서 확인 가능합니다.
 *
 * 사용 예시:
 * ```ts
 * interface CounterState {
 *   count: number;
 *   increment: () => void;
 *   decrement: () => void;
 *   reset: () => void;
 * }
 *
 * export const useCounterStore = createStore<CounterState>("counter", (set) => ({
 *   count: 0,
 *   increment: () => set((s) => ({ count: s.count + 1 })),
 *   decrement: () => set((s) => ({ count: s.count - 1 })),
 *   reset: () => set({ count: 0 }),
 * }));
 * ```
 */
export function createStore<T>(name: string, initializer: StateCreator<T>) {
  return create<T>()(devtools(initializer, { name }));
}
