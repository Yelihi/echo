"use client";

import { useCounterStore } from "../model/store";

export function CounterWithStore() {
  const count = useCounterStore((s) => s.count);
  const increment = useCounterStore((s) => s.increment);
  const decrement = useCounterStore((s) => s.decrement);
  const reset = useCounterStore((s) => s.reset);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
      <p style={{ fontSize: "2rem", fontWeight: 700, margin: 0 }}>{count}</p>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button onClick={decrement} style={{ padding: "0.4rem 1rem", cursor: "pointer" }}>
          -
        </button>
        <button onClick={increment} style={{ padding: "0.4rem 1rem", cursor: "pointer" }}>
          +
        </button>
        <button onClick={reset} style={{ padding: "0.4rem 1rem", cursor: "pointer" }}>
          초기화
        </button>
      </div>
    </div>
  );
}
