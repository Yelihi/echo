import Link from "next/link";
import type { GrammarNoteListProps } from "../models/interface";
import { grammarLibraryHref } from "../services/libraryQuery";
import { getPaginationItems } from "@/shared/utils/pagination";
export function GrammarNoteList({ data, query }: GrammarNoteListProps) {
  const returnTo = grammarLibraryHref({ page: data.page, query });
  const pages = Math.max(1, Math.ceil(data.total / data.pageSize));
  return (
    <section aria-label="어법 노트 목록" className="space-y-8">
      <p className="text-sm text-practice-secondary">{data.total}개의 어법 노트</p>
      {data.items.length === 0 ? (
        <div className="rounded-xl border border-practice-line bg-white p-12 text-center">
          <h2 className="text-xl text-practice-ink">
            {query ? "검색 결과가 없습니다" : "첫 어법 노트를 만들어보세요"}
          </h2>
          <p className="mt-3 text-practice-secondary">
            {query
              ? "다른 제목이나 문장으로 검색해보세요."
              : "배운 문장과 핵심 어법을 기록하고 연습하세요."}
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-practice-line border-y border-practice-line">
          {data.items.map((note) => (
            <li key={note.id}>
              <Link
                href={`/grammar/${note.id}?returnTo=${encodeURIComponent(returnTo)}`}
                className="group block py-7 transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-practice-focus"
              >
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-xl font-medium text-practice-ink">{note.title}</h2>
                  <span
                    aria-hidden
                    className="text-practice-secondary transition-transform group-hover:translate-x-1 motion-reduce:transform-none"
                  >
                    →
                  </span>
                </div>
                <p className="mt-2 text-base text-practice-body">{note.sentence}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {note.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-practice-line px-3 py-1 text-xs text-practice-secondary"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
      {pages > 1 && (
        <nav aria-label="어법 목록 페이지" className="flex flex-wrap justify-center gap-2">
          {getPaginationItems(data.page, pages).map((page, index) =>
            page === "ellipsis" ? (
              <span key={`gap-${index}`} aria-hidden className="p-3">
                …
              </span>
            ) : (
              <Link
                key={page}
                href={grammarLibraryHref({ page, query })}
                aria-label={`${page}페이지`}
                aria-current={page === data.page ? "page" : undefined}
                className="flex min-h-11 min-w-11 items-center justify-center rounded-md border border-practice-line text-sm aria-[current=page]:bg-practice-ink aria-[current=page]:text-white"
              >
                {page}
              </Link>
            ),
          )}
        </nav>
      )}
    </section>
  );
}
