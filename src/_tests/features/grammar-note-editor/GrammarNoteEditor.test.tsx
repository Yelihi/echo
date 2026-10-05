import { randomUUID } from "node:crypto";
import { describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GrammarNoteEditor, type GrammarNoteEditorProps } from "@/features/grammar-note-editor";
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
