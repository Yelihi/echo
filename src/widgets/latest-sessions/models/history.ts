import type { GetLatestStudySession } from "./studySession";

export const historyStatusOptions = [
  { value: "all", label: "전체 상태" },
  { value: "pending", label: "분석 전" },
  { value: "inProgress", label: "분석 중" },
  { value: "completed", label: "분석 완료" },
  { value: "partial", label: "일부 실패" },
  { value: "failed", label: "분석 실패" },
] as const;
export type HistoryStatus = (typeof historyStatusOptions)[number]["value"];
export interface HistoryQuery {
  page: number;
  status: HistoryStatus;
  sort: "newest" | "oldest";
}
export interface StudySessionPage {
  sessions: GetLatestStudySession[];
  page: number;
  totalPages: number;
  totalCount: number;
}
export type HistorySearchParams = Record<string, string | string[] | undefined>;

export function parseHistoryQuery(params: HistorySearchParams): HistoryQuery {
  const rawPage = typeof params.page === "string" ? Number(params.page) : 1;
  return {
    page: Number.isSafeInteger(rawPage) && rawPage > 0 ? Math.min(rawPage, 2147483647) : 1,
    status: historyStatusOptions.find((option) => option.value === params.status)?.value ?? "all",
    sort: params.sort === "oldest" ? "oldest" : "newest",
  };
}
export function historyHref(query: HistoryQuery): string {
  const params = new URLSearchParams();
  if (query.status !== "all") params.set("status", query.status);
  if (query.sort !== "newest") params.set("sort", query.sort);
  if (query.page > 1) params.set("page", String(query.page));
  const search = params.toString();
  return `/sessions${search ? "?" + search : ""}`;
}
