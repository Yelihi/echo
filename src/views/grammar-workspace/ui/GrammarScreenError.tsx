"use client";

import { BackNavigation } from "@/shared/components/ui/back-navigation/BackNavigation";
import { Button } from "@/shared/components/atomics/button/Button";

export function GrammarScreenError({ reset }: { reset: () => void }) {
  return (
    <div className="mx-auto max-w-4xl space-y-6 px-5 py-10">
      <BackNavigation href="/grammar" />
      <h1 className="text-2xl font-medium text-practice-ink">어법 화면을 불러오지 못했어요</h1>
      <p role="alert" className="text-sm text-practice-muted">
        잠시 후 다시 시도해 주세요. 저장된 노트와 연습은 그대로 유지됩니다.
      </p>
      <Button onClick={reset}>다시 불러오기</Button>
    </div>
  );
}
