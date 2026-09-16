import "server-only";
import { getStudySessionPage } from "./getStudySessionPage";

export async function getLatestStudySessions(limit = 5) {
  if (!Number.isSafeInteger(limit) || limit <= 0) return [];
  const first = await getStudySessionPage({ page: 1, status: "all", sort: "newest" });
  const extraPageCount = Math.min(first.totalPages, Math.ceil(limit / 10)) - 1;
  const rest = await Promise.all(
    Array.from({ length: extraPageCount }, (_, index) =>
      getStudySessionPage({ page: index + 2, status: "all", sort: "newest" }),
    ),
  );
  return [...first.sessions, ...rest.flatMap((page) => page.sessions)].slice(0, limit);
}
