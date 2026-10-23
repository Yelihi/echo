import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GrammarNoteRepository } from "@/entities/grammar-note";
import { UserProfileRepository } from "@/entities/user-profile";
import type { createSupabaseServerClient as CreateClient } from "@/shared/lib/supabase/server";
import type {
  GenerateExamplesCommand,
  SaveExamplesCommand,
} from "@/features/grammar-example-generation";
import type { requestExampleOutput as RequestOutput } from "@/features/grammar-example-generation/services/server/requestExampleOutput";
import type { requestDirectReadingOutput as RequestDirectReadingOutput } from "@/features/grammar-example-generation/services/server/requestDirectReadingOutput";

let createSupabaseServerClient: typeof CreateClient;

let requestExampleOutput: typeof RequestOutput;
let requestDirectReadingOutput: typeof RequestDirectReadingOutput;

async function requestGrammarExamples(command: GenerateExamplesCommand) {
  const action =
    await import("@/features/grammar-example-generation/services/actions/exampleActions");

  return action.requestGrammarExamples(command);
}

async function saveGrammarExamples(command: SaveExamplesCommand) {
  const action =
    await import("@/features/grammar-example-generation/services/actions/exampleActions");

  return action.saveGrammarExamples(command);
}

async function regenerateGrammarDirectReading(command: {
  noteId: string;
  expectedVersion: number;
  sentence: string;
}) {
  const action =
    await import("@/features/grammar-example-generation/services/actions/exampleActions");
  return action.regenerateGrammarDirectReading(command);
}

import { createEditorNote } from "../grammar-note-editor/fixtures";
import { createExampleCandidates } from "./fixtures";

jest.mock("server-only", () => ({}));
jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));
jest.mock("@/shared/lib/supabase/service-role", () => ({
  getSupabaseServiceRoleClient: jest.fn(() => {
    throw new Error("registration unavailable");
  }),
}));

jest.mock("@/shared/lib/supabase/server", () => ({ createSupabaseServerClient: jest.fn() }));

jest.mock("@/shared/lib/logging/pino", () => ({ recordOperationEvent: jest.fn() }));

jest.mock("@/features/grammar-example-generation/services/server/requestExampleOutput", () => ({
  requestExampleOutput: jest.fn(),
}));
jest.mock(
  "@/features/grammar-example-generation/services/server/requestDirectReadingOutput",
  () => ({
    requestDirectReadingOutput: jest.fn(),
  }),
);

Object.defineProperty(globalThis.crypto, "randomUUID", { value: randomUUID, configurable: true });

const rpc = jest.fn<() => Promise<{ data: string | null; error: Error | null }>>();

beforeEach(async () => {
  ({ createSupabaseServerClient } = await import("@/shared/lib/supabase/server"));
  ({ requestExampleOutput } =
    await import("@/features/grammar-example-generation/services/server/requestExampleOutput"));
  ({ requestDirectReadingOutput } =
    await import("@/features/grammar-example-generation/services/server/requestDirectReadingOutput"));
  jest.restoreAllMocks();
  jest.clearAllMocks();
  rpc.mockResolvedValue({ data: "allowed", error: null });
  jest.spyOn(UserProfileRepository.prototype, "findById").mockResolvedValue(null);
  jest.mocked(createSupabaseServerClient).mockResolvedValue({
    auth: { getUser: async () => ({ data: { user: { id: "owner" } }, error: null }) },
    rpc,
  } as never);
});

describe("예문 서버 액션 권한", () => {
  it("직독직해 재생성은 미인증 접근을 AI 요청 전에 막는다", async () => {
    jest.mocked(createSupabaseServerClient).mockResolvedValue({
      auth: { getUser: async () => ({ data: { user: null }, error: null }) },
    } as never);
    const note = createEditorNote();
    const find = jest.spyOn(GrammarNoteRepository.prototype, "findById");
    const result = await regenerateGrammarDirectReading({
      noteId: note.id,
      expectedVersion: note.version,
      sentence: "My edited sentence.",
    });

    expect(result).toEqual({ ok: false, code: "UNAUTHORIZED" });
    expect(find).not.toHaveBeenCalled();
    expect(rpc).not.toHaveBeenCalled();
    expect(requestDirectReadingOutput).not.toHaveBeenCalled();
  });

  it("직독직해 재생성은 소유 노트의 수정 문장만 AI에 보내고 한도를 적용한다", async () => {
    const note = createEditorNote();
    const sentence = "My edited sentence.";
    const blocks = [{ start: 0, end: sentence.length, korean: "내가 수정한 문장입니다" }];
    jest.spyOn(GrammarNoteRepository.prototype, "findById").mockResolvedValue(note);
    jest.mocked(requestDirectReadingOutput).mockResolvedValue({ directReading: blocks });

    expect(
      await regenerateGrammarDirectReading({
        noteId: note.id,
        expectedVersion: note.version,
        sentence,
      }),
    ).toEqual({ ok: true, data: blocks });
    expect(requestDirectReadingOutput).toHaveBeenCalledWith(note, sentence);
    expect(rpc).toHaveBeenCalledTimes(1);

    jest.mocked(requestDirectReadingOutput).mockClear();
    expect(
      (
        await regenerateGrammarDirectReading({
          noteId: note.id,
          expectedVersion: note.version + 1,
          sentence,
        })
      ).ok,
    ).toBe(false);
    expect(requestDirectReadingOutput).not.toHaveBeenCalled();
  });
  it("비로그인 생성과 저장은 조회나 유료 호출 전에 차단한다", async () => {
    jest.mocked(createSupabaseServerClient).mockResolvedValue({
      auth: { getUser: async () => ({ data: { user: null }, error: null }) },
    } as never);
    const find = jest.spyOn(GrammarNoteRepository.prototype, "findById");
    const note = createEditorNote();
    const generation = await requestGrammarExamples({
      noteId: note.id,
      expectedVersion: 1,
      count: 3,
    });
    const saving = await saveGrammarExamples({
      noteId: note.id,
      expectedVersion: 1,
      candidates: createExampleCandidates(),
    });

    expect(generation.ok).toBe(false);
    expect(saving.ok).toBe(false);
    expect(find).not.toHaveBeenCalled();
    expect(requestExampleOutput).not.toHaveBeenCalled();
  });

  it.each([
    ["not_invited", "NOT_INVITED"],
    ["rate_limited", "RATE_LIMITED"],
    ["unexpected", "FAILED"],
  ])("권한 %s이면 AI를 실행하지 않는다", async (permission, code) => {
    jest.spyOn(GrammarNoteRepository.prototype, "findById").mockResolvedValue(createEditorNote());
    rpc.mockResolvedValue({ data: permission, error: null });
    const result = await requestGrammarExamples({
      noteId: createEditorNote().id,
      expectedVersion: 1,
      count: 3,
    });

    expect(result).toEqual({ ok: false, code });
    expect(requestExampleOutput).not.toHaveBeenCalled();
  });

  it("한도 조회 실패를 허용으로 처리하지 않는다", async () => {
    jest.spyOn(GrammarNoteRepository.prototype, "findById").mockResolvedValue(createEditorNote());
    rpc.mockResolvedValue({ data: null, error: new Error("network") });
    expect(
      (
        await requestGrammarExamples({
          noteId: createEditorNote().id,
          expectedVersion: 1,
          count: 3,
        })
      ).ok,
    ).toBe(false);
    expect(requestExampleOutput).not.toHaveBeenCalled();
  });

  it("프로필이 없으면 기본 난이도 2로 예문을 생성한다", async () => {
    const note = createEditorNote();
    jest.spyOn(GrammarNoteRepository.prototype, "findById").mockResolvedValue(note);
    jest.mocked(requestExampleOutput).mockResolvedValue({
      examples: createExampleCandidates().map(
        ({ sentence, translation, targetExplanation, directReading }) => ({
          sentence,
          translation,
          targetExplanation,
          directReading,
        }),
      ),
    });

    const result = await requestGrammarExamples({ noteId: note.id, expectedVersion: 1, count: 3 });

    expect(result.ok).toBe(true);
    expect(requestExampleOutput).toHaveBeenCalledWith(note, 3, 2);
  });

  it("저장된 난이도를 읽어 AI에 전달하며 조회 실패 시 한도를 소비하지 않는다", async () => {
    const note = createEditorNote();
    jest.spyOn(GrammarNoteRepository.prototype, "findById").mockResolvedValue(note);
    const profile = jest.spyOn(UserProfileRepository.prototype, "findById");
    profile.mockResolvedValueOnce({
      id: "owner",
      displayName: "Yeli",
      exampleDifficulty: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);
    jest.mocked(requestExampleOutput).mockResolvedValue({
      examples: createExampleCandidates().map(
        ({ sentence, translation, targetExplanation, directReading }) => ({
          sentence,
          translation,
          targetExplanation,
          directReading,
        }),
      ),
    });

    const result = await requestGrammarExamples({ noteId: note.id, expectedVersion: 1, count: 3 });
    expect(result.ok).toBe(true);
    expect(requestExampleOutput).toHaveBeenCalledWith(note, 3, 3);

    rpc.mockClear();
    jest.mocked(requestExampleOutput).mockClear();
    profile.mockRejectedValueOnce(new Error("profile unavailable"));
    expect(
      (await requestGrammarExamples({ noteId: note.id, expectedVersion: 1, count: 3 })).ok,
    ).toBe(false);
    expect(rpc).not.toHaveBeenCalled();
    expect(requestExampleOutput).not.toHaveBeenCalled();
  });

  it("선택 저장에는 AI 비용을 소비하지 않는다", async () => {
    const note = createEditorNote();

    jest.spyOn(GrammarNoteRepository.prototype, "findById").mockResolvedValue(note);
    jest
      .spyOn(GrammarNoteRepository.prototype, "update")
      .mockResolvedValue({ ...note, version: 2 });
    expect(
      (
        await saveGrammarExamples({
          noteId: note.id,
          expectedVersion: 1,
          candidates: createExampleCandidates(),
        })
      ).ok,
    ).toBe(true);
    expect(rpc).not.toHaveBeenCalled();
    expect(requestExampleOutput).not.toHaveBeenCalled();
  });
  it("a1-register: 음성 등록 실패에도 저장 결과와 명시적 재시도 대상을 보존한다", async () => {
    const note = createEditorNote();
    const candidates = createExampleCandidates();
    const saved = {
      ...note,
      version: 2,
      examples: candidates.map((e) => ({ ...e, reviewStatus: "reviewed" as const })),
    };
    jest.spyOn(GrammarNoteRepository.prototype, "findById").mockResolvedValue(note);
    jest.spyOn(GrammarNoteRepository.prototype, "update").mockResolvedValue(saved);
    const result = await saveGrammarExamples({ noteId: note.id, expectedVersion: 1, candidates });
    expect(result).toEqual({
      ok: true,
      data: saved,
      audioPreparation: candidates.map((e) => ({
        sentenceId: e.id,
        status: "retryable",
        code: "REGISTRATION_FAILED",
      })),
    });
  });

  it("a1-cache: 저장 실패 시 등록·무효화 없이 끝나고 성공 이후에만 준비한다", async () => {
    const { revalidatePath } = await import("next/cache");
    const { getSupabaseServiceRoleClient } = await import("@/shared/lib/supabase/service-role");
    const note = createEditorNote();
    jest.spyOn(GrammarNoteRepository.prototype, "findById").mockResolvedValue(note);
    const update = jest
      .spyOn(GrammarNoteRepository.prototype, "update")
      .mockRejectedValueOnce(new Error("DB failed"));
    const command = { noteId: note.id, expectedVersion: 1, candidates: createExampleCandidates() };
    expect((await saveGrammarExamples(command)).ok).toBe(false);
    expect(revalidatePath).not.toHaveBeenCalled();
    expect(getSupabaseServiceRoleClient).not.toHaveBeenCalled();
    update.mockResolvedValueOnce({ ...note, version: 2 });
    const audioRpc = jest.fn<(...args: unknown[]) => Promise<unknown>>().mockResolvedValue({
      data: command.candidates.map((e) => ({ sentenceId: e.id, status: "ready" })),
      error: null,
    });
    jest.mocked(getSupabaseServiceRoleClient).mockReturnValueOnce({ rpc: audioRpc } as never);
    const result = await saveGrammarExamples(command);
    expect(result.ok).toBe(true);
    expect(revalidatePath).toHaveBeenCalledWith(`/grammar/${note.id}`);
    expect(revalidatePath).toHaveBeenCalledWith("/grammar");
    expect(audioRpc).toHaveBeenCalledWith(
      "example_audio_preparation",
      expect.objectContaining({
        p_note_id: note.id,
        p_example_ids: command.candidates.map((e) => e.id),
        p_enqueue: true,
        p_retry: false,
      }),
    );
    expect(rpc).not.toHaveBeenCalled();
  });
});
