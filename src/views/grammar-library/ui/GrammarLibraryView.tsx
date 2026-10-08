import Link from "next/link";
import Form from "next/form";
import type { GrammarNoteListProps } from "../models/interface";
import { GrammarNoteList } from "./GrammarNoteList";
import { BackNavigation } from "@/shared/components/ui/back-navigation/BackNavigation";

export function GrammarLibraryView(props: GrammarNoteListProps) {
  return (
    <div className="mx-auto max-w-5xl space-y-9 px-6 py-8">
      <BackNavigation href="/home" />
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="mb-3 text-xs tracking-widest text-practice-secondary">GRAMMAR PRACTICE</p>
          <h1 className="text-3xl font-medium text-practice-ink">어법 노트</h1>
          <p className="mt-3 text-practice-secondary">배운 어법을 문장으로 기억하세요.</p>
        </div>
        <Link
          href="/grammar/new"
          className="rounded-md bg-practice-accent px-5 py-3 text-sm text-white"
        >
          새 노트 작성 →
        </Link>
      </header>
      <Form action="/grammar" className="flex gap-3">
        <label htmlFor="grammar-search" className="sr-only">
          어법 제목 또는 문장 검색
        </label>
        <input
          key={props.query}
          id="grammar-search"
          name="q"
          type="search"
          maxLength={200}
          defaultValue={props.query}
          placeholder="어법 제목 또는 문장 검색"
          className="min-w-0 flex-1 rounded-lg border border-practice-line bg-white px-4 py-3 text-practice-ink focus-visible:outline-practice-focus"
        />
        <button type="submit" className="rounded-lg border border-practice-line px-5 text-sm">
          검색
        </button>
      </Form>
      <GrammarNoteList {...props} />
    </div>
  );
}
