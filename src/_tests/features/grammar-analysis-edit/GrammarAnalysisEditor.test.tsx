import { describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
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
