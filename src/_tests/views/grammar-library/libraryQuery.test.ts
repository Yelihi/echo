import { describe, it, expect } from "@jest/globals";
import {
  parseGrammarLibraryQuery,
  grammarLibraryHref,
} from "@/views/grammar-library/services/libraryQuery";
describe("grammar library URL", () => {
  it.each(["0", "-1", "1.5", "Infinity", "2147483648", "bad"])(
    "normalizes invalid page %s",
    (page) => expect(parseGrammarLibraryQuery({ page }).page).toBe(1),
  );
  it("preserves search and page in a safely encoded return URL", () =>
    expect(grammarLibraryHref({ page: 3, query: "not A & B" })).toBe(
      "/grammar?q=not+A+%26+B&page=3",
    ));
  it("bounds search and accepts a single value from repeated query", () =>
    expect(parseGrammarLibraryQuery({ page: ["2", "3"], q: ["  verb  ", "other"] })).toEqual({
      page: 2,
      query: "verb",
    }));
});
