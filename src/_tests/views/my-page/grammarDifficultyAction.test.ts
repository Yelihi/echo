import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { createSupabaseServerClient as CreateClient } from "@/shared/lib/supabase/server";
import type { UserId } from "@/entities/value-object";

let createSupabaseServerClient: typeof CreateClient;

jest.mock("server-only", () => ({}));
jest.mock("@/shared/lib/supabase/server", () => ({ createSupabaseServerClient: jest.fn() }));

const save = jest.fn<() => Promise<void>>();

beforeEach(async () => {
  ({ createSupabaseServerClient } = await import("@/shared/lib/supabase/server"));
  jest.restoreAllMocks();
  jest.clearAllMocks();
  jest.mocked(createSupabaseServerClient).mockResolvedValue({
    auth: { getUser: async () => ({ data: { user: { id: "owner" } }, error: null }) },
  } as never);
  save.mockResolvedValue();
  const { UserProfileRepository } = await import("@/entities/user-profile");
  jest.spyOn(UserProfileRepository.prototype, "saveDifficulty").mockImplementation(save);
});

describe("예문 난이도 저장 액션", () => {
  it.each([0, 4, "2", null])("범위 밖 입력 %p를 저장하지 않는다", async (value) => {
    const { saveGrammarDifficulty } =
      await import("@/views/my-page/services/actions/saveGrammarDifficulty");
    expect(await saveGrammarDifficulty(value)).toEqual({ ok: false, code: "INVALID" });
    expect(save).not.toHaveBeenCalled();
  });

  it("로그인하지 않은 사용자는 프로필을 수정할 수 없다", async () => {
    jest.mocked(createSupabaseServerClient).mockResolvedValue({
      auth: { getUser: async () => ({ data: { user: null }, error: null }) },
    } as never);
    const { saveGrammarDifficulty } =
      await import("@/views/my-page/services/actions/saveGrammarDifficulty");

    expect(await saveGrammarDifficulty(3)).toEqual({ ok: false, code: "UNAUTHORIZED" });
    expect(save).not.toHaveBeenCalled();
  });

  it("인증된 본인의 난이도만 저장하고 저장 오류는 실패로 반환한다", async () => {
    const { saveGrammarDifficulty } =
      await import("@/views/my-page/services/actions/saveGrammarDifficulty");
    expect(await saveGrammarDifficulty(3)).toEqual({ ok: true });
    expect(save).toHaveBeenCalledWith("owner", 3);

    save.mockRejectedValueOnce(new Error("database unavailable"));
    expect(await saveGrammarDifficulty(1)).toEqual({ ok: false, code: "FAILED" });
  });
});

describe("예문 난이도 저장소", () => {
  it("기존 프로필의 다른 필드를 변경하지 않고 난이도만 갱신한다", async () => {
    const { UserProfileRepository } = await import("@/entities/user-profile");
    jest.restoreAllMocks();
    const row = {
      id: "owner",
      display_name: "Yeli",
      example_difficulty: 1,
      created_at: "2026-10-12T00:00:00Z",
      updated_at: "2026-10-12T00:00:00Z",
    };
    const selectQuery = {
      eq: jest.fn().mockReturnValue({ maybeSingle: async () => ({ data: row, error: null }) }),
    };
    const updateQuery = { eq: jest.fn(async () => ({ error: null })) };
    const update = jest.fn().mockReturnValue(updateQuery);
    const client = { from: jest.fn().mockReturnValue({ select: () => selectQuery, update }) };
    const repository = new UserProfileRepository(client as never);

    await repository.saveDifficulty("owner" as UserId, 3);

    expect(client.from).toHaveBeenCalledWith("user_profiles");
    expect(update).toHaveBeenCalledWith({ example_difficulty: 3 });
    expect(updateQuery.eq).toHaveBeenCalledWith("id", "owner");
  });

  it("프로필이 없는 사용자도 다른 필드를 덮어쓰지 않고 새 난이도를 저장한다", async () => {
    const { UserProfileRepository } = await import("@/entities/user-profile");
    jest.restoreAllMocks();
    const selectQuery = {
      eq: jest.fn().mockReturnValue({ maybeSingle: async () => ({ data: null, error: null }) }),
    };
    const insert = jest.fn(async () => ({ error: null }));
    const client = { from: jest.fn().mockReturnValue({ select: () => selectQuery, insert }) };

    await new UserProfileRepository(client as never).saveDifficulty("owner" as UserId, 2);

    expect(insert).toHaveBeenCalledWith({ id: "owner", example_difficulty: 2 });
  });
});
