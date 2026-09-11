"use client";

import { Button } from "@/shared/components";

export default function Error({ reset }: { reset: () => void }) {
  return (
    <section className="flex flex-col items-center gap-4 px-5 py-16" role="alert">
      <h1 className="text-heading-sm font-bold">녹음 파일을 불러오지 못했습니다</h1>
      <Button onClick={reset}>다시 시도</Button>
    </section>
  );
}
