/** @jest-environment node */
import { describe, expect, it, jest } from "@jest/globals";

jest.mock("server-only", () => ({}));
jest.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
}));

describe("공용 사용자 인증 확인", () => {
  it.each([
    { user: { id: "owner" }, error: null, expected: { id: "owner" } },
    { user: null, error: null, expected: null },
    { user: { id: "owner" }, error: { message: "invalid token" }, expected: null },
  ])("사용자와 인증 오류를 함께 확인한다: $error", async ({ user, error, expected }) => {
    const { getAuthenticatedUser } = await import("@/shared/lib/supabase/getAuthenticatedUser");
    const getUser = jest.fn(async () => ({ data: { user }, error }));
    expect(await getAuthenticatedUser({ auth: { getUser } } as never)).toEqual(expected);
    expect(getUser).toHaveBeenCalledTimes(1);
  });

  it("기존 requireUser의 미인증 404 응답을 유지한다", async () => {
    const { requireUser } = await import("@/features/login/services/requireUser");
    await expect(
      requireUser({
        auth: { getUser: async () => ({ data: { user: null }, error: null }) },
      } as never),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });
});
