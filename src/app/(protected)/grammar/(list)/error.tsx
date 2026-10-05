"use client";
import { BackNavigation } from "@/shared/components/ui/back-navigation/BackNavigation";
export default function GrammarLibraryError({ reset }: { reset: () => void }) {
  return (
    <section className="mx-auto max-w-5xl space-y-5 px-6 py-12">
      <BackNavigation href="/home" />
      <h1 className="text-2xl text-practice-ink">어법 노트를 불러오지 못했습니다.</h1>
      <p role="alert" className="text-practice-secondary">
        잠시 후 다시 시도해주세요.
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-md bg-practice-ink px-5 py-3 text-white"
      >
        다시 불러오기
      </button>
    </section>
  );
}
