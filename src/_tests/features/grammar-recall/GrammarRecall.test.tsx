import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { GrammarRecall } from "@/features/grammar-recall";
import type { RecallActionResult } from "@/features/grammar-recall";
import { recallSession } from "./fixture";
describe("recall workflow", () => {
  beforeEach(() => sessionStorage.clear());
  it("does not expose the whole answer before reveal and keeps typed input after save failure", async () => {
    const session = { ...recallSession(), phase: "whole" as const };
    const save = jest
      .fn<() => Promise<RecallActionResult>>()
      .mockResolvedValue({ ok: false, message: "저장 실패" });
    render(
      <GrammarRecall
        initialSession={session}
        save={save}
        complete={jest.fn<() => Promise<RecallActionResult>>()}
        onComplete={jest.fn()}
        onExit={jest.fn()}
      />,
    );
    expect(screen.queryByText(session.questions[0].sentence!)).not.toBeInTheDocument();
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "My own answer." } });
    fireEvent.click(screen.getByRole("button", { name: "정답 보기" }));
    fireEvent.click(screen.getByRole("radio", { name: "다시 볼게요" }));
    fireEvent.click(screen.getByRole("button", { name: "연습 완료" }));
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("저장 실패"));
    expect(screen.getByRole("textbox")).toHaveValue("My own answer.");
    expect(save).toHaveBeenCalledWith(
      expect.objectContaining({
        answers: expect.objectContaining({ "whole:source": "My own answer." }),
      }),
    );
  });
  it("saves before exiting and remains on page when saving fails", async () => {
    const exit = jest.fn();
    const save = jest
      .fn<() => Promise<RecallActionResult>>()
      .mockResolvedValue({ ok: false, message: "다시 시도" });
    render(
      <GrammarRecall
        initialSession={recallSession()}
        save={save}
        complete={jest.fn<() => Promise<RecallActionResult>>()}
        onComplete={jest.fn()}
        onExit={exit}
      />,
    );
    fireEvent.change(screen.getByLabelText("이다"), { target: { value: "is" } });
    fireEvent.click(screen.getByRole("button", { name: "저장하고 노트로" }));
    await waitFor(() => expect(screen.getByRole("alert")).toBeVisible());
    expect(exit).not.toHaveBeenCalled();
    expect(screen.getByLabelText("이다")).toHaveValue("is");
  });
});
