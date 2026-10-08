import { describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GrammarAnalysisEditor } from "@/features/grammar-analysis-edit";
import { createGrammarAnalysis } from "@/_tests/fixtures/grammarAnalysis";

describe("grammar analysis review below the sentence", () => {
  it("selects a chunk and edits its explanation without losing the source", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<GrammarAnalysisEditor initialAnalysis={createGrammarAnalysis()} onChange={onChange} />);
    await user.click(screen.getByRole("button", { name: "She" }));
    await user.click(screen.getByRole("button", { name: "분석 수정" }));
    await user.clear(screen.getByLabelText("직독직해"));
    await user.type(screen.getByLabelText("직독직해"), "그녀는 주어");
    expect(onChange).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "풀이 적용" }));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceText: createGrammarAnalysis().sourceText,
        reviewStatus: "needs-review",
      }),
    );
  });
  it("keeps an invalid hierarchy draft visible with a recoverable error", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<GrammarAnalysisEditor initialAnalysis={createGrammarAnalysis()} onChange={onChange} />);
    await user.click(screen.getByRole("button", { name: "분석 수정" }));
    await user.click(screen.getByRole("button", { name: "절" }));
    await user.selectOptions(screen.getByLabelText("상위 항목"), "s");
    await user.click(screen.getByRole("button", { name: "문법 수정 적용" }));
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
    await user.selectOptions(screen.getByLabelText("상위 항목"), "");
    await user.click(screen.getByRole("button", { name: "문법 수정 적용" }));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});

it("asks before leaving an unapplied edit and preserves input when continuing", async () => {
  const user = userEvent.setup();
  render(<GrammarAnalysisEditor initialAnalysis={createGrammarAnalysis()} onChange={jest.fn()} />);
  await user.click(screen.getByRole("button", { name: "She" }));
  await user.click(screen.getByRole("button", { name: "분석 수정" }));
  await user.type(screen.getByLabelText("직독직해"), " 수정");
  await user.click(screen.getByRole("button", { name: "동사" }));
  expect(screen.getByRole("alertdialog")).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "계속 편집" }));
  expect(screen.getByLabelText("직독직해")).toHaveValue("그녀는 수정");
  await user.click(screen.getByRole("button", { name: "동사" }));
  await user.click(screen.getByRole("button", { name: "수정 버리기" }));
  expect(screen.queryByLabelText("직독직해")).not.toBeInTheDocument();
});

it("shows AI chunks for reading and keeps correction controls behind edit mode", async () => {
  const user = userEvent.setup();
  const onChange = jest.fn();
  render(<GrammarAnalysisEditor initialAnalysis={createGrammarAnalysis()} onChange={onChange} />);
  expect(screen.queryByRole("button", { name: "절" })).not.toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "She" }));
  expect(screen.getByRole("heading", { name: "그녀는" })).toBeInTheDocument();
  expect(screen.getByText("주어")).toBeInTheDocument();
  expect(screen.queryByLabelText("직독직해")).not.toBeInTheDocument();
  await user.keyboard("{Escape}");
  expect(screen.getByRole("button", { name: "She" })).toHaveFocus();
  expect(screen.getByRole("button", { name: "She" })).toHaveAttribute("aria-pressed", "false");
  expect(onChange).not.toHaveBeenCalled();
});

it("guards returning to reading and restores the selected chunk after discarding edits", async () => {
  const user = userEvent.setup();
  const onChange = jest.fn();
  render(<GrammarAnalysisEditor initialAnalysis={createGrammarAnalysis()} onChange={onChange} />);
  await user.click(screen.getByRole("button", { name: "She" }));
  await user.click(screen.getByRole("button", { name: "분석 수정" }));
  await user.type(screen.getByLabelText("직독직해"), " 수정");
  await user.keyboard("{Escape}");
  expect(screen.getByRole("alertdialog")).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "계속 편집" }));
  expect(screen.getByLabelText("직독직해")).toHaveValue("그녀는 수정");
  await user.click(screen.getByRole("button", { name: "읽기로 돌아가기" }));
  await user.click(screen.getByRole("button", { name: "수정 버리기" }));
  expect(screen.getByRole("heading", { name: "그녀는" })).toBeInTheDocument();
  expect(screen.queryByLabelText("직독직해")).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "절" })).not.toBeInTheDocument();
  expect(onChange).not.toHaveBeenCalled();
});

it("isolates selection and edits between mounted editors", async () => {
  const user = userEvent.setup();
  const firstChange = jest.fn();
  const secondChange = jest.fn();
  render(
    <>
      <section aria-label="첫 번째 노트">
        <GrammarAnalysisEditor initialAnalysis={createGrammarAnalysis()} onChange={firstChange} />
      </section>
      <section aria-label="두 번째 노트">
        <GrammarAnalysisEditor initialAnalysis={createGrammarAnalysis()} onChange={secondChange} />
      </section>
    </>,
  );
  const first = within(screen.getByRole("region", { name: "첫 번째 노트" }));
  const second = within(screen.getByRole("region", { name: "두 번째 노트" }));
  await user.click(first.getByRole("button", { name: "She" }));
  expect(second.getByRole("button", { name: "She" })).toHaveAttribute("aria-pressed", "false");
  await user.click(first.getByRole("button", { name: "분석 수정" }));
  await user.type(first.getByLabelText("직독직해"), " 수정");
  await user.click(first.getByRole("button", { name: "풀이 적용" }));
  expect(firstChange).toHaveBeenCalledTimes(1);
  expect(secondChange).not.toHaveBeenCalled();
  expect(second.queryByLabelText("직독직해")).not.toBeInTheDocument();
});

it("preserves drafts on parent rerender and notifies the current callback", async () => {
  const user = userEvent.setup();
  const original = jest.fn();
  const current = jest.fn();
  const originalDirty = jest.fn();
  const currentDirty = jest.fn();
  const { rerender } = render(
    <GrammarAnalysisEditor
      initialAnalysis={createGrammarAnalysis()}
      onChange={original}
      onDirtyChange={originalDirty}
    />,
  );
  await user.click(screen.getByRole("button", { name: "분석 수정" }));
  await user.type(screen.getByLabelText("직독직해"), " 수정");
  expect(originalDirty.mock.calls).toEqual([[true]]);
  rerender(
    <GrammarAnalysisEditor
      initialAnalysis={createGrammarAnalysis()}
      onChange={current}
      onDirtyChange={currentDirty}
    />,
  );
  expect(screen.getByLabelText("직독직해")).toHaveValue("그녀는 수정");
  await user.click(screen.getByRole("button", { name: "풀이 적용" }));
  expect(original).not.toHaveBeenCalled();
  expect(current).toHaveBeenCalledTimes(1);
  expect(originalDirty.mock.calls).toEqual([[true]]);
  expect(currentDirty.mock.calls).toEqual([[false]]);
});

it("starts a fresh editor when the document key changes", async () => {
  const user = userEvent.setup();
  const onChange = jest.fn();
  const { rerender } = render(
    <GrammarAnalysisEditor
      key="note-1"
      initialAnalysis={createGrammarAnalysis()}
      onChange={onChange}
    />,
  );
  await user.click(screen.getByRole("button", { name: "분석 수정" }));
  await user.type(screen.getByLabelText("직독직해"), " 수정");
  const next = createGrammarAnalysis();
  rerender(
    <GrammarAnalysisEditor
      key="note-2"
      initialAnalysis={{
        ...next,
        chunks: next.chunks.map((c) => ({ ...c, literalMeaning: "새 분석" })),
      }}
      onChange={onChange}
    />,
  );
  expect(screen.queryByLabelText("직독직해")).not.toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "She" }));
  expect(screen.getByRole("heading", { name: "새 분석" })).toBeInTheDocument();
  expect(onChange).not.toHaveBeenCalled();
});

it("keeps the editor draft when Escape dismisses the confirmation dialog", async () => {
  const user = userEvent.setup();
  render(<GrammarAnalysisEditor initialAnalysis={createGrammarAnalysis()} onChange={jest.fn()} />);
  await user.click(screen.getByRole("button", { name: "분석 수정" }));
  await user.type(screen.getByLabelText("직독직해"), " 수정");
  await user.click(screen.getByRole("button", { name: "읽기로 돌아가기" }));
  expect(screen.getByRole("alertdialog")).toBeInTheDocument();
  await user.keyboard("{Escape}");
  expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  expect(screen.getByLabelText("직독직해")).toHaveValue("그녀는 수정");
});

it("applies current text with a boundary edit and keeps input after validation failure", async () => {
  const user = userEvent.setup();
  const onChange = jest.fn();
  render(<GrammarAnalysisEditor initialAnalysis={createGrammarAnalysis()} onChange={onChange} />);
  await user.click(screen.getByRole("button", { name: "분석 수정" }));
  const input = screen.getByLabelText("직독직해");
  // 도메인 길이 제한을 넘는 입력에도 다른 편집 후보를 반영하지 않는다.
  fireEvent.change(input, { target: { value: "x".repeat(4001) } });
  await user.selectOptions(screen.getByLabelText("다음 구간과의 경계"), "3");
  await user.click(screen.getByRole("button", { name: "경계 적용" }));
  expect(screen.getByRole("alert")).toBeInTheDocument();
  expect(input).toHaveValue("x".repeat(4001));
  expect(onChange).not.toHaveBeenCalled();
  await user.clear(input);
  await user.type(input, "고친 뜻");
  await user.click(screen.getByRole("button", { name: "경계 적용" }));
  expect(onChange).toHaveBeenCalledTimes(1);
  expect(onChange).toHaveBeenLastCalledWith(
    expect.objectContaining({
      chunks: expect.arrayContaining([
        expect.objectContaining({
          id: "c1",
          literalMeaning: "고친 뜻",
          range: { start: 0, end: 3 },
        }),
      ]),
    }),
  );
});
