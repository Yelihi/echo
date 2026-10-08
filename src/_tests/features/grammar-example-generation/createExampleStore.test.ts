import { describe, expect, it, jest } from "@jest/globals";
import { createExampleStore } from "@/features/grammar-example-generation/services/createExampleStore";
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
    save: jest
      .fn<GrammarExampleManagerProps["save"]>()
      .mockResolvedValue({ ok: true, data: { ...note, version: 2 } }),
    onUpdated: jest.fn<GrammarExampleManagerProps["onUpdated"]>(),
  };
  const store = createExampleStore(dependencies);

  return { store, ...dependencies };
}

describe("예문 초안 이벤트", () => {
  it("재생성 실패시 기존 예문 수정과 선택을 보존한다", async () => {
    const { store, generate } = setup();

    await store.getState().generate();
    store.getState().change("candidate-0", "sentence", "Edited sentence");
    store.getState().select("candidate-0", true);
    generate.mockResolvedValue({ ok: false, code: "FAILED" });
    await store.getState().generate("candidate-1");
    expect(store.getState().candidates[0].sentence).toBe("Edited sentence");
    expect(store.getState().selected).toEqual(["candidate-0"]);
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
    store.getState().change("candidate-0", "sentence", " ");
    store.getState().select("candidate-0", true);
    await store.getState().save();
    expect(save).not.toHaveBeenCalled();
  });
});
