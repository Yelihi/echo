import { StrictMode } from "react";
import { describe, it, expect, jest } from "@jest/globals";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { GrammarExamPlayer } from "@/features/grammar-exam/ui/GrammarExamPlayer";
import { GrammarExamResult } from "@/features/grammar-exam/ui/GrammarExamResult";
import { createGrammarExam, createGrammarExamFeedback } from "@/_tests/fixtures/grammarExam";
import type {
  GrammarExamPlayerProps,
  GrammarExamFeedbackResult,
} from "@/features/grammar-exam/models/interface";

function setup(overrides: Partial<GrammarExamPlayerProps> = {}) {
  const session = createGrammarExam();
  const props: GrammarExamPlayerProps = {
    initialSession: session,

    onSaveAnswers: async (input) => ({ ok: true, data: { ...session, ...input, version: 2 } }),

    onComplete: async () => ({ ok: true, data: { ...session, status: "completed" } }),

    onCompleted: jest.fn(),
    onExit: jest.fn(),
    ...overrides,
  };

  render(<GrammarExamPlayer {...props} />);

  return props;
}

describe("Grammar exam UI", () => {
  it("active_exam_does_not_render_reference_or_audio_even_if_supplied", () => {
    const session = createGrammarExam();

    session.questions[0].sentence = "secret English answer";
    setup({ initialSession: session });
    expect(screen.queryByText("secret English answer")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /듣기|재생/ })).not.toBeInTheDocument();
  });

  it("failed_save_keeps_user_draft_and_question", async () => {
    setup({ onSaveAnswers: async () => ({ ok: false, code: "FAILED" as const }) });
    fireEvent.change(screen.getByLabelText("영어로 작성해 주세요"), {
      target: { value: "My draft" },
    });
    fireEvent.click(screen.getByRole("button", { name: "다음 문항" }));
    await screen.findByText("시험을 처리하지 못했습니다. 입력을 유지한 채 다시 시도해 주세요.");
    expect(screen.getByLabelText("영어로 작성해 주세요")).toHaveValue("My draft");
    expect(screen.getByText("1 / 2")).toBeInTheDocument();
  });

  it("completion_failure_can_retry_same_session_without_losing_answer", async () => {
    const session = createGrammarExam({
      questionIndex: 1,
      phase: "novel",
      answers: { "existing:source": "previous" },
    });
    let attempt = 0;
    const onCompleted = jest.fn();

    setup({
      initialSession: session,

      onSaveAnswers: async (input) => ({ ok: true, data: { ...session, ...input, version: 2 } }),

      onComplete: async () =>
        attempt++ === 0
          ? { ok: false, code: "FAILED" as const }
          : { ok: true, data: { ...session, status: "completed" } },

      onCompleted,
    });
    fireEvent.change(screen.getByLabelText("영어로 작성해 주세요"), {
      target: { value: "He is an engineer." },
    });
    fireEvent.click(screen.getByRole("button", { name: "시험 완료" }));
    await screen.findByText("시험을 처리하지 못했습니다. 입력을 유지한 채 다시 시도해 주세요.");
    expect(onCompleted).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "시험 완료" }));
    await waitFor(() => expect(onCompleted).toHaveBeenCalledTimes(1));
  });

  it("back_navigation_requires_confirmation", async () => {
    const { onExit } = setup();

    fireEvent.click(screen.getByRole("button", { name: "← 노트로 돌아가기" }));
    expect(onExit).not.toHaveBeenCalled();
    fireEvent.click(await screen.findByRole("button", { name: "나가기" }));
    expect(onExit).toHaveBeenCalledTimes(1);
  });

  it("feedback_failure_is_isolated_and_retry_does_not_replace_answer", async () => {
    const session = createGrammarExam({
      status: "completed",
      answers: { "existing:source": "My own sentence", "novel:novel:1": "My second sentence" },
    });
    let attempt = 0;
    const request = jest
      .fn<() => Promise<GrammarExamFeedbackResult>>()
      .mockImplementation(async () =>
        attempt++ === 0
          ? { ok: false, code: "FAILED" as const }
          : { ok: true, data: createGrammarExamFeedback() },
      );

    render(<GrammarExamResult session={session} onRequestFeedback={request} />);
    fireEvent.click(screen.getAllByRole("button", { name: "피드백 받기" })[0]);
    await screen.findByRole("alert");
    expect(screen.getByText("My second sentence")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "피드백 다시 받기" }));
    await screen.findByText("잘 작성했어요");
    expect(screen.getByText("My own sentence")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "피드백 받기" })).toHaveLength(1);
  });

  it("fresh_completion_requests_sequentially_once_under_strict_mode_and_keeps_partial_success", async () => {
    const session = createGrammarExam({
      status: "completed",
      answers: { "existing:source": "answer", "novel:novel:1": "another" },
    });
    let resolveFirst: (result: GrammarExamFeedbackResult) => void = () => {};
    const first = new Promise<GrammarExamFeedbackResult>((resolve) => {
      resolveFirst = resolve;
    });
    const request = jest
      .fn<NonNullable<Parameters<typeof GrammarExamResult>[0]["onRequestFeedback"]>>()
      .mockImplementationOnce(() => first)
      .mockResolvedValueOnce({ ok: false, code: "FAILED" as const });

    render(
      <StrictMode>
        <GrammarExamResult session={session} autoRequest onRequestFeedback={request} />
      </StrictMode>,
    );
    await waitFor(() => expect(request).toHaveBeenCalledTimes(1));
    resolveFirst({ ok: true, data: createGrammarExamFeedback() });
    await screen.findByText("시험을 처리하지 못했습니다. 입력을 유지한 채 다시 시도해 주세요.");
    expect(request).toHaveBeenCalledTimes(2);
    expect(screen.getByText("잘 작성했어요")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "피드백 다시 받기" })).toBeEnabled();
  });

  it("history_mount_does_not_trigger_paid_feedback_and_cached_initial_items_are_skipped", async () => {
    const request = jest
      .fn<NonNullable<Parameters<typeof GrammarExamResult>[0]["onRequestFeedback"]>>()
      .mockResolvedValue({ ok: false, code: "FAILED" as const });
    const session = createGrammarExam({ status: "completed" });
    const view = render(<GrammarExamResult session={session} onRequestFeedback={request} />);

    expect(request).not.toHaveBeenCalled();
    view.rerender(
      <GrammarExamResult
        session={session}
        initialFeedback={[createGrammarExamFeedback()]}
        autoRequest
        onRequestFeedback={request}
      />,
    );
    await waitFor(() => expect(request).toHaveBeenCalledTimes(1));
    expect(request).toHaveBeenCalledWith({ sessionId: session.id, questionId: "novel:1" });
  });

  it("unsaved_exam_input_blocks_refresh_until_persisted", async () => {
    setup();
    fireEvent.change(screen.getByLabelText("영어로 작성해 주세요"), {
      target: { value: "Unsaved draft" },
    });
    const unsaved = new Event("beforeunload", { cancelable: true });

    window.dispatchEvent(unsaved);
    expect(unsaved.defaultPrevented).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "임시 저장" }));
    await screen.findByText("답안을 임시 저장했습니다.");
    const saved = new Event("beforeunload", { cancelable: true });

    window.dispatchEvent(saved);
    expect(saved.defaultPrevented).toBe(false);
  });
});

it("keeps drafts on same-session rerender and isolates a different exam", () => {
  const session = createGrammarExam();
  const props: GrammarExamPlayerProps = {
    initialSession: session,
    onSaveAnswers: jest.fn<GrammarExamPlayerProps["onSaveAnswers"]>(),
    onComplete: jest.fn<GrammarExamPlayerProps["onComplete"]>(),
    onCompleted: jest.fn(),
    onExit: jest.fn(),
  };
  const { rerender } = render(<GrammarExamPlayer {...props} />);

  fireEvent.change(screen.getByLabelText("영어로 작성해 주세요"), { target: { value: "Draft" } });
  rerender(<GrammarExamPlayer {...props} initialSession={{ ...session, version: 2 }} />);
  expect(screen.getByLabelText("영어로 작성해 주세요")).toHaveValue("Draft");
  rerender(<GrammarExamPlayer {...props} initialSession={{ ...session, id: "another-exam" }} />);
  expect(screen.getByLabelText("영어로 작성해 주세요")).toHaveValue("");
});
