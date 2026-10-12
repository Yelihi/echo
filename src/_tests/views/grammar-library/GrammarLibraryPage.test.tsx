/** @jest-environment node */
import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import type { GrammarNoteRepository } from "@/entities/grammar-note";

jest.mock("server-only", () => ({}));
jest.mock("@/shared/lib/supabase/server", () => ({ createSupabaseServerClient: jest.fn() }));

jest.mock("@/shared/lib/logging/pino", () => ({ recordOperationEvent: jest.fn() }));

jest.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`redirect:${url}`);
  },
}));

describe("grammar list route", () => {
  const findMany = jest.fn<InstanceType<typeof GrammarNoteRepository>["findMany"]>();

  beforeEach(async () => {
    const { GrammarNoteRepository } = await import("@/entities/grammar-note");
    const { createSupabaseServerClient } = await import("@/shared/lib/supabase/server");

    jest.spyOn(GrammarNoteRepository.prototype, "findMany").mockImplementation(findMany);
    findMany.mockClear();
    jest.mocked(createSupabaseServerClient).mockResolvedValue({
      auth: { getUser: async () => ({ data: { user: { id: "owner" } }, error: null }) },
    } as unknown as Awaited<ReturnType<typeof createSupabaseServerClient>>);
    findMany.mockResolvedValue({ items: [], total: 41, page: 999, pageSize: 10 });
  });

  it("redirects an out-of-range page to last valid page with search preserved", async () => {
    const { GrammarLibraryContent } =
      await import("@/views/grammar-library/ui/GrammarLibraryContent");

    await expect(GrammarLibraryContent({ query: { page: 999, query: "verb" } })).rejects.toThrow(
      "redirect:/grammar?q=verb&page=5",
    );
    expect(findMany).toHaveBeenCalledWith({ page: 999, pageSize: 10, query: "verb" });
  });

  it("loads ten notes through the named server service", async () => {
    const { getGrammarLibraryPage } =
      await import("@/views/grammar-library/services/server/getGrammarLibraryPage");
    const query = { page: 2, query: "verb" };
    const notePage = { items: [], total: 11, page: 2, pageSize: 10 };
    findMany.mockResolvedValueOnce(notePage);

    await expect(getGrammarLibraryPage(query)).resolves.toEqual(notePage);
    expect(findMany).toHaveBeenCalledWith({ ...query, pageSize: 10 });
  });

  it("returns a list error only when the authenticated lookup fails", async () => {
    const { getGrammarLibraryPage } =
      await import("@/views/grammar-library/services/server/getGrammarLibraryPage");
    findMany.mockRejectedValueOnce(new Error("database unavailable"));

    await expect(getGrammarLibraryPage({ page: 1, query: "verb" })).resolves.toBeNull();
  });

  it("keeps the retry UI inside the list when the lookup fails", async () => {
    const { GrammarLibraryContent } =
      await import("@/views/grammar-library/ui/GrammarLibraryContent");
    findMany.mockRejectedValueOnce(new Error("database unavailable"));

    const html = renderToStaticMarkup(
      await GrammarLibraryContent({ query: { page: 1, query: "verb" } }),
    );
    expect(html).toContain("어법 노트를 불러오지 못했습니다");
    expect(html).toContain('href="/grammar?q=verb"');
  });

  it("redirects an unauthenticated list visit before querying notes", async () => {
    const { createSupabaseServerClient } = await import("@/shared/lib/supabase/server");
    jest.mocked(createSupabaseServerClient).mockResolvedValueOnce({
      auth: { getUser: async () => ({ data: { user: null }, error: null }) },
    } as unknown as Awaited<ReturnType<typeof createSupabaseServerClient>>);
    const { GrammarLibraryContent } =
      await import("@/views/grammar-library/ui/GrammarLibraryContent");

    await expect(GrammarLibraryContent({ query: { page: 1, query: "" } })).rejects.toThrow(
      "redirect:/login",
    );
    expect(findMany).not.toHaveBeenCalled();
  });

  it("renders the title and search before the note list resolves", async () => {
    const { default: GrammarLibraryPage } = await import("@/app/(protected)/grammar/(list)/page");
    const html = renderToStaticMarkup(
      await GrammarLibraryPage({ searchParams: Promise.resolve({ q: "verb" }) }),
    );

    expect(html).toContain("어법 노트");
    expect(html).toContain('name="q"');
    expect(html).toContain('value="verb"');
    expect(html).toContain("어법 노트를 불러오는 중");
    expect(html).not.toContain("0개의 어법 노트");
  });

  it("keeps filtered page links and makes each note card the navigation target", async () => {
    const { GrammarNoteList } = await import("@/views/grammar-library/ui/GrammarNoteList");
    const html = renderToStaticMarkup(
      createElement(GrammarNoteList, {
        data: {
          items: [
            {
              id: "11111111-1111-4111-8111-111111111111",
              ownerId: "22222222-2222-4222-8222-222222222222",
              version: 1,
              createdAt: "2026-10-12T00:00:00Z",
              updatedAt: "2026-10-12T00:00:00Z",
              title: "Verb phrase",
              sentence: "I have been reading.",
              tags: ["verb"],
            },
          ],
          total: 11,
          page: 1,
          pageSize: 10,
        },
        query: "verb",
      }),
    );

    expect(html).toContain(
      'href="/grammar/11111111-1111-4111-8111-111111111111?returnTo=%2Fgrammar%3Fq%3Dverb"',
    );
    expect(html).toContain('href="/grammar?q=verb&amp;page=2"');
    expect(html).not.toContain(">→</span>");
    expect(html).toContain("active:scale");
  });

  it("normalizes an invalid URL before rendering valid links", async () => {
    findMany.mockResolvedValue({ items: [], total: 0, page: 1, pageSize: 20 });
    const { default: GrammarLibraryPage } = await import("@/app/(protected)/grammar/(list)/page");

    await expect(
      GrammarLibraryPage({ searchParams: Promise.resolve({ page: "bad" }) }),
    ).rejects.toThrow("redirect:/grammar");
  });
});
