"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowDownWideNarrow, ListFilter } from "lucide-react";
import { FilterSelect } from "@/shared/components/ui/FilterSelect";
import { recordingManagementHref, type RecordingManagementQuery } from "../models/query";

const statusOptions = [
  { value: "all", label: "전체 상태" },
  { value: "connected", label: "정상 연결", dotClassName: "bg-green-primary" },
  { value: "delete-failed", label: "삭제 실패", dotClassName: "bg-red-primary" },
  { value: "orphaned", label: "미채택", dotClassName: "bg-yellow-primary" },
];

export function RecordingFilters({ query }: { query: RecordingManagementQuery }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  function change(changes: Partial<Pick<RecordingManagementQuery, "status" | "sort">>) {
    startTransition(() => router.push(recordingManagementHref({ ...query, ...changes, page: 1 })));
  }
  return (
    <div
      aria-label="녹음 필터와 정렬"
      aria-busy={pending}
      className="flex flex-wrap items-center gap-2"
    >
      <FilterSelect
        label="연결 상태"
        value={query.status}
        options={statusOptions}
        icon={ListFilter}
        disabled={pending}
        onValueChange={(value) => {
          if (
            value === "all" ||
            value === "connected" ||
            value === "delete-failed" ||
            value === "orphaned"
          )
            change({ status: value });
        }}
      />
      <FilterSelect
        label="정렬 순서"
        value={query.sort}
        options={[
          { value: "newest", label: "최신순" },
          { value: "oldest", label: "오래된순" },
        ]}
        icon={ArrowDownWideNarrow}
        disabled={pending}
        onValueChange={(value) => change({ sort: value === "oldest" ? "oldest" : "newest" })}
      />
    </div>
  );
}
