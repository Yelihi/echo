import { describe, expect, it, jest } from "@jest/globals";

jest.mock("server-only", () => ({}));
jest.mock("@/shared/lib/supabase/server", () => ({ createSupabaseServerClient: jest.fn() }));

import { parseRecordingManagementQuery, recordingManagementHref } from "../../../models/query";

describe("recording management", () => {
  it("normalizes invalid URLs and preserves filters in page links", () => {
    expect(
      parseRecordingManagementQuery({ page: "-2", status: "unknown", sort: ["oldest"] }),
    ).toEqual({ page: 1, status: "all", sort: "newest" });
    expect(parseRecordingManagementQuery({ page: "Infinity" }).page).toBe(1);
    expect(parseRecordingManagementQuery({ page: "2.5" }).page).toBe(1);
    expect(recordingManagementHref({ page: 2, status: "delete-failed", sort: "oldest" })).toBe(
      "/recording-management?page=2&status=delete-failed&sort=oldest",
    );
  });

  it("counts all statuses, scopes reads to the owner, and requests only the clamped page", async () => {
    const { createSupabaseServerClient } = await import("@/shared/lib/supabase/server");
    const { getRecordingManagementPage } = await import("../getRecordingManagementPage");
    const requests: Array<{
      filters: Array<[string, unknown]>;
      range?: [number, number];
      orders: string[];
    }> = [];
    const from = jest.fn(() => {
      const request = {
        filters: [] as Array<[string, unknown]>,
        orders: [] as string[],
        range: undefined as [number, number] | undefined,
      };
      requests.push(request);
      const builder = {
        select: jest.fn(() => builder),
        eq: jest.fn((key: string, value: unknown) => {
          request.filters.push([key, value]);
          return builder;
        }),
        order: jest.fn((key: string) => {
          request.orders.push(key);
          return builder;
        }),
        range: jest.fn((start: number, end: number) => {
          request.range = [start, end];
          return builder;
        }),
        then: (resolve: (value: unknown) => unknown) => {
          const status = request.filters.find(([key]) => key === "status")?.[1];
          return Promise.resolve(
            resolve({
              error: null,
              count: status === "connected" ? 20 : status === "orphaned" ? 12 : 1,
              data: [
                {
                  id: "draft",
                  user_id: "owner",
                  object_path: "owner/session/voice.webm",
                  size_bytes: 2048,
                  created_at: "2026-09-11T00:00:00Z",
                  session_id: null,
                  status: "orphaned",
                },
              ],
            }),
          );
        },
      };
      return builder;
    });
    jest.mocked(createSupabaseServerClient).mockImplementation(
      async () =>
        ({
          auth: { getUser: async () => ({ data: { user: { id: "owner" } }, error: null }) },
          from,
        }) as unknown as Awaited<ReturnType<typeof createSupabaseServerClient>>,
    );
    const result = await getRecordingManagementPage({
      page: 500,
      status: "orphaned",
      sort: "oldest",
    });
    expect(result.recordsSummary).toEqual({
      total: 33,
      connected: 20,
      orphaned: 12,
      failDelete: 1,
    });
    expect(result).toMatchObject({ page: 2, totalPages: 2, totalCount: 12, pageSize: 10 });
    expect(
      requests.every(({ filters }) =>
        filters.some(([key, value]) => key === "user_id" && value === "owner"),
      ),
    ).toBe(true);
    expect(requests[3].range).toEqual([10, 19]);
    expect(requests[3].orders).toEqual(["created_at", "id"]);
    expect(result.records[0]).toMatchObject({
      name: "voice.webm",
      fileSize: "2 KB",
      status: "orphaned",
    });
  });
});
