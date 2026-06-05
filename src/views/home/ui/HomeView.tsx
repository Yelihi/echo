"use client";

import { useState } from "react";
import { CounterStatus, type CounterDto } from "@/entities/counter";
import { IncrementCounterButton } from "@/features/increment-counter";

export function HomeView() {
  const [counter, setCounter] = useState<CounterDto>({
    id: "1",
    value: 0,
    status: CounterStatus.ACTIVE,
  });

  const handleIncrement = (id: string) => {
    if (id !== counter.id) return;
    setCounter((prev) => ({ ...prev, value: prev.value + 1 }));
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-4xl font-bold m-0">english-speaking-practice</h1>
      <p className="text-base text-gray-500 m-0">FSD(Feature-Sliced Design) 기반 프로젝트입니다.</p>
      <IncrementCounterButton counter={counter} onIncrement={handleIncrement} />
    </main>
  );
}
