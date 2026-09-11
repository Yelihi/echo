import type { RecordStatus } from "./interface";

export const RECORDING_MANAGEMENT_PAGE_SIZE = 10;

export interface RecordingManagementQuery {
  page: number;
  status: "all" | RecordStatus;
  sort: "newest" | "oldest";
}

export function parseRecordingManagementQuery(
  params: Record<string, string | string[] | undefined>,
): RecordingManagementQuery {
  const page = typeof params.page === "string" ? Number(params.page) : 1;
  return {
    page: Number.isSafeInteger(page) && page > 0 ? page : 1,
    status:
      params.status === "connected" ||
      params.status === "orphaned" ||
      params.status === "delete-failed"
        ? params.status
        : "all",
    sort: params.sort === "oldest" ? "oldest" : "newest",
  };
}

export function recordingManagementHref(query: RecordingManagementQuery): string {
  const params = new URLSearchParams();
  if (query.page > 1) params.set("page", String(query.page));
  if (query.status !== "all") params.set("status", query.status);
  if (query.sort !== "newest") params.set("sort", query.sort);
  const suffix = params.toString();
  return `/recording-management${suffix ? `?${suffix}` : ""}`;
}
