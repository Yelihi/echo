import Link from "next/link";
import { Pagination, PaginationSkeleton } from "@/shared/components/ui/Pagination";
import { EmptyState } from "@/shared/components/ui/EmptyState";
import { RecordTable } from "./RecordTable";
import SummaryDataView from "./SummaryDataView";
import { RecordingFilters } from "./RecordingFilters";
import type { RecordUIPresentation, RecordsSummary } from "../models/interface";
import type { RecordingManagementQuery } from "../models/query";

function RecordingHeader() {
  return (
    <header className="flex flex-col gap-4">
      <h1 className="text-display break-keep text-black-primary">녹음 관리</h1>
      <p className="text-body-4 text-gray-text">
        저장된 녹음 파일의 연결 상태와 정리 대상 파일을 확인하세요.
      </p>
    </header>
  );
}

export function ManagementRecordsView({
  records,
  recordsSummary,
  query,
  totalCount,
  totalPages,
}: {
  records: RecordUIPresentation[];
  recordsSummary: RecordsSummary;
  query: RecordingManagementQuery;
  totalCount: number;
  totalPages: number;
}) {
  return (
    <section className="flex w-full flex-col gap-7">
      <RecordingHeader />
      <SummaryDataView recordsSummary={recordsSummary} />
      <div className="flex flex-col gap-4 border-b border-gray-border pb-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-body-3 font-semibold text-black-primary" aria-live="polite">
          녹음 파일{" "}
          <span className="ml-2 text-gray-text">{totalCount.toLocaleString("ko-KR")}개</span>
        </h2>
        <RecordingFilters query={query} />
      </div>
      <RecordTable records={records} />
      {records.length === 0 && (
        <EmptyState
          role="status"
          title={
            query.status === "all"
              ? "저장된 녹음 파일이 없습니다."
              : "해당 상태의 녹음 파일이 없습니다."
          }
          action={
            query.status !== "all" ? (
              <Link href="/recording-management" className="text-blue-primary underline">
                전체 파일 보기
              </Link>
            ) : undefined
          }
        />
      )}
      {totalCount > 0 && <Pagination page={query.page} totalPages={totalPages} />}
    </section>
  );
}

export function ManagementRecordsSkeleton() {
  return (
    <section
      aria-busy="true"
      aria-label="녹음 파일 불러오는 중"
      className="flex w-full flex-col gap-7"
    >
      <RecordingHeader />
      <div aria-hidden className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="h-20 animate-pulse rounded-panel border border-gray-border bg-white motion-reduce:animate-none"
          />
        ))}
      </div>
      <div
        aria-hidden
        className="h-10 w-64 animate-pulse rounded-control bg-neutral-100 motion-reduce:animate-none"
      />
      <div aria-hidden className="overflow-hidden rounded-card border border-gray-border">
        {Array.from({ length: 10 }, (_, index) => (
          <div
            key={index}
            className="flex h-20 items-center gap-3 border-b border-gray-border bg-white p-3 last:border-0"
          >
            <div className="size-10 shrink-0 animate-pulse rounded-control bg-neutral-100 motion-reduce:animate-none" />
            <div className="h-5 w-2/3 animate-pulse rounded-control bg-neutral-100 motion-reduce:animate-none" />
          </div>
        ))}
      </div>
      <PaginationSkeleton />
    </section>
  );
}
