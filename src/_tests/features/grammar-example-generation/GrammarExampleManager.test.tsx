import { describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  GrammarExampleManager,
  type GrammarExampleManagerProps,
} from "@/features/grammar-example-generation";
import type { ExampleErrorCode } from "@/features/grammar-example-generation/models/errors";
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
    expect(english).toHaveAttribute("readonly");
    await user.click(screen.getAllByRole("button", { name: "이 예문 수정" })[0]);
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
    await user.click(screen.getAllByRole("button", { name: "이 예문 수정" })[0]);
    await user.clear(english);
    await user.type(english, "My edited sentence.");
    await user.click(screen.getByRole("button", { name: "직독직해 다시 생성" }));

    expect(await screen.findByRole("alert")).toBeVisible();
    expect(english).toHaveValue("My edited sentence.");
    expect(screen.getAllByLabelText("한국어 뜻")[0]).toHaveValue(original.translation);
    expect(screen.getAllByRole("checkbox")[0]).toBeDisabled();
    expect(save).not.toHaveBeenCalled();
  });
  it("블록 재생성 실패 후 수정 취소로 원문과 블록을 복원해 저장한다", async () => {
    const note = createEditorNote();
    const original = createExampleCandidates()[0];
    const generate = jest
      .fn<GrammarExampleManagerProps["generate"]>()
      .mockResolvedValue({ ok: true, data: createExampleCandidates() });
    const regenerateDirectReading = jest
      .fn<GrammarExampleManagerProps["regenerateDirectReading"]>()
      .mockResolvedValue({ ok: false, code: "RATE_LIMITED" });
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
    await user.click(screen.getAllByRole("button", { name: "이 예문 수정" })[0]);
    const english = screen.getAllByLabelText("영어 예문")[0];
    expect(screen.getByRole("button", { name: "예문 다시 생성" })).toBeDisabled();
    await user.clear(english);
    await user.type(english, "My edited sentence.");
    await user.click(screen.getByRole("button", { name: "직독직해 다시 생성" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("요청 한도");
    expect(english).toHaveValue("My edited sentence.");
    await user.click(screen.getAllByRole("button", { name: "수정 취소" })[0]);
    expect(english).toHaveValue(original.sentence);
    expect(screen.getByRole("button", { name: "예문 다시 생성" })).toBeEnabled();
    expect(screen.getAllByRole("checkbox")[0]).toBeEnabled();
    await user.click(screen.getAllByRole("checkbox")[0]);
    await user.click(screen.getByRole("button", { name: "선택한 예문 1개 저장" }));
    expect(save).toHaveBeenCalledWith(expect.objectContaining({ candidates: [original] }));
  });

  it("한국어 뜻이 영어뿐이면 수정 완료를 막고 고칠 방법을 안내한다", async () => {
    const generate = jest
      .fn<GrammarExampleManagerProps["generate"]>()
      .mockResolvedValue({ ok: true, data: createExampleCandidates() });
    const save = jest.fn<GrammarExampleManagerProps["save"]>();
    render(
      <GrammarExampleManager
        note={createEditorNote()}
        generate={generate}
        regenerateDirectReading={jest.fn<GrammarExampleManagerProps["regenerateDirectReading"]>()}
        save={save}
        onUpdated={jest.fn()}
      />,
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "예문 3개 생성" }));
    await user.click(screen.getAllByRole("button", { name: "이 예문 수정" })[0]);
    const translation = screen.getAllByLabelText("한국어 뜻")[0];
    await user.clear(translation);
    await user.type(translation, "English only");
    await user.click(screen.getAllByRole("button", { name: "수정 완료" })[0]);
    expect(await screen.findByRole("alert")).toHaveTextContent("한국어로 입력");
    expect(screen.getAllByRole("checkbox")[0]).toBeDisabled();
    expect(save).not.toHaveBeenCalled();
    await user.clear(translation);
    await user.type(translation, "수정한 한국어 뜻입니다.");
    await user.click(screen.getAllByRole("button", { name: "수정 완료" })[0]);
    expect(screen.getAllByRole("checkbox")[0]).toBeEnabled();
  });

  const rejectionCases: [ExampleErrorCode, string, string][] = [
    ["UNAUTHORIZED", "로그인", "로그인 페이지"],
    ["NOT_FOUND", "노트를 찾을 수", "노트 목록"],
    ["VERSION_CONFLICT", "노트가 변경", "새로고침"],
    ["NOT_INVITED", "권한", "노트 목록"],
    ["RATE_LIMITED", "요청 한도", "다시 시도"],
    ["INVALID_INPUT", "유효하지", "입력을 확인"],
    ["IDEMPOTENCY_CONFLICT", "내용이 달라", "새로고침"],
    ["INVALID_RESPONSE", "결과를 확인", "다시 시도"],
    ["PERSISTENCE_FAILED", "노트 정보를", "다시 시도"],
    ["GENERATION_FAILED", "생성에 실패", "수정 취소"],
    ["FAILED", "원인은 확인되지", "다시 시도"],
  ];
  it.each(rejectionCases)(
    "AI 요청 거부 %s의 이유와 다음 행동을 안내한다",
    async (code, reason, next) => {
      const generate = jest
        .fn<GrammarExampleManagerProps["generate"]>()
        .mockResolvedValue({ ok: false, code });
      render(
        <GrammarExampleManager
          note={createEditorNote()}
          generate={generate}
          regenerateDirectReading={jest.fn<GrammarExampleManagerProps["regenerateDirectReading"]>()}
          save={jest.fn<GrammarExampleManagerProps["save"]>()}
          onUpdated={jest.fn()}
        />,
      );
      await userEvent.setup().click(screen.getByRole("button", { name: "예문 3개 생성" }));
      const alert = await screen.findByRole("alert");
      expect(alert).toHaveTextContent(reason);
      expect(alert).toHaveTextContent(next);
      if (
        [
          "UNAUTHORIZED",
          "NOT_FOUND",
          "VERSION_CONFLICT",
          "NOT_INVITED",
          "IDEMPOTENCY_CONFLICT",
        ].includes(code)
      ) {
        expect(screen.getByRole("button", { name: "예문 다시 생성" })).toBeDisabled();
      }
    },
  );
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
    await user.click(screen.getAllByRole("button", { name: "이 예문 수정" })[0]);
    fireEvent.change((await screen.findAllByLabelText("한국어 뜻"))[0], {
      target: { value: "수정한 뜻입니다." },
    });
    await user.click(screen.getAllByRole("button", { name: "수정 완료" })[0]);
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
