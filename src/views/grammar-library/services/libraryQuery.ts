import type { GrammarLibraryQuery } from "../models/interface";

export function parseGrammarLibraryQuery(params: {
  page?: string | string[];
  q?: string | string[];
}): GrammarLibraryQuery {
  const raw = Array.isArray(params.page) ? params.page[0] : params.page;
  const page = Number(raw);

  return {
    page: Number.isSafeInteger(page) && page > 0 && page <= 2147483647 ? page : 1,
    query: (Array.isArray(params.q) ? params.q[0] : (params.q ?? "")).trim().slice(0, 200),
  };
}

export function grammarLibraryHref({ page, query }: GrammarLibraryQuery) {
  const params = new URLSearchParams();

  if (query) params.set("q", query);

  if (page > 1) params.set("page", String(page));

  return `/grammar${params.toString() ? `?${params}` : ""}`;
}
