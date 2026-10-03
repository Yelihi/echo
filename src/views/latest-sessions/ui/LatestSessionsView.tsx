import { SessionSimplified } from "@/widgets/latest-sessions/ui/SessionSimplified";
import { Pagination } from "@/shared/components/ui/Pagination";
import type { LatestSessionsViewProps } from "../models/interface";
import { HistoryToolbar } from "./HistoryToolbar";
import { HistoryEmptyState } from "./HistoryEmptyState";

export function LatestSessionsView({
  sessions = [],
  query = { page: 1, status: "all", sort: "newest" },
  totalCount = sessions.length,
  totalPages = 1,
}: LatestSessionsViewProps) {
  return (
    <section className="flex w-full flex-col gap-6">
      <header className="flex flex-col gap-4">
        <h1 className="text-display break-keep text-black-primary">학습 기록</h1>
        <p className="text-body-4 text-gray-text">나의 연습과 분석 결과</p>
      </header>
      <HistoryToolbar query={query} totalCount={totalCount} />
      {sessions.length === 0 ? (
        <HistoryEmptyState filtered={query.status !== "all"} />
      ) : (
        <ul className="flex flex-col gap-2.5" aria-label="학습 기록 목록">
          {sessions.map((session) => (
            <li key={`${session.sessionType}-${session.id}`}>
              <SessionSimplified {...session} />
            </li>
          ))}
        </ul>
      )}
      {totalCount > 0 && (
        <footer className="border-t border-gray-border pt-5">
          <Pagination page={query.page} totalPages={totalPages} />
        </footer>
      )}
    </section>
  );
}
