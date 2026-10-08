/** @jest-environment node */
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GrammarSessionRepository } from "@/entities/grammar-session";
import type { createSupabaseServerClient as CreateClient } from "@/shared/lib/supabase/server";
import type { startGrammarSession as StartSession } from "@/features/grammar-practice/services/actions/grammarSessionActions";

jest.mock("server-only", () => ({}));

jest.mock("@/shared/lib/supabase/server", () => ({ createSupabaseServerClient: jest.fn() }));

jest.mock("@/shared/lib/logging/pino", () => ({ recordOperationEvent: jest.fn() }));

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
