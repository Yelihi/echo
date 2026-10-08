"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import type { GrammarHistoryProps } from "../models/interface";
import { useGrammarHistory } from "../services/useGrammarHistory";
import { formatGrammarPracticeDate } from "../services/formatPracticeDate";
import { GrammarHistoryRows } from "./GrammarHistoryRows";

export function GrammarHistory(props: GrammarHistoryProps) {
  return <HistoryForNote key={props.noteId} {...props} />;
}

function HistoryForNote(props: GrammarHistoryProps) {
  const [open, setOpen] = useState(false);
  const { data, busy, error, refresh } = useGrammarHistory(props);
  const total = data?.total ?? 0;
  const last =
    props.initialData?.items[0]?.completedAt ??
    (data?.page === 1 ? data.items[0]?.completedAt : undefined);

  function changeOpen(next: boolean) {
    setOpen(next);

    if (next) void refresh(1);
  }

  return (
    <section aria-label="연습 기록" className="space-y-4 border-t border-practice-line pt-7">
      <h2 className="text-lg font-medium text-practice-ink">나의 연습</h2>
      <p className="text-sm text-practice-secondary">
        {data ? `완료한 연습 ${total}회` : "완료한 연습 기록을 확인해보세요."}
        {last && ` · 최근 ${formatGrammarPracticeDate(last)}`}
      </p>
      <Dialog open={open} onOpenChange={changeOpen}>
        <DialogTrigger asChild>
          <button
            type="button"
            className="min-h-11 rounded-full border border-practice-line px-5 text-sm"
          >
            연습 기록 전체보기
          </button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>연습 기록</DialogTitle>
          </DialogHeader>
          <div className="min-h-32 overflow-y-auto px-6 py-4">
            <DialogDescription>
              완료한 연습만 집계합니다. 날짜는 한국 시간 기준입니다.
            </DialogDescription>
            {busy ? (
              <div
                role="status"
                aria-label="연습 기록 불러오는 중"
                className="space-y-4 py-7 motion-safe:animate-pulse"
              >
                <div className="h-5 w-2/3 rounded bg-practice-line" />
                <div className="h-5 w-1/2 rounded bg-practice-line" />
              </div>
            ) : error ? (
              <div className="space-y-4 py-6">
                <p role="alert" className="text-sm text-practice-accent">
                  연습 기록을 불러오지 못했습니다. 다시 시도해주세요.
                </p>
                <button
                  type="button"
                  onClick={() => refresh(data?.page ?? 1)}
                  className="min-h-11 rounded-md border border-practice-line px-4 text-sm"
                >
                  다시 불러오기
                </button>
              </div>
            ) : (
              <GrammarHistoryRows items={data?.items ?? []} />
            )}
          </div>
          <DialogFooter>
            <div className="mr-auto flex items-center gap-3">
              <button
                type="button"
                disabled={busy || !data || data.page <= 1}
                onClick={() => refresh((data?.page ?? 1) - 1)}
                className="min-h-11 px-3 text-sm disabled:opacity-40"
              >
                이전 기록
              </button>
              <span className="text-sm">
                {data?.page ?? 1} / {Math.max(1, Math.ceil(total / (data?.pageSize ?? 10)))}
              </span>
              <button
                type="button"
                disabled={busy || !data || data.page * data.pageSize >= total}
                onClick={() => refresh((data?.page ?? 1) + 1)}
                className="min-h-11 px-3 text-sm disabled:opacity-40"
              >
                다음 기록
              </button>
            </div>
            <DialogClose asChild>
              <button
                type="button"
                className="min-h-11 rounded-md bg-practice-ink px-5 text-sm text-white"
              >
                닫기
              </button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
