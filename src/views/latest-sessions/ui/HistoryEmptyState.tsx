import Link from "next/link";
import { Inbox, ArrowUpRight } from "lucide-react";
import type { HistoryEmptyStateProps } from "../models/interface";

export function HistoryEmptyState({ filtered }: HistoryEmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 py-20 text-center" role="status">
      <Inbox className="mb-2 size-9 text-neutral-400" strokeWidth={1.25} aria-hidden />
      <p className="text-sm font-medium text-neutral-700">
        {filtered ? "해당 상태의 학습 기록이 없습니다." : "아직 학습 기록이 없습니다."}
      </p>
      <Link
        href={filtered ? "/sessions" : "/role-playing"}
        className="inline-flex items-center gap-1 text-sm font-medium text-blue-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4"
      >
        {filtered ? "전체 기록 보기" : "연습 시작하기"}
        <ArrowUpRight className="size-3.5" aria-hidden />
      </Link>
    </div>
  );
}
