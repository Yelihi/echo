import { describe, expect, it } from "@jest/globals";

// shared
import {
  buildPageHref,
  createPaginationState,
  getPaginationItems,
  parsePageQuery,
} from "@/shared/utils/pagination";

describe("parsePageQuery", () => {
  it("should return 1 when the page query is missing or invalid", () => {
    expect(parsePageQuery(undefined)).toBe(1);
    expect(parsePageQuery("0")).toBe(1);
    expect(parsePageQuery("-2")).toBe(1);
    expect(parsePageQuery("abc")).toBe(1);
  });

  it("should return the floored page number when the query is a valid page", () => {
    expect(parsePageQuery("3")).toBe(3);
    expect(parsePageQuery("2.9")).toBe(2);
  });
});

describe("buildPageHref", () => {
  it("sets page on the current query and keeps other params", () => {
    const href = buildPageHref("/role-playing", "tag=일상&tag=여행", 3);
    const params = new URL(href, "https://echo.test").searchParams;

    expect(href.startsWith("/role-playing?")).toBe(true);
    expect(params.getAll("tag")).toEqual(["일상", "여행"]);
    expect(params.get("page")).toBe("3");
  });

  it("removes page from the query when navigating to the first page", () => {
    const href = buildPageHref("/role-playing", "tag=일상&page=2", 1);
    const params = new URL(href, "https://echo.test").searchParams;

    expect(params.get("tag")).toBe("일상");
    expect(params.has("page")).toBe(false);
  });

  it("returns the pathname when the first page has no other query", () => {
    expect(buildPageHref("/role-playing", "page=4", 1)).toBe("/role-playing");
  });
});

describe("getPaginationItems", () => {
  it("returns sequential pages when the total fits in one row", () => {
    expect(getPaginationItems(1, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  it("keeps the first and last page with ellipsis for a long range", () => {
    expect(getPaginationItems(10, 20)).toEqual([1, "ellipsis", 9, 10, 11, "ellipsis", 20]);
  });

  it("omits the leading ellipsis near the start", () => {
    expect(getPaginationItems(1, 20)).toEqual([1, 2, "ellipsis", 20]);
  });
});

describe("createPaginationState", () => {
  it("should hide pagination when there are no pages", () => {
    const state = createPaginationState({
      page: 1,
      totalPages: 0,
      pathname: "/role-playing",
      search: "tag=일상",
    });

    expect(state.isHidden).toBe(true);
    expect(state.items).toEqual([]);
  });

  it("should clamp the current page and keep other query params in hrefs", () => {
    const state = createPaginationState({
      page: 9,
      totalPages: 3,
      pathname: "/role-playing",
      search: "tag=일상",
    });

    expect(state.current).toBe(3);
    expect(state.isNextDisabled).toBe(true);
    expect(state.hrefForPage(2)).toBe("/role-playing?tag=%EC%9D%BC%EC%83%81&page=2");
    expect(state.hrefForPage(1)).toBe("/role-playing?tag=%EC%9D%BC%EC%83%81");
  });
});
