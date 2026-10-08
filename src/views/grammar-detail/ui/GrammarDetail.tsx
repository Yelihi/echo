import Link from "next/link";
import { ArrowUpRight, Pencil } from "lucide-react";
import { BackNavigation } from "@/shared/components/ui/back-navigation/BackNavigation";
import type { GrammarDetailProps } from "../models/interface";

export function GrammarDetail({
  note,
  backHref,
  analysis,
  audio,
  examples,
  history,
}: GrammarDetailProps) {
  const context = `returnTo=${encodeURIComponent(backHref)}`;
  return (
    <div className="mx-auto max-w-5xl space-y-8 px-5 py-8 sm:px-8">
      <BackNavigation href={backHref} />
      <header className="flex flex-wrap items-start justify-between gap-6 border-b border-practice-line pb-8">
        <div className="max-w-2xl space-y-4">
          <p className="text-xs tracking-[0.18em] text-practice-muted">GRAMMAR NOTE</p>
          <h1 className="text-3xl font-medium tracking-tight text-practice-ink sm:text-4xl">
            {note.metadata.title}
          </h1>
          <div className="flex flex-wrap gap-2">
            {note.metadata.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-practice-chip px-2.5 py-1 text-xs text-practice-secondary"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        <Link
          href={`/grammar/${note.id}/edit?${context}`}
          className="inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-sm text-practice-muted hover:bg-practice-chip focus-visible:outline-2"
        >
          <Pencil size={15} aria-hidden="true" />
          노트 수정
        </Link>
      </header>
      <section className="space-y-3" aria-label="핵심 어법">
        <h2 className="text-sm font-medium text-practice-ink">기억할 어법</h2>
        <p className="whitespace-pre-wrap text-base leading-8 text-practice-secondary">
          {note.source.learningNote}
        </p>
        {audio}
      </section>
      {analysis}
      {examples}
      <section
        className="flex flex-wrap items-center justify-between gap-6 rounded-2xl bg-practice-chip p-6 sm:p-8"
        aria-label="연습 시작"
      >
        <div className="space-y-2">
          <h2 className="text-xl font-medium text-practice-ink">이제 나의 문장으로 익혀볼까요?</h2>
          <p className="text-sm leading-6 text-practice-muted">
            암기로 기억하고, 시험에서 새로운 문장에 적용해 보세요.
          </p>
        </div>
        <Link
          href={`/grammar/${note.id}/practice?${context}`}
          className="inline-flex min-h-12 items-center gap-6 rounded-md bg-practice-accent px-5 text-sm font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          연습하기
          <ArrowUpRight size={18} aria-hidden="true" />
        </Link>
      </section>
      {history}
    </div>
  );
}
