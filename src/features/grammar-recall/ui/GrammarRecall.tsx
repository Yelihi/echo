import type { ReactNode } from "react";

export function GrammarRecall({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl space-y-7 px-5 py-8">
      <header>
        <p className="mb-3 text-xs tracking-widest text-practice-secondary">RECALL PRACTICE</p>
        <h1 className="text-2xl font-medium text-practice-ink">{title}</h1>
      </header>
      {children}
    </div>
  );
}
