/** @jest-environment node */
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { recallSession } from "@/_tests/features/grammar-recall/fixture";
import { grammarReturnTo } from "@/views/grammar-detail/services/grammarReturnTo";

jest.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`redirect:${url}`);
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
