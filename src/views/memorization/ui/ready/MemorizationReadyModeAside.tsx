"use client";

import { useState, useTransition } from "react";
import { Loader2, Play } from "lucide-react";
import { useRouter } from "next/navigation";

// shared
import { Button } from "@/shared/components";
import { errorPopupManager } from "@/shared/lib/error-popup";
import { SelectableOptionCard } from "@/shared/components/ui";

// views
import { MEMORIZATION_READY_MODE_OPTIONS } from "@/views/memorization/config/const";
import { createMemorizationSessionErrorFromCode } from "@/views/memorization/models/errors";
import type { MemorizationReadyMode } from "@/views/memorization/models/ready";
import { createMemorizationSession } from "@/views/memorization/services/action/createMemorizationSession";

interface MemorizationReadyModeAsideProps {
  materialId: string;
}

export function MemorizationReadyModeAside({ materialId }: MemorizationReadyModeAsideProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [mode, setMode] = useState<MemorizationReadyMode>("read");

  const startSession = () => {
    const params = new URLSearchParams({ mode });

    startTransition(async () => {
      const result = await createMemorizationSession({ materialId });

      if (result.code === "SUCCESS") {
        router.push(
          `/sentence-memorization/${materialId}/session/${result.sessionId}?${params.toString()}`,
        );
        return;
      }

      const error = createMemorizationSessionErrorFromCode(result.code);
      errorPopupManager.open({
        title: error.title,
        message: error.message,
        code: error.code,
      });
    });
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
        disabled={isPending}
      >
        {isPending ? <Loader2 className="size-4 animate-spin" /> : <Play />} 연습 시작하기
      </Button>
    </section>
  );
}
