"use client";
import { ArrowDownWideNarrow, ListFilter } from "lucide-react";
import { historyStatusOptions } from "@/widgets/latest-sessions/models/history";
import type { HistoryFilterControlsProps, HistoryFiltersProps } from "../models/interface";
import { useHistoryFilters } from "../services/hooks/useHistoryFilters";
import { FilterSelect } from "@/shared/components/ui/FilterSelect";

const statusOptions = historyStatusOptions.map((option) => ({
  ...option,
  dotClassName: {
    all: "bg-neutral-400",
    practicing: "bg-blue-500",
    pending: "bg-neutral-400",
    inProgress: "bg-blue-500",
    completed: "bg-emerald-500",
    partial: "bg-amber-500",
    failed: "bg-red-400",
  }[option.value],
}));
const sortOptions = [
  { value: "newest", label: "최신순" },
  { value: "oldest", label: "오래된순" },
];

export function HistoryFilterControls({ query, pending, onChange }: HistoryFilterControlsProps) {
  return (
    <div
      aria-label="학습 기록 필터와 정렬"
      aria-busy={pending}
      className="flex flex-wrap items-center gap-2"
    >
      <FilterSelect
        label="학습 상태"
        value={query.status}
        options={statusOptions}
        icon={ListFilter}
        disabled={pending}
        onValueChange={(value) => {
          const status = historyStatusOptions.find((option) => option.value === value)?.value;
          if (status) onChange({ status });
        }}
      />
      <FilterSelect
        label="정렬 순서"
        value={query.sort}
        options={sortOptions}
        icon={ArrowDownWideNarrow}
        disabled={pending}
        onValueChange={(value) => onChange({ sort: value === "oldest" ? "oldest" : "newest" })}
      />
    </div>
  );
}
export function HistoryFilters({ query }: HistoryFiltersProps) {
  const { pending, changeFilter } = useHistoryFilters(query);
  return <HistoryFilterControls query={query} pending={pending} onChange={changeFilter} />;
}
