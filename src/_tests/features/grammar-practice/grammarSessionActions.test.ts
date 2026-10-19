/** @jest-environment node */
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GrammarSessionRepository } from "@/entities/grammar-session";
import type { createSupabaseServerClient as CreateClient } from "@/shared/lib/supabase/server";
import type { startGrammarSession as StartSession } from "@/features/grammar-practice/services/actions/grammarSessionActions";

jest.mock("server-only", () => ({}));

jest.mock("@/shared/lib/supabase/server", () => ({ createSupabaseServerClient: jest.fn() }));

jest.mock("@/shared/lib/logging/pino", () => ({ recordOperationEvent: jest.fn() }));
jest.mock("next/cache", () => ({ revalidateTag: jest.fn(), revalidatePath: jest.fn() }));

let createSupabaseServerClient: typeof CreateClient;

let startGrammarSession: typeof StartSession;

beforeEach(async () => {
  ({ createSupabaseServerClient } = await import("@/shared/lib/supabase/server"));
  ({ startGrammarSession } =
    await import("@/features/grammar-practice/services/actions/grammarSessionActions"));
  jest.clearAllMocks();
});

describe("연습 액션 오류 계약", () => {
  it("비로그인은 저장소를 호출하지 않고 UI 문구 대신 권한 코드를 반환한다", async () => {
    jest.mocked(createSupabaseServerClient).mockResolvedValue({
      auth: { getUser: async () => ({ data: { user: null }, error: null }) },
    } as never);
    const start = jest.spyOn(GrammarSessionRepository.prototype, "start");

    expect(await startGrammarSession({})).toEqual({ ok: false, code: "UNAUTHORIZED" });
    expect(start).not.toHaveBeenCalled();
    start.mockRestore();
  });

  it("알 수 없는 내부 오류는 응답에 노출하지 않는다", async () => {
    jest
      .mocked(createSupabaseServerClient)
      .mockRejectedValue(new Error("secret connection details"));
    expect(await startGrammarSession({})).toEqual({ ok: false, code: "FAILED" });
  });
});

describe("어법 연습 완료 후 통계 캐시", () => {
  it("완료 성공일 때 현재 사용자 통계를 무효화한다", async () => {
    const { completeGrammarSession } =
      await import("@/features/grammar-practice/services/actions/grammarSessionActions");
    const { revalidateTag } = await import("next/cache");
    jest.mocked(createSupabaseServerClient).mockResolvedValue({
      auth: { getUser: async () => ({ data: { user: { id: "owner" } }, error: null }) },
    } as never);
    const complete = jest
      .spyOn(GrammarSessionRepository.prototype, "complete")
      .mockResolvedValue({ noteId: "note-id" } as never);

    expect(
      (
        await completeGrammarSession({
          id: "00000000-0000-4000-8000-000000000001",
          expectedVersion: 1,
        })
      ).ok,
    ).toBe(true);
    expect(revalidateTag).toHaveBeenCalledWith("my-page-practice-stats:owner", { expire: 0 });
    const { revalidatePath } = await import("next/cache");
    expect(revalidatePath).toHaveBeenCalledWith("/grammar/note-id");
    complete.mockRestore();
  });

  it("완료 실패일 때 통계를 무효화하지 않는다", async () => {
    const { completeGrammarSession } =
      await import("@/features/grammar-practice/services/actions/grammarSessionActions");
    const { revalidateTag } = await import("next/cache");
    jest.mocked(createSupabaseServerClient).mockResolvedValue({
      auth: { getUser: async () => ({ data: { user: { id: "owner" } }, error: null }) },
    } as never);
    const complete = jest
      .spyOn(GrammarSessionRepository.prototype, "complete")
      .mockRejectedValue(new Error("failed"));

    expect(
      (
        await completeGrammarSession({
          id: "00000000-0000-4000-8000-000000000001",
          expectedVersion: 1,
        })
      ).ok,
    ).toBe(false);
    expect(revalidateTag).not.toHaveBeenCalled();
    const { revalidatePath } = await import("next/cache");
    expect(revalidatePath).not.toHaveBeenCalled();
    complete.mockRestore();
  });
});
