import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GrammarNotePersistenceError, GrammarNoteRepository } from "@/entities/grammar-note";
import type { createSupabaseServerClient as CreateClient } from "@/shared/lib/supabase/server";
import type { recordOperationEvent as RecordEvent } from "@/shared/lib/logging/pino";
import type { SaveNoteCommand } from "@/features/grammar-note-editor";
async function saveGrammarNote(command: SaveNoteCommand) {
  const action = await import("@/features/grammar-note-editor/services/actions/saveGrammarNote");
  return action.saveGrammarNote(command);
}
let createSupabaseServerClient: typeof CreateClient;
let recordOperationEvent: typeof RecordEvent;
import { createEditorNote } from "./fixtures";
jest.mock("server-only", () => ({}));
jest.mock("@/shared/lib/supabase/server", () => ({ createSupabaseServerClient: jest.fn() }));
jest.mock("@/shared/lib/logging/pino", () => ({ recordOperationEvent: jest.fn() }));
Object.defineProperty(globalThis.crypto, "randomUUID", { value: randomUUID, configurable: true });
function command() {
  const note = createEditorNote();
  return {
    requestId: randomUUID(),
    content: {
      source: note.source,
      metadata: note.metadata,
      analysis: note.analysis,
      examples: [],
    },
  };
}
beforeEach(async () => {
  ({ createSupabaseServerClient } = await import("@/shared/lib/supabase/server"));
  ({ recordOperationEvent } = await import("@/shared/lib/logging/pino"));
  jest.restoreAllMocks();
  jest.clearAllMocks();
  jest.mocked(createSupabaseServerClient).mockResolvedValue({
    auth: { getUser: async () => ({ data: { user: { id: "owner" } }, error: null }) },
  } as never);
});
describe("어법 저장 서버 경계", () => {
  it("인증 실패시 저장소 쓰기를 호출하지 않는다", async () => {
    jest.mocked(createSupabaseServerClient).mockResolvedValue({
      auth: { getUser: async () => ({ data: { user: null }, error: null }) },
    } as never);
    const create = jest.spyOn(GrammarNoteRepository.prototype, "create");
    expect(await saveGrammarNote(command())).toEqual({
      ok: false,
      message: "로그인 후 다시 저장해 주세요.",
    });
    expect(create).not.toHaveBeenCalled();
  });
  it("클라이언트가 미검토 분석을 보내면 저장하지 않는다", async () => {
    const create = jest.spyOn(GrammarNoteRepository.prototype, "create");
    const input = command();
    input.content.analysis = { ...input.content.analysis, reviewStatus: "needs-review" };
    expect((await saveGrammarNote(input)).ok).toBe(false);
    expect(create).not.toHaveBeenCalled();
  });
  it("정상 저장은 동일 요청 ID와 검토 내용을 저장소에 전달한다", async () => {
    const input = command();
    const create = jest
      .spyOn(GrammarNoteRepository.prototype, "create")
      .mockResolvedValue(createEditorNote());
    expect((await saveGrammarNote(input)).ok).toBe(true);
    expect(create).toHaveBeenCalledWith(input);
  });
  it("수정 저장 응답을 잃은 재시도는 이미 저장한 동일 버전을 성공으로 돌려준다", async () => {
    const note = createEditorNote();
    const update = jest
      .spyOn(GrammarNoteRepository.prototype, "update")
      .mockRejectedValue(new GrammarNotePersistenceError("VERSION_CONFLICT"));
    jest
      .spyOn(GrammarNoteRepository.prototype, "findById")
      .mockResolvedValue({ ...note, version: 2 });
    const result = await saveGrammarNote({
      ...command(),
      existing: { id: note.id, expectedVersion: 1 },
    });
    expect(result.ok).toBe(true);
    expect(update).toHaveBeenCalledTimes(1);
  });
  it("내용이 다른 버전 충돌을 성공으로 오인하지 않고 초안 재검토를 요청한다", async () => {
    const note = createEditorNote();
    jest
      .spyOn(GrammarNoteRepository.prototype, "update")
      .mockRejectedValue(new GrammarNotePersistenceError("VERSION_CONFLICT"));
    jest.spyOn(GrammarNoteRepository.prototype, "findById").mockResolvedValue({
      ...note,
      version: 2,
      metadata: { ...note.metadata, title: "다른 제목" },
    });
    const result = await saveGrammarNote({
      ...command(),
      existing: { id: note.id, expectedVersion: 1 },
    });
    expect(result).toEqual({
      ok: false,
      message: "다른 화면에서 노트가 변경되었습니다. 새로고침 후 다시 확인해 주세요.",
    });
  });
  it("실패는 내부 이벤트로 기록하고 원문과 내부 오류를 UI에 노출하지 않는다", async () => {
    jest
      .spyOn(GrammarNoteRepository.prototype, "create")
      .mockRejectedValue(new Error("secret database url"));
    const result = await saveGrammarNote(command());
    expect(JSON.stringify(result)).not.toContain("secret");
    expect(recordOperationEvent).toHaveBeenCalledWith(expect.objectContaining({ phase: "failed" }));
    expect(JSON.stringify(jest.mocked(recordOperationEvent).mock.calls)).not.toContain(
      createEditorNote().source.sentence,
    );
  });
});
