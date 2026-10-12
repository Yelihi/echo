/** @jest-environment node */
import { describe, expect, it, jest } from "@jest/globals";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

jest.mock("@/features/logout/ui/Profile", () => ({ Profile: () => null }));
jest.mock("server-only", () => ({}));
jest.mock("@/shared/lib/supabase/server", () => ({ createSupabaseServerClient: jest.fn() }));
jest.mock("@supabase/supabase-js", () => ({ createClient: jest.fn() }));
jest.mock("next/cache", () => ({ unstable_cache: (read: () => unknown) => read }));

type Completion = {
  kind: "roleplay" | "memorization" | "grammar";
  completedAt: string;
};
type WeeklyCount = {
  startsOn: string;
  roleplay: number;
  memorization: number;
  grammar: number;
};

function summarize(completions: Completion[], now: Date) {
  const stats = jest.requireActual<{
    summarizePracticeStats: (
      completions: Completion[],
      now: Date,
    ) => { total: number; weeks: WeeklyCount[] };
  }>("@/views/my-page/services/server/getPracticeStats");
  return stats.summarizePracticeStats(completions, now);
}

const now = new Date("2026-10-12T03:00:00.000Z"); // 10월 12일 12:00 KST

describe("my-page practice statistics", () => {
  it("counts only the most recent 30 Korean calendar days by week and practice type", () => {
    const stats = summarize(
      [
        { kind: "roleplay", completedAt: "2026-09-12T14:59:59.000Z" },
        { kind: "roleplay", completedAt: "2026-09-12T15:00:00.000Z" },
        { kind: "memorization", completedAt: "2026-09-13T15:00:00.000Z" },
        { kind: "grammar", completedAt: "2026-10-11T15:00:00.000Z" },
        { kind: "grammar", completedAt: "2026-10-12T03:00:00.000Z" },
        { kind: "grammar", completedAt: "2026-10-12T03:00:01.000Z" },
      ],
      now,
    );

    expect(stats.total).toBe(4);
    expect(stats.weeks.find((week) => week.startsOn === "2026-09-07")).toMatchObject({
      roleplay: 1,
      memorization: 0,
      grammar: 0,
    });
    expect(stats.weeks.find((week) => week.startsOn === "2026-09-14")).toMatchObject({
      roleplay: 0,
      memorization: 1,
      grammar: 0,
    });
    expect(stats.weeks.find((week) => week.startsOn === "2026-10-12")).toMatchObject({
      roleplay: 0,
      memorization: 0,
      grammar: 2,
    });
  });

  it("returns an explicit zero state for an owner without completed sessions", () => {
    const stats = summarize([], now);
    expect(stats.total).toBe(0);
    expect(stats.weeks.length).toBeGreaterThan(0);
    expect(
      stats.weeks.every((week) => week.roleplay + week.memorization + week.grammar === 0),
    ).toBe(true);
  });

  it("shows the sidebar and grammar entry on my-page without recent history", async () => {
    const { EditorialShell } = await import("@/widgets/app-shell/ui/EditorialShell");
    const { MyPageView } = await import("@/views/my-page/ui/MyPageView");
    const shell = renderToStaticMarkup(
      createElement(EditorialShell, {
        pathname: "/my-page",
        children: createElement("p", null, "본문"),
      }),
    );
    const content = renderToStaticMarkup(createElement(MyPageView));

    expect(shell).toContain("<aside");
    expect(shell).toContain('href="/grammar"');
    expect(content).toContain('href="/grammar"');
    expect(content).toContain("연습 통계");
    expect(content).not.toContain("최근 학습 기록");
  });
});

describe("my-page statistics lookup", () => {
  async function setup(error: Error | null = null) {
    const { createClient } = await import("@supabase/supabase-js");
    const { createSupabaseServerClient } = await import("@/shared/lib/supabase/server");
    const filters: [string, string][] = [];
    const tables: string[] = [];
    const query = {
      select: () => query,
      eq: (column: string, value: string) => {
        filters.push([column, value]);
        return query;
      },
      gte: () => query,
      lte: () => query,
      order: () => query,
      range: async () => ({
        data: error
          ? null
          : [{ id: "record", completed_at: new Date(Date.now() - 1000).toISOString() }],
        error,
      }),
    };
    const client = {
      from: (table: string) => {
        tables.push(table);
        return query;
      },
    };
    jest.mocked(createClient).mockReturnValue(client as never);
    jest.mocked(createSupabaseServerClient).mockResolvedValue({
      auth: {
        getUser: async () => ({ data: { user: { id: "owner" } }, error: null }),
        getSession: async () => ({
          data: { session: { user: { id: "owner" }, access_token: "owner-token" } },
          error: null,
        }),
      },
    } as unknown as Awaited<ReturnType<typeof createSupabaseServerClient>>);
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "publishable-key";
    return { filters, tables, createClient };
  }

  it("uses the same owner and bearer token for all three completed-session reads", async () => {
    const { filters, tables, createClient } = await setup();
    const { getPracticeStats } = await import("@/views/my-page/services/server/getPracticeStats");

    await expect(getPracticeStats()).resolves.toMatchObject({ total: 3 });
    expect(tables).toEqual(["roleplay_sessions", "memorization_sessions", "grammar_sessions"]);
    expect(filters).toEqual(
      expect.arrayContaining([
        ["user_id", "owner"],
        ["owner_id", "owner"],
        ["status", "completed"],
      ]),
    );
    expect(createClient).toHaveBeenCalledWith(
      "https://example.supabase.co",
      "publishable-key",
      expect.objectContaining({ global: { headers: { Authorization: "Bearer owner-token" } } }),
    );
  });

  it("returns an error state when any completion read fails", async () => {
    await setup(new Error("database unavailable"));
    const { getPracticeStats } = await import("@/views/my-page/services/server/getPracticeStats");

    await expect(getPracticeStats()).resolves.toBeNull();
  });
});
