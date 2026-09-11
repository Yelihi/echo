import { historyStatusOptions } from "@/widgets/latest-sessions/models/history";
import type { HistoryToolbarProps } from "../models/interface";
import { HistoryFilters } from "./HistoryFilters";

export function HistoryToolbar({ query, totalCount }: HistoryToolbarProps) {
  const title =
    query.status === "all"
      ? "전체 기록"
      : historyStatusOptions.find((option) => option.value === query.status)?.label;
  return (
    <div className="flex flex-col gap-4 border-b border-gray-border pb-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2.5" aria-live="polite">
        <h2 className="text-sm font-semibold text-black-primary">{title}</h2>
        <span className="inline-flex min-w-7 items-center justify-center rounded-md bg-neutral-200/60 px-2 py-0.5 text-xs font-semibold tabular-nums text-neutral-600">
          {totalCount.toLocaleString("ko-KR")}
          <span className="sr-only">개</span>
        </span>
      </div>
      <HistoryFilters query={query} />
    </div>
  );
}
