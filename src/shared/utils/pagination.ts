const PAGE_QUERY_KEY = "page";
const PAGINATION_WINDOW = 1;
const PAGINATION_INLINE_LIMIT = 7;

export function parsePageQuery(page: string | undefined): number {
  const parsed = Number(page);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }

  return Math.floor(parsed);
}

export function buildPageHref(pathname: string, search: string, page: number): string {
  const params = new URLSearchParams(search);

  if (page <= 1) {
    params.delete(PAGE_QUERY_KEY);
  } else {
    params.set(PAGE_QUERY_KEY, String(page));
  }

  const query = params.toString();
  return query.length > 0 ? `${pathname}?${query}` : pathname;
}

export function getPaginationItems(page: number, totalPages: number): Array<number | "ellipsis"> {
  if (totalPages <= 0) {
    return [];
  }

  if (totalPages <= PAGINATION_INLINE_LIMIT) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const current = Math.min(Math.max(page, 1), totalPages);
  const items: Array<number | "ellipsis"> = [1];
  const start = Math.max(2, current - PAGINATION_WINDOW);
  const end = Math.min(totalPages - 1, current + PAGINATION_WINDOW);

  if (start > 2) {
    items.push("ellipsis");
  }

  for (let item = start; item <= end; item += 1) {
    items.push(item);
  }

  if (end < totalPages - 1) {
    items.push("ellipsis");
  }

  items.push(totalPages);

  return items;
}

export function createPaginationState({
  page,
  totalPages,
  pathname,
  search,
}: {
  page: number;
  totalPages: number;
  pathname: string;
  search: string;
}) {
  const isHidden = totalPages < 1;
  const current = isHidden ? 1 : Math.min(Math.max(page, 1), totalPages);

  return {
    current,
    items: getPaginationItems(current, totalPages),
    hrefForPage: (nextPage: number) => buildPageHref(pathname, search, nextPage),
    isPrevDisabled: current <= 1,
    isNextDisabled: current >= totalPages,
    isHidden,
  };
}
