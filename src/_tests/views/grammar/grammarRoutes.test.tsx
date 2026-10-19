/** @jest-environment node */
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { recallSession } from "@/_tests/features/grammar-recall/fixture";
import { createEditorNote } from "@/_tests/features/grammar-note-editor/fixtures";
import { grammarReturnTo } from "@/views/grammar-detail/services/grammarReturnTo";

jest.mock("server-only", () => ({}));
jest.mock("@/shared/lib/supabase/server", () => ({ createSupabaseServerClient: jest.fn() }));
jest.mock("@supabase/supabase-js", () => ({ createClient: jest.fn(() => ({})) }));
jest.mock("next/cache", () => {
  const entries = new Map<string, Promise<unknown>>();
  return {
    unstable_cache: jest.fn((read: (...args: unknown[]) => Promise<unknown>, keys: string[]) => {
      return (...args: unknown[]) => {
        const key = JSON.stringify([keys, args]);
        if (!entries.has(key)) entries.set(key, read(...args));
        return entries.get(key);
      };
    }),
    __clearTestCache: () => entries.clear(),
  };
});

jest.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`redirect:${url}`);
  },
  notFound: () => {
    throw new Error("not-found");
  },
}));

jest.mock("@/views/grammar-session/services/loadGrammarSession", () => ({
  loadGrammarSession: jest.fn(),
}));

jest.mock("@/features/grammar-exam/services/actions/examActions", () => ({
  readGrammarExamFeedback: jest.fn(),
}));

jest.mock("@/app/(protected)/grammar-sessions/_components/GrammarSessionClient", () => ({
  GrammarSessionClient: () => null,
}));

jest.mock("@/views/grammar-session/ui/GrammarSessionView", () => ({
  GrammarSessionView: () => null,
}));

jest.mock("@/views/grammar-session/ui/GrammarExamPreparation", () => ({
  GrammarExamPreparation: () => null,
}));

jest.mock("@/views/grammar-session/ui/GrammarExamResultView", () => ({
  GrammarExamResultView: () => null,
}));

describe("grammar route transitions", () => {
  beforeEach(async () => {
    const { loadGrammarSession } =
      await import("@/views/grammar-session/services/loadGrammarSession");

    jest.mocked(loadGrammarSession).mockResolvedValue(recallSession());
    const { readGrammarExamFeedback } =
      await import("@/features/grammar-exam/services/actions/examActions");

    jest.mocked(readGrammarExamFeedback).mockReset();
  });

  it("renders an active practice and redirects completed sessions to their result", async () => {
    const { default: Page } = await import("@/app/(protected)/grammar-sessions/[id]/page");
    const { GrammarSessionView } = await import("@/views/grammar-session/ui/GrammarSessionView");
    const { loadGrammarSession } =
      await import("@/views/grammar-session/services/loadGrammarSession");
    const params = Promise.resolve({ id: recallSession().id });

    expect((await Page({ params, searchParams: Promise.resolve({}) })).type).toBe(
      GrammarSessionView,
    );
    jest.mocked(loadGrammarSession).mockResolvedValue({ ...recallSession(), status: "completed" });
    await expect(Page({ params, searchParams: Promise.resolve({}) })).rejects.toThrow(
      `redirect:/grammar-sessions/${recallSession().id}/result?returnTo=%2Fgrammar`,
    );
  });

  it("routes interrupted exam creation to a retry screen without making an AI call", async () => {
    const { default: Page } = await import("@/app/(protected)/grammar-sessions/[id]/page");
    const { GrammarExamPreparation } =
      await import("@/views/grammar-session/ui/GrammarExamPreparation");
    const { loadGrammarSession } =
      await import("@/views/grammar-session/services/loadGrammarSession");

    jest
      .mocked(loadGrammarSession)
      .mockResolvedValue({ ...recallSession(), mode: "exam", phase: "existing" });
    expect(
      (
        await Page({
          params: Promise.resolve({ id: recallSession().id }),
          searchParams: Promise.resolve({}),
        })
      ).type,
    ).toBe(GrammarExamPreparation);
  });

  it("does not reveal results for an incomplete session", async () => {
    const { default: Page } = await import("@/app/(protected)/grammar-sessions/[id]/result/page");
    const { readGrammarExamFeedback } =
      await import("@/features/grammar-exam/services/actions/examActions");

    await expect(
      Page({
        params: Promise.resolve({ id: recallSession().id }),
        searchParams: Promise.resolve({}),
      }),
    ).rejects.toThrow(`redirect:/grammar-sessions/${recallSession().id}?returnTo=%2Fgrammar`);
    expect(readGrammarExamFeedback).not.toHaveBeenCalled();
  });

  it.each([undefined, ["/grammar"], "//evil.test", "https://evil.test", "/grammar/another-note"])(
    "rejects invalid list return destination %s",
    (value) => {
      expect(grammarReturnTo(value)).toBe("/grammar");
    },
  );

  it("preserves the list filter and page", () => {
    expect(grammarReturnTo("/grammar?q=contrast&page=2")).toBe("/grammar?q=contrast&page=2");
  });
});

describe("private grammar detail", () => {
  it("reuses one owner's note and history on revisit without exposing them to another owner", async () => {
    const { createSupabaseServerClient } = await import("@/shared/lib/supabase/server");
    const { GrammarNoteRepository } = await import("@/entities/grammar-note");
    const { GrammarSessionRepository } = await import("@/entities/grammar-session");
    const { __clearTestCache } = jest.requireMock<{ __clearTestCache: () => void }>("next/cache");
    __clearTestCache();

    let owner: string | null = "owner-a";
    jest.mocked(createSupabaseServerClient).mockImplementation(
      async () =>
        ({
          auth: {
            getUser: async () => ({ data: { user: owner ? { id: owner } : null }, error: null }),
            getSession: async () => ({
              data: {
                session: owner ? { user: { id: owner }, access_token: `${owner}-token` } : null,
              },
              error: null,
            }),
          },
        }) as never,
    );
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "publishable-key";

    const note = { ...createEditorNote(), ownerId: "owner-a" };
    const noteRead = jest
      .spyOn(GrammarNoteRepository.prototype, "findById")
      .mockImplementation(async (id) => (owner === "owner-a" && id === note.id ? note : null));
    const historyRead = jest
      .spyOn(GrammarSessionRepository.prototype, "findHistory")
      .mockResolvedValue({
        items: [],
        total: 0,
        page: 1,
        pageSize: 10,
      });
    const { default: Page } = await import("@/app/(protected)/grammar/[id]/page");
    const props = {
      params: Promise.resolve({ id: note.id }),
      searchParams: Promise.resolve({ returnTo: "/grammar?page=2" }),
    };

    try {
      const first = await Page(props);
      const revisit = await Page(props);
      expect(first.props.note).toMatchObject({ id: note.id, ownerId: "owner-a" });
      expect(revisit.props.backHref).toBe("/grammar?page=2");
      expect(noteRead).toHaveBeenCalledTimes(1);
      expect(historyRead).toHaveBeenCalledTimes(1);

      await expect(
        Page({ ...props, params: Promise.resolve({ id: "00000000-0000-4000-8000-000000000002" }) }),
      ).rejects.toThrow("not-found");
      owner = "owner-b";
      await expect(Page(props)).rejects.toThrow("not-found");
      owner = null;
      await expect(Page(props)).rejects.toThrow("not-found");
    } finally {
      noteRead.mockRestore();
      historyRead.mockRestore();
      jest.mocked(createSupabaseServerClient).mockReset();
    }
  });
});
