/** @jest-environment node */
import { beforeEach, describe, expect, it, jest } from "@jest/globals";

jest.mock("server-only", () => ({}));
jest.mock("next/cache", () => ({ revalidateTag: jest.fn() }));

beforeEach(() => {
  jest.clearAllMocks();
});

describe("롤플레잉 녹음 완료 후 통계 캐시", () => {
  it("RPC 완료 성공일 때 현재 사용자 통계를 무효화한다", async () => {
    const { completeRoleplayRecording } = await import("../completeRoleplayRecording");
    const { revalidateTag } = await import("next/cache");
    const response = await completeRoleplayRecording(
      { rpc: async () => ({ error: null }) } as never,
      "owner",
      "session",
    );

    expect(response.status).toBe(200);
    expect(revalidateTag).toHaveBeenCalledWith("my-page-practice-stats:owner", { expire: 0 });
  });

  it("RPC 실패일 때 통계를 무효화하지 않는다", async () => {
    const { completeRoleplayRecording } = await import("../completeRoleplayRecording");
    const { revalidateTag } = await import("next/cache");
    const response = await completeRoleplayRecording(
      { rpc: async () => ({ error: { code: "P0001", message: "failed" } }) } as never,
      "owner",
      "session",
    );

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(revalidateTag).not.toHaveBeenCalled();
  });
});
