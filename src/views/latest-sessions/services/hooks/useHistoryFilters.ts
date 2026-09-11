"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { historyHref, type HistoryQuery } from "@/widgets/latest-sessions/models/history";

export function useHistoryFilters(query: HistoryQuery) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const changeFilter = (changes: Partial<Pick<HistoryQuery, "status" | "sort">>) => {
    startTransition(() => router.push(historyHref({ ...query, ...changes, page: 1 })));
  };
  return { pending, changeFilter };
}
