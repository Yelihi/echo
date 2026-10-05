import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GrammarNoteRepository } from "@/entities/grammar-note";
import type { createSupabaseServerClient as CreateClient } from "@/shared/lib/supabase/server";
import type {
  GenerateExamplesCommand,
  SaveExamplesCommand,
} from "@/features/grammar-example-generation";
import type { requestExampleOutput as RequestOutput } from "@/features/grammar-example-generation/services/server/requestExampleOutput";
let createSupabaseServerClient: typeof CreateClient;
let requestExampleOutput: typeof RequestOutput;
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
import { createEditorNote } from "../grammar-note-editor/fixtures";
import { createExampleCandidates } from "./fixtures";
jest.mock("server-only", () => ({}));
jest.mock("@/shared/lib/supabase/server", () => ({ createSupabaseServerClient: jest.fn() }));
jest.mock("@/shared/lib/logging/pino", () => ({ recordOperationEvent: jest.fn() }));
jest.mock("@/features/grammar-example-generation/services/server/requestExampleOutput", () => ({
  requestExampleOutput: jest.fn(),
}));
Object.defineProperty(globalThis.crypto, "randomUUID", { value: randomUUID, configurable: true });
const rpc = jest.fn<() => Promise<{ data: string | null; error: Error | null }>>();
beforeEach(async () => {
  ({ createSupabaseServerClient } = await import("@/shared/lib/supabase/server"));
  ({ requestExampleOutput } =
    await import("@/features/grammar-example-generation/services/server/requestExampleOutput"));
  jest.restoreAllMocks();
  jest.clearAllMocks();
  rpc.mockResolvedValue({ data: "allowed", error: null });
  jest.mocked(createSupabaseServerClient).mockResolvedValue({
    auth: { getUser: async () => ({ data: { user: { id: "owner" } }, error: null }) },
    rpc,
  } as never);
});
describe("예문 서버 액션 권한", () => {
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
  it.each(["not_invited", "rate_limited", "unexpected"])(
    "권한 %s이면 AI를 실행하지 않는다",
    async (permission) => {
      jest.spyOn(GrammarNoteRepository.prototype, "findById").mockResolvedValue(createEditorNote());
      rpc.mockResolvedValue({ data: permission, error: null });
      const result = await requestGrammarExamples({
        noteId: createEditorNote().id,
        expectedVersion: 1,
        count: 3,
      });
      expect(result.ok).toBe(false);
      expect(requestExampleOutput).not.toHaveBeenCalled();
    },
  );
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
});
