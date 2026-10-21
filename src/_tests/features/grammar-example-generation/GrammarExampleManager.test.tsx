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
  it("개별 재생성 중 입력과 선택을 잠그고 실패하면 기존 한영 후보를 보존한다", async () => {
    const note = createEditorNote();
    const original = createExampleCandidates();
    let resolve!: (result: Awaited<ReturnType<GrammarExampleManagerProps["generate"]>>) => void;
    const generate = jest
      .fn<GrammarExampleManagerProps["generate"]>()
      .mockResolvedValueOnce({ ok: true, data: original })
      .mockImplementationOnce(
        () =>
          new Promise((done) => {
            resolve = done;
          }),
      );
    render(
      <GrammarExampleManager
        note={note}
        generate={generate}
        regenerateDirectReading={jest.fn<GrammarExampleManagerProps["regenerateDirectReading"]>()}
        save={jest.fn<GrammarExampleManagerProps["save"]>()}
        onUpdated={jest.fn()}
      />,
    );
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "예문 3개 생성" }));
    const english = screen.getAllByLabelText("영어 예문")[0];
    const korean = screen.getAllByLabelText("한국어 뜻")[0];
    await user.click(screen.getAllByRole("button", { name: "이 예문 다시 생성" })[0]);

    expect(english).toBeDisabled();
    expect(korean).toBeDisabled();
    expect(screen.getAllByRole("checkbox")[0]).toBeDisabled();
    expect(screen.getByRole("button", { name: "예문 다시 생성" })).toBeDisabled();

    resolve({ ok: false, code: "GENERATION_FAILED" });
    expect(await screen.findByRole("alert")).toBeVisible();
    expect(english).toHaveValue(original[0].sentence);
    expect(korean).toHaveValue(original[0].translation);
    expect(english).not.toBeDisabled();
  });

  it("영어 문장 수정 후 블록만 재생성해야 저장할 수 있고 수정 문장을 유지한다", async () => {
    const note = createEditorNote();
    const editedSentence = "My edited sentence.";
    const generate = jest
      .fn<GrammarExampleManagerProps["generate"]>()
      .mockResolvedValue({ ok: true, data: createExampleCandidates() });
    const regenerateDirectReading = jest
      .fn<NonNullable<GrammarExampleManagerProps["regenerateDirectReading"]>>()
      .mockResolvedValue({
        ok: true,
        data: [{ start: 0, end: editedSentence.length, korean: "수정된 문장입니다" }],
      });
    const save = jest
      .fn<GrammarExampleManagerProps["save"]>()
      .mockResolvedValue({ ok: true, data: { ...note, version: 2 } });
    render(
      <GrammarExampleManager
        note={note}
        generate={generate}
        regenerateDirectReading={regenerateDirectReading}
        save={save}
        onUpdated={jest.fn()}
      />,
    );
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "예문 3개 생성" }));
    const english = screen.getAllByLabelText("영어 예문")[0];
    await user.clear(english);
    await user.type(english, editedSentence);
    expect(screen.getAllByRole("checkbox")[0]).toBeDisabled();
    expect(screen.getByText(/직독직해를 다시 생성/)).toBeVisible();
    await user.click(screen.getByRole("button", { name: "직독직해 다시 생성" }));

    expect(regenerateDirectReading).toHaveBeenCalledWith({
      noteId: note.id,
      expectedVersion: note.version,
      sentence: editedSentence,
    });
    expect(english).toHaveValue(editedSentence);
    expect(screen.getAllByRole("checkbox")[0]).not.toBeDisabled();
    await user.click(screen.getAllByRole("checkbox")[0]);
    await user.click(screen.getByRole("button", { name: "선택한 예문 1개 저장" }));
    expect(save).toHaveBeenCalledWith(
      expect.objectContaining({
        candidates: [expect.objectContaining({ sentence: editedSentence })],
      }),
    );
  });

  it("블록 재생성 실패 시 수정 문장과 자연 번역을 유지하고 저장을 계속 막는다", async () => {
    const note = createEditorNote();
    const original = createExampleCandidates()[0];
    const generate = jest
      .fn<GrammarExampleManagerProps["generate"]>()
      .mockResolvedValue({ ok: true, data: createExampleCandidates() });
    const regenerateDirectReading = jest
      .fn<GrammarExampleManagerProps["regenerateDirectReading"]>()
      .mockResolvedValue({ ok: false, code: "GENERATION_FAILED" });
    const save = jest.fn<GrammarExampleManagerProps["save"]>();
    render(
      <GrammarExampleManager
        note={note}
        generate={generate}
        regenerateDirectReading={regenerateDirectReading}
        save={save}
        onUpdated={jest.fn()}
      />,
    );
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "예문 3개 생성" }));
    const english = screen.getAllByLabelText("영어 예문")[0];
    await user.clear(english);
    await user.type(english, "My edited sentence.");
    await user.click(screen.getByRole("button", { name: "직독직해 다시 생성" }));

    expect(await screen.findByRole("alert")).toBeVisible();
    expect(english).toHaveValue("My edited sentence.");
    expect(screen.getAllByLabelText("한국어 뜻")[0]).toHaveValue(original.translation);
    expect(screen.getAllByRole("checkbox")[0]).toBeDisabled();
    expect(save).not.toHaveBeenCalled();
  });
  it("같은 노트의 버전 갱신에는 초안을 유지하고 최신 콜백을 쓰며 다른 노트에는 초기화한다", async () => {
    const note = createEditorNote();
    const generate = jest
      .fn<GrammarExampleManagerProps["generate"]>()
      .mockResolvedValue({ ok: true, data: createExampleCandidates() });
    const save = jest.fn<GrammarExampleManagerProps["save"]>();
    const latestSave = jest
      .fn<GrammarExampleManagerProps["save"]>()
      .mockResolvedValue({ ok: false, code: "VERSION_CONFLICT" });
    const props = {
      note,
      generate,
      regenerateDirectReading: jest.fn<GrammarExampleManagerProps["regenerateDirectReading"]>(),
      save,
      onUpdated: jest.fn(),
    };
    const { rerender } = render(<GrammarExampleManager {...props} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "예문 3개 생성" }));
    fireEvent.change((await screen.findAllByLabelText("한국어 뜻"))[0], {
      target: { value: "수정한 뜻입니다." },
    });
    await user.click(screen.getAllByRole("checkbox")[0]);
    rerender(<GrammarExampleManager {...props} note={{ ...note, version: 2 }} save={latestSave} />);
    expect(screen.getAllByLabelText("한국어 뜻")[0]).toHaveValue("수정한 뜻입니다.");
    await user.click(screen.getByRole("button", { name: "선택한 예문 1개 저장" }));
    expect(save).not.toHaveBeenCalled();
    expect(latestSave).toHaveBeenCalledWith(expect.objectContaining({ expectedVersion: 1 }));
    expect(await screen.findByRole("alert")).toHaveTextContent("노트가 변경되었습니다");
    expect(screen.getAllByRole("checkbox")[0]).toBeChecked();
    rerender(<GrammarExampleManager {...props} note={{ ...note, id: "another-note" }} />);
    expect(screen.queryByLabelText("영어 예문")).not.toBeInTheDocument();
  });
});
