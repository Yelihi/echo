import { beforeEach, expect, it, jest } from "@jest/globals";

jest.mock("server-only", () => ({}));
jest.mock("@/shared/lib/supabase/server", () => ({ createSupabaseServerClient: jest.fn() }));
jest.mock("@/shared/lib/tts/server", () => ({ OpenAITTSProvider: jest.fn() }));
jest.mock(
  "@/features/memorization-paragraph-suggestion/services/server/suggestMemorizationParagraphs",
  () => ({ suggestMemorizationParagraphs: jest.fn() }),
);

const rpc = jest.fn();
beforeEach(async () => {
  jest.clearAllMocks();
  const { createSupabaseServerClient } = await import("@/shared/lib/supabase/server");
  jest
    .mocked(createSupabaseServerClient)
    .mockResolvedValue({
      auth: { getUser: async () => ({ data: { user: { id: "owner" } } }) },
      rpc,
    } as never);
});

it.each(["not_invited", "rate_limited", "database_failure"])(
  "%s이면 유료 AI를 호출하지 않는다",
  async (permission) => {
    rpc.mockReturnValue({
      data: permission === "database_failure" ? null : permission,
      error: permission === "database_failure" ? new Error("DB") : null,
    });
    const { speakRolePlayPartnerLine } = await import("../speakRolePlayPartnerLine");
    const { suggestParagraphs } =
      await import("@/features/memorization-paragraph-suggestion/services/actions/suggestParagraphs");
    const { OpenAITTSProvider } = await import("@/shared/lib/tts/server");
    const { suggestMemorizationParagraphs } =
      await import("@/features/memorization-paragraph-suggestion/services/server/suggestMemorizationParagraphs");
    expect(
      (await speakRolePlayPartnerLine({ mode: "preview", voice: "emma", speed: 1 })).code,
    ).toBe(
      permission === "not_invited"
        ? "TTS-005"
        : permission === "rate_limited"
          ? "TTS-004"
          : "TTS-003",
    );
    expect((await suggestParagraphs("English is a daily habit.")).code).toBe(
      permission === "not_invited"
        ? "MPS-006"
        : permission === "rate_limited"
          ? "MPS-007"
          : "MPS-004",
    );
    expect(OpenAITTSProvider).not.toHaveBeenCalled();
    expect(suggestMemorizationParagraphs).not.toHaveBeenCalled();
  },
);
