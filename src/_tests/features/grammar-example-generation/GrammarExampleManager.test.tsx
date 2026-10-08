import { describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  GrammarExampleManager,
  type GrammarExampleManagerProps,
} from "@/features/grammar-example-generation";
import { createEditorNote } from "../grammar-note-editor/fixtures";
import { createExampleCandidates } from "./fixtures";
describe("예문 편집 세션", () => {
  it("같은 노트의 버전 갱신에는 초안을 유지하고 최신 콜백을 쓰며 다른 노트에는 초기화한다", async () => {
    const note = createEditorNote();
    const generate = jest
      .fn<GrammarExampleManagerProps["generate"]>()
      .mockResolvedValue({ ok: true, data: createExampleCandidates() });
    const save = jest.fn<GrammarExampleManagerProps["save"]>();
    const latestSave = jest
      .fn<GrammarExampleManagerProps["save"]>()
      .mockResolvedValue({ ok: false, code: "VERSION_CONFLICT" });
    const props = { note, generate, save, onUpdated: jest.fn() };
    const { rerender } = render(<GrammarExampleManager {...props} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "예문 3개 생성" }));
    fireEvent.change((await screen.findAllByLabelText("영어 예문"))[0], {
      target: { value: "Edited sentence." },
    });
    await user.click(screen.getAllByRole("checkbox")[0]);
    rerender(<GrammarExampleManager {...props} note={{ ...note, version: 2 }} save={latestSave} />);
    expect(screen.getAllByLabelText("영어 예문")[0]).toHaveValue("Edited sentence.");
    await user.click(screen.getByRole("button", { name: "선택한 예문 1개 저장" }));
    expect(save).not.toHaveBeenCalled();
    expect(latestSave).toHaveBeenCalledWith(expect.objectContaining({ expectedVersion: 1 }));
    expect(await screen.findByRole("alert")).toHaveTextContent("노트가 변경되었습니다");
    expect(screen.getAllByRole("checkbox")[0]).toBeChecked();
    rerender(<GrammarExampleManager {...props} note={{ ...note, id: "another-note" }} />);
    expect(screen.queryByLabelText("영어 예문")).not.toBeInTheDocument();
  });
});
