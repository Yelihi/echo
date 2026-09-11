"use client";
import { RotateCcw } from "lucide-react";
import { Button } from "@/shared/components";
import type { HistoryErrorProps } from "@/views/latest-sessions/models/interface";

export default function Error({ reset }: HistoryErrorProps) {
  return (
    <section className="flex flex-col items-center gap-4 px-5 py-16" role="alert">
      <h1 className="text-xl font-bold">학습 기록을 불러오지 못했습니다</h1>
      <Button onClick={reset}>
        <RotateCcw className="size-4" /> 다시 시도
      </Button>
    </section>
  );
}
