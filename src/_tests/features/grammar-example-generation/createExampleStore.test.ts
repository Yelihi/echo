import { afterEach, describe, expect, it, jest } from "@jest/globals";
import { createExampleStore } from "@/features/grammar-example-generation/services/createExampleStore";
import { errorPopupManager, useErrorPopupStore } from "@/shared/lib/error-popup";
import type { GrammarExampleManagerProps } from "@/features/grammar-example-generation";
import { createEditorNote } from "../grammar-note-editor/fixtures";
import { createExampleCandidates } from "./fixtures";

function setup() {
  const note = createEditorNote();
  const dependencies = {
    note,
    generate: jest
      .fn<GrammarExampleManagerProps["generate"]>()
      .mockResolvedValue({ ok: true, data: createExampleCandidates() }),
    regenerateDirectReading: jest
      .fn<GrammarExampleManagerProps["regenerateDirectReading"]>()
      .mockImplementation(async ({ sentence }) => ({
        ok: true,
        data: [{ start: 0, end: sentence.length, korean: "수정한 문장입니다" }],
      })),
    save: jest
      .fn<GrammarExampleManagerProps["save"]>()
      .mockResolvedValue({ ok: true, data: { ...note, version: 2 }, audioPreparation: [] }),
    onUpdated: jest.fn<GrammarExampleManagerProps["onUpdated"]>(),
  };
  const store = createExampleStore(dependencies);

  return { store, ...dependencies };
}

describe("예문 초안 이벤트", () => {
  afterEach(() => errorPopupManager.close());

  it("생성·재생성·저장 실패와 입력 검증 오류를 전역 알림으로 전달한다", async () => {
    const { store, generate, regenerateDirectReading, save } = setup();
    generate.mockResolvedValueOnce({ ok: false, code: "RATE_LIMITED" });
    await store.getState().generate();
    expect(useErrorPopupStore.getState().popup).toEqual(
      expect.objectContaining({ code: "RATE_LIMITED" }),
    );
    errorPopupManager.close();

    generate.mockResolvedValueOnce({ ok: true, data: createExampleCandidates() });
    await store.getState().generate();
    expect(useErrorPopupStore.getState().popup).toBeNull();

    const candidate = store.getState().candidates[0];
    store.getState().startEdit(candidate.id);
    store.getState().change(candidate.id, "sentence", "Updated sentence.");
    regenerateDirectReading.mockResolvedValueOnce({ ok: false, code: "GENERATION_FAILED" });
    await store.getState().regenerateDirectReading(candidate.id);
    expect(useErrorPopupStore.getState().popup?.code).toBe("GENERATION_FAILED");
    errorPopupManager.close();

    store.getState().cancelEdit(candidate.id);
    store.getState().select(candidate.id, true);
    save.mockResolvedValueOnce({ ok: false, code: "VERSION_CONFLICT" });
    await store.getState().save();
    expect(useErrorPopupStore.getState().popup?.code).toBe("VERSION_CONFLICT");
    errorPopupManager.close();

    store.getState().startEdit(candidate.id);
    store.getState().change(candidate.id, "translation", "English only");
    store.getState().finishEdit(candidate.id);
    expect(useErrorPopupStore.getState().popup?.code).toBe("INVALID_SELECTION");
  });
  it("권한 거부 후 수정을 취소해도 거부 사유를 유지하고 원문을 복원한다", async () => {
    const { store, regenerateDirectReading } = setup();
    await store.getState().generate();
    const original = store.getState().candidates[0];
    store.getState().startEdit(original.id);
    store.getState().change(original.id, "sentence", "Edited sentence.");
    regenerateDirectReading.mockResolvedValue({ ok: false, code: "NOT_INVITED" });
    await store.getState().regenerateDirectReading(original.id);
    store.getState().cancelEdit(original.id);
    expect(store.getState().candidates[0]).toEqual(original);
    expect(store.getState().error).toBe("NOT_INVITED");
    store.getState().select(original.id, true);
    expect(store.getState().selected).toEqual([original.id]);
  });

  it("B의 블록 재생성 중 A를 취소해도 B 요청과 결과를 유지한다", async () => {
    const { store, regenerateDirectReading } = setup();
    await store.getState().generate();
    const [originalA, originalB] = store.getState().candidates;
    const editedB = "B's edited sentence.";
    store.getState().startEdit(originalA.id);
    store.getState().change(originalA.id, "sentence", "A's edited sentence.");
    store.getState().startEdit(originalB.id);
    store.getState().change(originalB.id, "sentence", editedB);

    let resolve!: (
      result: Awaited<ReturnType<GrammarExampleManagerProps["regenerateDirectReading"]>>,
    ) => void;
    regenerateDirectReading.mockImplementationOnce(
      () =>
        new Promise((done) => {
          resolve = done;
        }),
    );
    const pending = store.getState().regenerateDirectReading(originalB.id);
    store.getState().cancelEdit(originalA.id);

    expect(store.getState().candidates[0]).toEqual(originalA);
    expect(store.getState().pending).toBe(`blocks:${originalB.id}`);

    const blocks = [{ start: 0, end: editedB.length, korean: "수정한 B 문장" }];
    resolve({ ok: true, data: blocks });
    await pending;
    expect(store.getState().candidates[1]).toEqual(
      expect.objectContaining({ sentence: editedB, directReading: blocks }),
    );
    expect(regenerateDirectReading).toHaveBeenCalledTimes(1);
  });

  it("B 자신의 블록 재생성 중 수정을 취소하면 원문을 복원하고 늦은 응답을 버린다", async () => {
    const { store, regenerateDirectReading } = setup();
    await store.getState().generate();
    const originalB = store.getState().candidates[1];
    store.getState().startEdit(originalB.id);
    store.getState().change(originalB.id, "sentence", "B's edited sentence.");

    let resolve!: (
      result: Awaited<ReturnType<GrammarExampleManagerProps["regenerateDirectReading"]>>,
    ) => void;
    regenerateDirectReading.mockImplementationOnce(
      () =>
        new Promise((done) => {
          resolve = done;
        }),
    );
    const pending = store.getState().regenerateDirectReading(originalB.id);
    store.getState().cancelEdit(originalB.id);

    expect(store.getState().candidates[1]).toEqual(originalB);
    expect(store.getState().pending).toBeNull();

    resolve({
      ok: true,
      data: [{ start: 0, end: "B's edited sentence.".length, korean: "늦은 응답" }],
    });
    await pending;
    expect(store.getState().candidates[1]).toEqual(originalB);
    expect(regenerateDirectReading).toHaveBeenCalledTimes(1);
  });

  it("재생성 실패시 기존 예문 수정은 보존하고 블록 없는 후보의 선택은 막는다", async () => {
    const { store, generate } = setup();

    await store.getState().generate();
    store.getState().startEdit("candidate-0");
    store.getState().change("candidate-0", "sentence", "Edited sentence");
    store.getState().select("candidate-0", true);
    generate.mockResolvedValue({ ok: false, code: "FAILED" });
    await store.getState().generate("candidate-1");
    expect(store.getState().candidates[0].sentence).toBe("Edited sentence");
    expect(store.getState().selected).toEqual([]);
    expect(store.getState().error).toBe("FAILED");
  });

  it("부분 재생성은 다른 수정본을 건드리지 않는다", async () => {
    const { store, generate } = setup();

    await store.getState().generate();
    const preserved = store.getState().candidates[0];

    generate.mockResolvedValue({
      ok: true,
      data: [{ ...createExampleCandidates()[1], id: "replacement" }],
    });
    await store.getState().generate("candidate-1");
    expect(store.getState().candidates[0]).toBe(preserved);
    expect(store.getState().candidates[1].id).toBe("replacement");
  });

  it("진행중 후보 수정 이후 늦게 도착한 생성 결과를 무시한다", async () => {
    const { store, generate } = setup();

    await store.getState().generate();
    store.getState().startEdit("candidate-0");
    let resolve!: (value: Awaited<ReturnType<GrammarExampleManagerProps["generate"]>>) => void;

    generate.mockImplementation(
      () =>
        new Promise((r) => {
          resolve = r;
        }),
    );
    const pending = store.getState().generate("candidate-0");

    store.getState().change("candidate-0", "translation", "수정한 뜻");
    resolve({ ok: true, data: [{ ...createExampleCandidates()[0], id: "old-response" }] });
    await pending;
    expect(store.getState().candidates[0].translation).toBe("수정한 뜻");
  });

  it("돌아간 뒤 늦게 도착한 생성 결과를 표시하지 않는다", async () => {
    const { store, generate } = setup();
    let resolve!: (value: Awaited<ReturnType<GrammarExampleManagerProps["generate"]>>) => void;

    generate.mockImplementation(
      () =>
        new Promise((r) => {
          resolve = r;
        }),
    );
    const pending = store.getState().generate();

    store.getState().discard();
    resolve({ ok: true, data: createExampleCandidates() });
    await pending;
    expect(store.getState().candidates).toEqual([]);
  });

  it("돌아간 뒤 늦게 도착한 생성 오류는 전역 알림을 열지 않는다", async () => {
    const { store, generate } = setup();
    let resolve!: (value: Awaited<ReturnType<GrammarExampleManagerProps["generate"]>>) => void;
    generate.mockImplementation(
      () =>
        new Promise((done) => {
          resolve = done;
        }),
    );
    const pending = store.getState().generate();
    store.getState().discard();
    resolve({ ok: false, code: "GENERATION_FAILED" });
    await pending;
    expect(useErrorPopupStore.getState().popup).toBeNull();
  });

  it("검토한 선택 예문만 저장하고 선택하지 않은 후보는 유지한다", async () => {
    const { store, save } = setup();

    await store.getState().generate();
    store.getState().select("candidate-1", true);
    await store.getState().save();
    expect(save.mock.calls[0][0].candidates).toEqual([createExampleCandidates()[1]]);
    expect(store.getState().candidates.map((c) => c.id)).toEqual(["candidate-0", "candidate-2"]);
    expect(store.getState().note.version).toBe(2);
  });

  it("저장 네트워크 실패시 선택된 수정 후보를 유지한다", async () => {
    const { store, save } = setup();

    await store.getState().generate();
    store.getState().select("candidate-0", true);
    save.mockRejectedValue(new Error("network"));
    await store.getState().save();
    expect(store.getState().selected).toEqual(["candidate-0"]);
    expect(store.getState().candidates).toHaveLength(3);
    expect(store.getState().pending).toBeNull();
  });

  it("필수 후보 내용이 공백이면 저장하지 않는다", async () => {
    const { store, save } = setup();

    await store.getState().generate();
    store.getState().startEdit("candidate-0");
    store.getState().change("candidate-0", "sentence", " ");
    store.getState().select("candidate-0", true);
    await store.getState().save();
    expect(save).not.toHaveBeenCalled();
  });
});
