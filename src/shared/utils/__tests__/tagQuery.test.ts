import { describe, expect, it } from "@jest/globals";

// shared
import { buildTagFilterHref, parseTagQuery, toggleFilterTag } from "@/shared/utils/tagQuery";

describe("parseTagQuery", () => {
  it("should return unique trimmed lowercase tags from a string or array", () => {
    expect(parseTagQuery(undefined)).toEqual([]);
    expect(parseTagQuery("  일상 ")).toEqual(["일상"]);
    expect(parseTagQuery(["여행", "여행", " 비즈니스 "])).toEqual(["여행", "비즈니스"]);
  });

  it("should drop empty tag values", () => {
    expect(parseTagQuery(["", "   "])).toEqual([]);
  });
});

describe("buildTagFilterHref", () => {
  it("should return the pathname when no tags are selected", () => {
    expect(buildTagFilterHref("/sentence-memorization", [])).toBe("/sentence-memorization");
  });

  it("should append repeated tag params without a page query", () => {
    const href = buildTagFilterHref("/role-playing", ["일상", "여행"]);
    const params = new URL(href, "https://echo.test").searchParams;

    expect(href.startsWith("/role-playing?")).toBe(true);
    expect(params.getAll("tag")).toEqual(["일상", "여행"]);
    expect(params.has("page")).toBe(false);
  });
});

describe("toggleFilterTag", () => {
  it("should clear all tags when the all tag is selected", () => {
    expect(toggleFilterTag(["일상"], "전체", "전체")).toEqual([]);
  });

  it("should add a missing tag and remove a selected tag", () => {
    expect(toggleFilterTag(["일상"], "여행", "전체")).toEqual(["일상", "여행"]);
    expect(toggleFilterTag(["일상", "여행"], "일상", "전체")).toEqual(["여행"]);
  });
});
