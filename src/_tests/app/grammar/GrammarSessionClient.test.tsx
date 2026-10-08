import { describe, expect, it, jest } from "@jest/globals";
import { render, screen, fireEvent } from "@testing-library/react";
import type { RecallSessionProps } from "@/features/grammar-recall";
import type { GrammarAudioButtonProps } from "@/features/grammar-audio";
import { recallSession } from "@/_tests/features/grammar-recall/fixture";

jest.mock("next/navigation", () => ({ useRouter: jest.fn() }));

jest.mock("@/features/grammar-practice/services/actions/grammarSessionActions", () => ({
  saveGrammarSessionAnswers: jest.fn(),
  completeGrammarSession: jest.fn(),
}));

jest.mock("@/features/grammar-audio/services/actions/requestGrammarAudio", () => ({
  requestGrammarAudio: jest.fn(),
}));

jest.mock("@/features/grammar-recall", () => ({
  RecallSession: ({ initialSession, renderAudio, onExit }: RecallSessionProps) => (
    <>
      <button onClick={onExit}>저장하고 노트로</button>
      {renderAudio?.(initialSession.questions[0])}
    </>
  ),
}));

jest.mock("@/features/grammar-exam", () => ({ GrammarExamPlayer: () => <p>시험</p> }));

jest.mock("@/features/grammar-audio", () => ({
  GrammarAudioButton: ({ input }: GrammarAudioButtonProps) => (
    <p data-testid="sentence-id">
      {"sessionId" in input ? `${input.sessionId}:${input.questionId}` : input.sentenceId}
    </p>
  ),
}));

describe("grammar session composition", () => {
  it("uses the frozen session audio identity and returns to the filtered note", async () => {
    const { GrammarSessionClient } =
      await import("@/app/(protected)/grammar-sessions/_components/GrammarSessionClient");
    const { useRouter } = await import("next/navigation");
    const push = jest.fn();

    jest
      .mocked(useRouter)
      .mockReturnValue({ push, refresh: jest.fn() } as unknown as ReturnType<typeof useRouter>);
    const session = recallSession();

    session.questions[0].id = "example:adopted-example";
    render(<GrammarSessionClient session={session} returnTo="/grammar?q=contrast&page=2" />);
    expect(screen.getByTestId("sentence-id")).toHaveTextContent(
      `${session.id}:example:adopted-example`,
    );
    fireEvent.click(screen.getByRole("button", { name: "저장하고 노트로" }));
    expect(push).toHaveBeenCalledWith(
      `/grammar/${session.noteId}?returnTo=%2Fgrammar%3Fq%3Dcontrast%26page%3D2`,
    );
  });

  it("does not mount an answer audio control during an exam", async () => {
    const { GrammarSessionClient } =
      await import("@/app/(protected)/grammar-sessions/_components/GrammarSessionClient");

    render(<GrammarSessionClient session={{ ...recallSession(), mode: "exam" }} />);
    expect(screen.queryByTestId("sentence-id")).not.toBeInTheDocument();
    expect(screen.getByText("시험")).toBeVisible();
  });
});
