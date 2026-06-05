"use client";

import type { CounterDto } from "@/entities/counter";

interface IncrementCounterButtonProps {
  counter: CounterDto;
  onIncrement: (id: string) => void;
}

export function IncrementCounterButton({ counter, onIncrement }: IncrementCounterButtonProps) {
  return (
    <button
      className="py-2 px-6 text-base cursor-pointer rounded-md"
      onClick={() => onIncrement(counter.id)}
    >
      카운트: {counter.value}
    </button>
  );
}
