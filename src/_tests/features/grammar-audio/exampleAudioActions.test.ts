/** @jest-environment node */
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GrammarNoteRepository } from "@/entities/grammar-note";
import { createEditorNote } from "@/_tests/features/grammar-note-editor/fixtures";
import { createExampleCandidates } from "@/_tests/features/grammar-example-generation/fixtures";
async function getExampleAudioPreparation(input: unknown) {
  return (
    await import("@/features/grammar-audio/services/actions/getExampleAudioPreparation")
  ).getExampleAudioPreparation(input);
}
async function retryExampleAudioPreparation(input: unknown) {
  return (
    await import("@/features/grammar-audio/services/actions/retryExampleAudioPreparation")
  ).retryExampleAudioPreparation(input);
}
let createSupabaseServerClient: typeof import("@/shared/lib/supabase/server").createSupabaseServerClient;
let getSupabaseServiceRoleClient: typeof import("@/shared/lib/supabase/service-role").getSupabaseServiceRoleClient;
jest.mock("server-only", () => ({}));
jest.mock("@/shared/lib/supabase/server", () => ({ createSupabaseServerClient: jest.fn() }));
jest.mock("@/shared/lib/supabase/service-role", () => ({
  getSupabaseServiceRoleClient: jest.fn(),
}));
jest.mock("@/shared/lib/openai/server", () => ({ getOpenAITTSModel: () => "tts-1" }));
const note = {
  ...createEditorNote(),
  examples: createExampleCandidates().map((e) => ({ ...e, reviewStatus: "reviewed" as const })),
};
const input = { noteId: note.id, sentenceIds: [note.examples[0].id] };
const rpc = jest.fn<(...args: unknown[]) => Promise<unknown>>();
const invoke = jest.fn<(...args: unknown[]) => Promise<unknown>>();
beforeEach(async () => {
  ({ createSupabaseServerClient } = await import("@/shared/lib/supabase/server"));
  ({ getSupabaseServiceRoleClient } = await import("@/shared/lib/supabase/service-role"));
  jest.restoreAllMocks();
  jest.clearAllMocks();
  jest.spyOn(GrammarNoteRepository.prototype, "findById").mockResolvedValue(note);
  jest.mocked(createSupabaseServerClient).mockResolvedValue({
    auth: { getUser: async () => ({ data: { user: { id: note.ownerId } }, error: null }) },
  } as never);
  jest
    .mocked(getSupabaseServiceRoleClient)
    .mockReturnValue({ rpc, functions: { invoke } } as never);
  rpc.mockResolvedValue({
    data: [{ sentenceId: input.sentenceIds[0], status: "ready", objectPath: "private/path" }],
    error: null,
  });
});
describe("stored IDs only audio actions", () => {
  it("a2: status is read-only and does not expose private object paths", async () => {
    expect(await getExampleAudioPreparation(input)).toEqual({
      ok: true,
      data: [{ sentenceId: input.sentenceIds[0], status: "ready" }],
    });
    expect(rpc).toHaveBeenCalledWith(
      "example_audio_preparation",
      expect.objectContaining({ p_owner_id: note.ownerId, p_enqueue: false, p_retry: false }),
    );
    expect(invoke).not.toHaveBeenCalled();
  });
  it("rejects unowned IDs and client-supplied sentence/path before privileged calls", async () => {
    expect(
      (await retryExampleAudioPreparation({ ...input, text: "untrusted", objectPath: "other.mp3" }))
        .ok,
    ).toBe(false);
    jest.mocked(GrammarNoteRepository.prototype.findById).mockResolvedValue(null);
    expect((await retryExampleAudioPreparation(input)).ok).toBe(false);
    expect(getSupabaseServiceRoleClient).not.toHaveBeenCalled();
    expect(rpc).not.toHaveBeenCalled();
  });
  it("rejects unauthenticated status and retry before even loading a note", async () => {
    jest.mocked(createSupabaseServerClient).mockResolvedValue({
      auth: { getUser: async () => ({ data: { user: null }, error: null }) },
    } as never);
    expect(await getExampleAudioPreparation(input)).toEqual({ ok: false, code: "UNAUTHORIZED" });
    expect(await retryExampleAudioPreparation(input)).toEqual({ ok: false, code: "UNAUTHORIZED" });
    expect(GrammarNoteRepository.prototype.findById).not.toHaveBeenCalled();
    expect(rpc).not.toHaveBeenCalled();
  });
  it("a1-register: only explicit retry registers; success paths stay reusable", async () => {
    expect((await retryExampleAudioPreparation(input)).ok).toBe(true);
    expect(rpc).toHaveBeenCalledWith(
      "example_audio_preparation",
      expect.objectContaining({ p_enqueue: true, p_retry: true, p_example_ids: input.sentenceIds }),
    );
    expect(invoke).not.toHaveBeenCalled();
    rpc.mockRejectedValueOnce(new Error("registration failed"));
    expect(await retryExampleAudioPreparation(input)).toEqual({
      ok: true,
      data: [
        {
          sentenceId: input.sentenceIds[0],
          status: "retryable",
          code: "REGISTRATION_FAILED",
          operationId: expect.any(String),
        },
      ],
    });
  });
});

it("DB 함수 누락은 추적 번호를 반환하고 원문은 노출하지 않는다", async () => {
  rpc.mockResolvedValue({
    data: null,
    error: { code: "PGRST202", message: "private schema data" },
  });
  const result = await getExampleAudioPreparation(input);
  expect(result).toEqual({ ok: false, code: "FAILED", operationId: expect.any(String) });
  expect(JSON.stringify(result)).not.toContain("private");
});
it("worker 호출이 error 반환값으로 실패해도 작업을 보존하고 실행 실패를 알린다", async () => {
  const previous = process.env.PROCESS_GRAMMAR_AUDIO_SECRET;
  process.env.PROCESS_GRAMMAR_AUDIO_SECRET = "test-only";
  try {
    rpc.mockResolvedValue({
      data: [{ sentenceId: input.sentenceIds[0], status: "queued" }],
      error: null,
    });
    invoke.mockResolvedValue({ data: null, error: new Error("worker unavailable") });
    expect(await retryExampleAudioPreparation(input)).toEqual({
      ok: true,
      data: [
        {
          sentenceId: input.sentenceIds[0],
          status: "queued",
          code: "PROCESSOR_UNAVAILABLE",
          operationId: expect.any(String),
        },
      ],
    });
    expect(rpc).toHaveBeenCalledTimes(1);
  } finally {
    if (previous === undefined) delete process.env.PROCESS_GRAMMAR_AUDIO_SECRET;
    else process.env.PROCESS_GRAMMAR_AUDIO_SECRET = previous;
  }
});
