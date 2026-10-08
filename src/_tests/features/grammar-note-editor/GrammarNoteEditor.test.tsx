import { randomUUID } from "node:crypto";
import { describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GrammarNoteEditor, type GrammarNoteEditorProps } from "@/features/grammar-note-editor";
import type { GrammarNotePersistenceErrorCode } from "@/entities/grammar-note";
import { GrammarAnalysisEditor } from "@/features/grammar-analysis-edit";
import { createEditorNote } from "./fixtures";
Object.defineProperty(globalThis.crypto, "randomUUID", { value: randomUUID, configurable: true });
function setup() {
  const note = createEditorNote();
  const save = jest.fn<GrammarNoteEditorProps["save"]>().mockResolvedValue({ ok: true, note });
  render(
    <GrammarNoteEditor
      initialNote={note}
      analyze={async () => ({
        status: "analyzed",
        data: { metadata: note.metadata, analysis: note.analysis },
      })}
      save={save}
      AnalysisEditor={GrammarAnalysisEditor}
      onSaved={() => {}}
      onExit={() => {}}
    />,
  );
  return { user: userEvent.setup(), save, note };
}
describe("분석 초안과 노트 저장 연결", () => {
  it("미적용 풀이가 있으면 저장을 막고 적용 이후 검토를 다시 받는다", async () => {
    const { user, save } = setup();
    await user.click(screen.getByRole("button", { name: "She" }));
    await user.click(screen.getByRole("button", { name: "분석 수정" }));
    await user.clear(screen.getByLabelText("직독직해"));
    await user.type(screen.getByLabelText("직독직해"), "그녀는 새 풀이");
    expect(screen.getByRole("checkbox")).toBeDisabled();
    expect(screen.getByRole("button", { name: "검토 완료 · 노트 저장" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "풀이 적용" }));
    expect(screen.getByRole("checkbox")).toBeEnabled();
    expect(screen.getByRole("checkbox")).not.toBeChecked();
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: "검토 완료 · 노트 저장" }));
    expect(save).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({
          analysis: expect.objectContaining({
            chunks: expect.arrayContaining([
              expect.objectContaining({ id: "c1", literalMeaning: "그녀는 새 풀이" }),
            ]),
          }),
        }),
      }),
    );
  });
  it("미적용 풀이에서 입력으로 돌아가기 전 확인하고 원문은 보존한다", async () => {
    const { user, note } = setup();
    await user.click(screen.getByRole("button", { name: "She" }));
    await user.click(screen.getByRole("button", { name: "분석 수정" }));
    await user.type(screen.getByLabelText("직독직해"), " 수정");
    await user.click(screen.getByRole("button", { name: "이전 · 입력 수정" }));
    expect(screen.getByRole("alertdialog")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "계속 수정" }));
    expect(screen.getByLabelText("직독직해")).toHaveValue("그녀는 수정");
    await user.click(screen.getByRole("button", { name: "이전 · 입력 수정" }));
    await user.click(screen.getByRole("button", { name: "입력으로 돌아가기" }));
    expect(screen.getByLabelText(/영어 문장/)).toHaveValue(note.source.sentence);
  });
});

it.each<[GrammarNotePersistenceErrorCode, string]>([
  ["UNAUTHORIZED", "로그인 후 다시 저장해 주세요."],
  ["VERSION_CONFLICT", "다른 화면에서 노트가 변경되었습니다. 새로고침 후 다시 확인해 주세요."],
  ["PERSISTENCE_FAILED", "저장하지 못했습니다. 입력을 유지했으니 다시 저장해 주세요."],
])("%s 저장 오류의 안내는 UI에서 선택하고 재시도할 내용을 유지한다", async (code, message) => {
  const { user, save } = setup();
  save.mockResolvedValue({ ok: false, code });
  await user.click(screen.getByRole("button", { name: "분석 수정" }));
  await user.type(screen.getByLabelText("직독직해"), " 수정");
  await user.click(screen.getByRole("button", { name: "풀이 적용" }));
  await user.click(screen.getByRole("checkbox"));
  await user.click(screen.getByRole("button", { name: "검토 완료 · 노트 저장" }));
  expect(await screen.findByRole("alert")).toHaveTextContent(message);
  expect(screen.getByLabelText("직독직해")).toHaveValue("그녀는 수정");
  expect(screen.getByRole("button", { name: "검토 완료 · 노트 저장" })).toBeEnabled();
});

it("부모가 다시 렌더링되어도 입력을 유지하고 새 분석 콜백을 호출한다", async () => {
  const note = createEditorNote();
  const original = jest.fn<GrammarNoteEditorProps["analyze"]>();
  const current = jest
    .fn<GrammarNoteEditorProps["analyze"]>()
    .mockResolvedValue({ status: "error", message: "분석 서비스 오류" });
  const props = {
    save: jest.fn<GrammarNoteEditorProps["save"]>(),
    AnalysisEditor: GrammarAnalysisEditor,
    onSaved: jest.fn(),
    onExit: jest.fn(),
  };
  const { rerender } = render(<GrammarNoteEditor {...props} analyze={original} />);
  const user = userEvent.setup();
  await user.type(screen.getByLabelText(/영어 문장/), note.source.sentence);
  await user.type(screen.getByLabelText(/핵심 어법 설명/), note.source.learningNote);
  rerender(<GrammarNoteEditor {...props} analyze={current} />);
  expect(screen.getByLabelText(/영어 문장/)).toHaveValue(note.source.sentence);
  await user.click(screen.getByRole("button", { name: "문장 분석하기" }));
  expect(original).not.toHaveBeenCalled();
  expect(current).toHaveBeenCalledWith(
    expect.objectContaining({
      sentence: note.source.sentence,
      learningNote: note.source.learningNote,
    }),
  );
  expect(await screen.findByRole("alert")).toHaveTextContent("분석 서비스 오류");
});
