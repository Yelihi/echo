import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { GrammarRecall } from "@/features/grammar-recall";
import type { SaveGrammarAnswersInput } from "@/entities/grammar-session";
import type { RecallActionResult } from "@/features/grammar-recall";
import { recallSession } from "./fixture";
describe("recall workflow", () => {
  beforeEach(() => sessionStorage.clear());
  it("does not expose the whole answer before reveal and keeps typed input after save failure", async () => {
    const session = { ...recallSession(), phase: "whole" as const };
    const save = jest
      .fn<() => Promise<RecallActionResult>>()
      .mockResolvedValue({ ok: false, code: "FAILED" as const });
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
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("연습을 저장하지 못했습니다"),
    );
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
      .mockResolvedValue({ ok: false, code: "FAILED" as const });
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
  it("preserves both phase answers when returning and completes only after saving", async () => {
    const session = recallSession();
    const save = jest
      .fn<(input: SaveGrammarAnswersInput) => Promise<RecallActionResult>>()
      .mockImplementation(async (input) => ({
        ok: true,
        data: {
          ...session,
          answers: input.answers,
          phase: input.phase,
          questionIndex: input.questionIndex,
          version: input.expectedVersion + 1,
        },
      }));
    const completed = {
      ...session,
      status: "completed" as const,
      completedAt: "2026-10-01T01:00:00Z",
    };
    const complete = jest
      .fn<() => Promise<RecallActionResult>>()
      .mockResolvedValue({ ok: true, data: completed });
    const onComplete = jest.fn();
    render(
      <GrammarRecall
        initialSession={session}
        save={save}
        complete={complete}
        onComplete={onComplete}
        onExit={jest.fn()}
      />,
    );
    fireEvent.change(screen.getByLabelText("이다"), { target: { value: "is" } });
    fireEvent.change(screen.getByLabelText("교사가 아니라 의사"), {
      target: { value: "not a teacher but a doctor." },
    });
    fireEvent.click(screen.getByRole("button", { name: "정답 보기" }));
    fireEvent.click(screen.getByRole("radio", { name: "기억했어요" }));
    fireEvent.click(screen.getByRole("button", { name: "다음" }));
    const whole = await screen.findByRole("textbox", { name: "영어 문장을 작성해주세요" });
    fireEvent.change(whole, { target: { value: "She is not a teacher but a doctor." } });
    fireEvent.click(screen.getByRole("button", { name: "이전" }));
    await waitFor(() => expect(screen.getByLabelText("이다")).toHaveValue("is"));
    expect(screen.getByLabelText("교사가 아니라 의사")).toHaveValue("not a teacher but a doctor.");
    fireEvent.click(screen.getByRole("button", { name: "정답 보기" }));
    fireEvent.click(screen.getByRole("button", { name: "다음" }));
    await waitFor(() =>
      expect(screen.getByRole("textbox")).toHaveValue("She is not a teacher but a doctor."),
    );
    fireEvent.click(screen.getByRole("button", { name: "정답 보기" }));
    fireEvent.click(screen.getByRole("button", { name: "연습 완료" }));
    await waitFor(() => expect(onComplete).toHaveBeenCalledWith(completed));
    expect(complete).toHaveBeenCalledTimes(1);
    expect(save.mock.calls.at(-1)?.[0].answers).toEqual(
      expect.objectContaining({ "whole:source": "She is not a teacher but a doctor." }),
    );
  });
});

it("preserves a same-session draft and resets when opening a different session", () => {
  const session = { ...recallSession(), phase: "whole" as const };
  const props = {
    save: jest.fn<() => Promise<RecallActionResult>>(),
    complete: jest.fn<() => Promise<RecallActionResult>>(),
    onComplete: jest.fn(),
    onExit: jest.fn(),
  };
  const { rerender } = render(<GrammarRecall {...props} initialSession={session} />);
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "My draft" } });
  rerender(<GrammarRecall {...props} initialSession={{ ...session, version: 2 }} />);
  expect(screen.getByRole("textbox")).toHaveValue("My draft");
  rerender(<GrammarRecall {...props} initialSession={{ ...session, id: "another-session" }} />);
  expect(screen.getByRole("textbox")).toHaveValue("");
});
