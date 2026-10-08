import { randomUUID } from "node:crypto";
Object.defineProperty(globalThis.crypto, "randomUUID", { value: randomUUID, configurable: true });
import { describe, expect, it, jest } from "@jest/globals";
import { createEditorStore } from "@/features/grammar-note-editor/services/createEditorStore";
import type {
  EditorAnalysisResult,
  GrammarNoteEditorProps,
} from "@/features/grammar-note-editor/models/interface";
import { createEditorNote } from "./fixtures";
function dependencies() {
  const note = createEditorNote();
  return {
    initialNote: note,
    analyze: jest.fn<GrammarNoteEditorProps["analyze"]>().mockResolvedValue({
      status: "analyzed",
      data: { metadata: note.metadata, analysis: note.analysis },
    }),
    save: jest.fn<GrammarNoteEditorProps["save"]>().mockResolvedValue({ ok: true, note }),
    onSaved: jest.fn<GrammarNoteEditorProps["onSaved"]>(),
  };
}
describe("어법 등록 이벤트", () => {
  it("두 필수 입력이 없으면 분석 요청을 보내지 않는다", async () => {
    const deps = dependencies();
    const store = createEditorStore({ ...deps, initialNote: undefined });
    await store.getState().analyze();
    expect(deps.analyze).not.toHaveBeenCalled();
    expect(store.getState().fieldErrors).toHaveProperty("sentence");
    expect(store.getState().fieldErrors).toHaveProperty("learningNote");
  });
  it("입력을 수정하면 진행 중인 이전 분석을 무시한다", async () => {
    let resolve!: (result: EditorAnalysisResult) => void;
    const deps = dependencies();
    deps.analyze.mockImplementation(
      () =>
        new Promise((r) => {
          resolve = r;
        }),
    );
    const store = createEditorStore(deps);
    const pending = store.getState().analyze();
    store.getState().changeSource("learningNote", "새로운 설명");
    resolve({
      status: "analyzed",
      data: { metadata: deps.initialNote.metadata, analysis: deps.initialNote.analysis },
    });
    await pending;
    expect(store.getState().result).toBeNull();
    expect(store.getState().source.learningNote).toBe("새로운 설명");
  });
  it("분석 취소 후 늦게 도착한 결과로 검토 화면으로 이동하지 않는다", async () => {
    let resolve!: (result: EditorAnalysisResult) => void;
    const deps = dependencies();
    deps.analyze.mockImplementation(
      () =>
        new Promise((r) => {
          resolve = r;
        }),
    );
    const store = createEditorStore(deps);
    const pending = store.getState().analyze();
    store.getState().back();
    resolve({
      status: "analyzed",
      data: { metadata: deps.initialNote.metadata, analysis: deps.initialNote.analysis },
    });
    await pending;
    expect(store.getState().stage).toBe("input");
  });
  it("네트워크 저장 실패 후 재시도에 동일 요청 식별자를 사용한다", async () => {
    const deps = dependencies();
    deps.save.mockRejectedValueOnce(new Error("network"));
    const store = createEditorStore({ ...deps, initialNote: undefined });
    store.setState({
      source: deps.initialNote.source,
      result: {
        status: "analyzed",
        data: { metadata: deps.initialNote.metadata, analysis: deps.initialNote.analysis },
      },
      reviewed: true,
    });
    await store.getState().save();
    expect(store.getState().error).toEqual({ code: "PERSISTENCE_FAILED" });
    await store.getState().save();
    expect(deps.save.mock.calls[0][0].requestId).toBe(deps.save.mock.calls[1][0].requestId);
    expect(deps.onSaved).toHaveBeenCalledTimes(1);
  });
  it("검토를 확인하기 전에는 저장하지 않고 분석 수정 후 확인을 해제한다", async () => {
    const deps = dependencies();
    const store = createEditorStore(deps);
    await store.getState().save();
    expect(deps.save).not.toHaveBeenCalled();
    store.getState().setReviewed(true);
    store.getState().changeAnalysis(deps.initialNote.analysis);
    expect(store.getState().reviewed).toBe(false);
  });
  it("사전 체크 수정 필요는 입력을 유지하고 분석 검토로 넘어가지 않는다", async () => {
    const deps = dependencies();
    deps.analyze.mockResolvedValue({
      status: "needs-input",
      precheck: {
        status: "uncertain",
        sourceRevision: 0,
        issues: [{ field: "learningNote", message: "더 설명해주세요", suggestion: null }],
      },
    });
    const store = createEditorStore(deps);
    await store.getState().analyze();
    expect(store.getState().stage).toBe("input");
    expect(store.getState().source).toEqual(deps.initialNote.source);
  });
  it("원문과 불일치하는 분석은 저장 가능한 결과로 적용하지 않는다", async () => {
    const deps = dependencies();
    deps.analyze.mockResolvedValue({
      status: "analyzed",
      data: {
        ...deps.initialNote,
        analysis: { ...deps.initialNote.analysis, sourceRevision: 999 },
      },
    });
    const store = createEditorStore(deps);
    await store.getState().analyze();
    expect(store.getState().error).toEqual({ code: "ANALYSIS_FAILED" });
  });
  it("편집 저장은 읽은 버전을 전달하고 충돌시 초안을 유지한다", async () => {
    const deps = dependencies();
    deps.save.mockResolvedValue({ ok: false, code: "VERSION_CONFLICT" });
    const store = createEditorStore(deps);
    store.getState().setReviewed(true);
    await store.getState().save();
    expect(deps.save.mock.calls[0][0].existing).toEqual({
      id: deps.initialNote.id,
      expectedVersion: 1,
    });
    expect(store.getState().result).not.toBeNull();
    expect(store.getState().error).toEqual({ code: "VERSION_CONFLICT" });
  });
});
