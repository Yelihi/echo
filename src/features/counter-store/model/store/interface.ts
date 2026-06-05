export interface CounterStoreState {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
}
