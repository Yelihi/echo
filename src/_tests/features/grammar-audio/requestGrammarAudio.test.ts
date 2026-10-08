/** @jest-environment node */
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { OpenAITTSProvider } from "@/shared/lib/tts/server";
import type { GrammarNote } from "@/entities/grammar-note";
import { recallSession } from "@/_tests/features/grammar-recall/fixture";
import { createGrammarAnalysis } from "@/_tests/fixtures/grammarAnalysis";

jest.mock("server-only", () => ({}));

jest.mock("@/shared/lib/supabase/server", () => ({ createSupabaseServerClient: jest.fn() }));

jest.mock("@/shared/lib/logging/pino", () => ({ recordOperationEvent: jest.fn() }));

jest.mock("@/shared/lib/openai/server", () => ({ getOpenAITTSModel: () => "tts-test" }));

jest.mock("@/shared/lib/tts/server", () => ({
  OpenAITTSProvider: jest.fn().mockImplementation(() => ({
    speak: jest.fn(async () => ({
      audio: new Uint8Array([1, 2, 3]),
      mimeType: "audio/mpeg",
      model: "tts-test",
      provider: "openai",
    })),
  })),
}));

const input = {
  noteId: "00000000-0000-4000-8000-000000000001",
  sentenceId: "source",
  noteVersion: 1,
};

const note: GrammarNote = {
  id: input.noteId,
  ownerId: "owner",
  version: 1,
  createdAt: "",
  updatedAt: "",
  source: {
    sentence: "She is not a teacher but a doctor.",
    learningNote: "not A but B",
    revision: 0,
  },
  metadata: { source: "ai", sourceRevision: 0, title: "대조", tags: [], grammarKey: null },
  analysis: createGrammarAnalysis(),
  examples: [],
};

async function dependencies() {
  const { createSupabaseServerClient } = await import("@/shared/lib/supabase/server");
  const { GrammarNoteRepository } = await import("@/entities/grammar-note");
  const { GrammarSessionRepository } = await import("@/entities/grammar-session");
  const { OpenAITTSProvider } = await import("@/shared/lib/tts/server");
  const { requestGrammarAudio } =
    await import("@/features/grammar-audio/services/actions/requestGrammarAudio");
  const getUser = jest.fn(async () => ({ data: { user: { id: "audio-owner" } }, error: null }));
  const rpc = jest.fn(async () => ({ data: "allowed", error: null }));

  jest
    .mocked(createSupabaseServerClient)
    .mockResolvedValue({ auth: { getUser }, rpc } as unknown as Awaited<
      ReturnType<typeof createSupabaseServerClient>
    >);
  const findById = jest.spyOn(GrammarNoteRepository.prototype, "findById").mockResolvedValue(note);
  const findSession = jest
    .spyOn(GrammarSessionRepository.prototype, "findById")
    .mockResolvedValue(recallSession());

  return { requestGrammarAudio, getUser, rpc, findById, findSession, OpenAITTSProvider };
}

describe("authenticated saved sentence audio action", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("rejects unauthenticated requests before loading notes or spending quota", async () => {
    const deps = await dependencies();

    deps.getUser.mockResolvedValueOnce({ data: { user: null }, error: null } as unknown as Awaited<
      ReturnType<typeof deps.getUser>
    >);
    expect(await deps.requestGrammarAudio(input)).toEqual({ ok: false, code: "UNAUTHORIZED" });
    expect(deps.findById).not.toHaveBeenCalled();
    expect(deps.rpc).not.toHaveBeenCalled();
    expect(deps.OpenAITTSProvider).not.toHaveBeenCalled();
  });

  it("rejects unowned notes and stale revisions before quota or provider", async () => {
    const deps = await dependencies();

    deps.findById.mockResolvedValueOnce(null);
    expect((await deps.requestGrammarAudio(input)).ok).toBe(false);
    expect((await deps.requestGrammarAudio({ ...input, noteVersion: 2 })).ok).toBe(false);
    expect(deps.rpc).not.toHaveBeenCalled();
    expect(deps.OpenAITTSProvider).not.toHaveBeenCalled();
  });

  it("rejects arbitrary client text and exhausted quota without generating", async () => {
    const deps = await dependencies();

    expect((await deps.requestGrammarAudio({ ...input, text: "untrusted" })).ok).toBe(false);
    deps.rpc.mockResolvedValueOnce({ data: "rate_limited", error: null });
    expect((await deps.requestGrammarAudio(input)).ok).toBe(false);
    expect(deps.OpenAITTSProvider).not.toHaveBeenCalled();
  });

  it.each([
    ["not_invited", "NOT_INVITED"],
    ["rate_limited", "RATE_LIMITED"],
    ["unexpected", "GENERATION_FAILED"],
  ])("returns %s as a code without spending provider cost", async (permission, code) => {
    const deps = await dependencies();

    deps.rpc.mockResolvedValueOnce({ data: permission, error: null });
    expect(await deps.requestGrammarAudio(input)).toEqual({ ok: false, code });
    expect(deps.OpenAITTSProvider).not.toHaveBeenCalled();
  });

  it("reuses authenticated content cache and sends only stored text to TTS", async () => {
    const deps = await dependencies();
    const first = await deps.requestGrammarAudio(input);
    const second = await deps.requestGrammarAudio(input);

    expect(first.ok).toBe(true);
    expect(second).toEqual(first);
    expect(deps.findById).toHaveBeenCalledTimes(2);
    expect(deps.rpc).toHaveBeenCalledTimes(1);
    expect(deps.rpc).toHaveBeenCalledWith("consume_ai_request", { p_operation: "tts" });
    const instance = jest.mocked(deps.OpenAITTSProvider).mock.results[0].value as Pick<
      OpenAITTSProvider,
      "speak"
    >;

    expect(instance.speak).toHaveBeenCalledWith({
      text: note.source.sentence,
      voice: "alloy",
      speed: 1,
    });
  });

  it("plays the frozen recall example without consulting an edited note", async () => {
    const deps = await dependencies();
    const session = recallSession();

    deps.findSession.mockResolvedValue({
      ...session,
      questions: [
        {
          ...session.questions[0],
          id: "example:stored-id",
          sentence: "The frozen sentence remains unchanged.",
        },
      ],
    });
    const result = await deps.requestGrammarAudio({
      sessionId: session.id,
      questionId: "example:stored-id",
    });

    expect(result.ok).toBe(true);
    expect(deps.findById).not.toHaveBeenCalled();
    const instance = jest.mocked(deps.OpenAITTSProvider).mock.results[0].value as Pick<
      OpenAITTSProvider,
      "speak"
    >;

    expect(instance.speak).toHaveBeenCalledWith({
      text: "The frozen sentence remains unchanged.",
      voice: "alloy",
      speed: 1,
    });
  });

  it("rejects exam, unowned sessions and unknown questions before spending quota", async () => {
    const deps = await dependencies();
    const session = recallSession();
    const request = { sessionId: session.id, questionId: "source" };

    deps.findSession.mockResolvedValueOnce({ ...session, mode: "exam" });
    expect((await deps.requestGrammarAudio(request)).ok).toBe(false);
    deps.findSession.mockResolvedValueOnce(null);
    expect((await deps.requestGrammarAudio(request)).ok).toBe(false);
    expect((await deps.requestGrammarAudio({ ...request, questionId: "not-in-session" })).ok).toBe(
      false,
    );
    expect(deps.rpc).not.toHaveBeenCalled();
    expect(deps.OpenAITTSProvider).not.toHaveBeenCalled();
  });
});
