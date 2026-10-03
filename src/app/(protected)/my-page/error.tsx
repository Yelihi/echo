"use client";

import { Button } from "@/shared/components";

export default function MyPageError({ reset }: { reset: () => void }) {
  return (
    <section className="flex flex-col items-center gap-4 px-5 py-16" role="alert">
      <h1 className="text-xl font-medium">나의 학습 정보를 불러오지 못했습니다</h1>
      <Button onClick={reset}>다시 시도</Button>
    </section>
  );
}
