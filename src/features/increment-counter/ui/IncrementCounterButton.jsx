"use client";

/**
 * @param {{ counter: import("@/entities/counter").CounterDto, onIncrement: (id: string) => void }} props
 */
export function IncrementCounterButton({ counter, onIncrement }) {
  return (
    <button
      className="py-2 px-6 text-base cursor-pointer rounded-md"
      onClick={() => onIncrement(counter.id)}
    >
      카운트: {counter.value}
    </button>
  );
}
