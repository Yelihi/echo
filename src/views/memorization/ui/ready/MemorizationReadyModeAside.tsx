"use client";

import { Play } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/shared/components";
import { SelectableOptionCard } from "@/shared/components/ui";
import { MEMORIZATION_READY_MODE_OPTIONS } from "@/views/memorization/config/const";
import type { MemorizationReadyMode } from "@/views/memorization/models/ready";

interface MemorizationReadyModeAsideProps {
  materialId: string;
}

export function MemorizationReadyModeAside({ materialId }: MemorizationReadyModeAsideProps) {
  const router = useRouter();
  const [mode, setMode] = useState<MemorizationReadyMode>("read");

  const startSession = () => {
    const params = new URLSearchParams({ mode });
    router.push(`/sentence-memorization/${materialId}/session?${params.toString()}`);
  };

  return (
    <section className="flex flex-col gap-3.5">
      <div>
        <h2 className="text-[17px] leading-normal font-bold">연습 모드</h2>
        <p className="mt-1 text-[13.5px] text-gray-text">어떤 단서로 문장을 떠올릴지 골라보세요.</p>
      </div>

      <div className="grid gap-3" role="radiogroup" aria-label="문장 암기 연습 모드 선택">
        {MEMORIZATION_READY_MODE_OPTIONS.map((option, index) => {
          const Icon = option.icon;

          return (
            <SelectableOptionCard
              key={option.value}
              role="radio"
              aria-checked={mode === option.value}
              selected={mode === option.value}
              className="min-h-[74px] px-[18px] py-4"
              icon={<Icon />}
              badge={index + 1}
              title={option.title}
              description={option.description}
              onClick={() => setMode(option.value)}
            />
          );
        })}
      </div>

      <Button
        type="button"
        className="h-9 w-full bg-accent-600 hover:bg-accent-700"
        onClick={startSession}
      >
        <Play /> 연습 시작하기
      </Button>
    </section>
  );
}
