/** @jest-environment node */
import { describe, it, expect, jest, beforeEach } from "@jest/globals";

import type { GrammarNoteRepository } from "@/entities/grammar-note";

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
    jest.mocked(createSupabaseServerClient).mockResolvedValue({
      auth: { getUser: async () => ({ data: { user: { id: "owner" } }, error: null }) },
    } as unknown as Awaited<ReturnType<typeof createSupabaseServerClient>>);
    findMany.mockResolvedValue({ items: [], total: 41, page: 999, pageSize: 20 });
  });
  it("redirects an out-of-range page to last valid page with search preserved", async () => {
    const { default: GrammarLibraryPage } = await import("@/app/(protected)/grammar/(list)/page");
    await expect(
      GrammarLibraryPage({ searchParams: Promise.resolve({ page: "999", q: "verb" }) }),
    ).rejects.toThrow("redirect:/grammar?q=verb&page=3");
    expect(findMany).toHaveBeenCalledWith({ page: 999, pageSize: 20, query: "verb" });
  });
  it("normalizes an invalid URL before rendering valid links", async () => {
    findMany.mockResolvedValue({ items: [], total: 0, page: 1, pageSize: 20 });
    const { default: GrammarLibraryPage } = await import("@/app/(protected)/grammar/(list)/page");
    await expect(
      GrammarLibraryPage({ searchParams: Promise.resolve({ page: "bad" }) }),
    ).rejects.toThrow("redirect:/grammar");
  });
});
