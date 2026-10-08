import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { GrammarExamPlayer } from "@/features/grammar-exam/ui/GrammarExamPlayer";
import { GrammarExamResult } from "@/features/grammar-exam/ui/GrammarExamResult";
import { createGrammarExam, createGrammarExamFeedback } from "@/_tests/fixtures/grammarExam";
import type { GrammarExamPlayerProps } from "@/features/grammar-exam/models/interface";

const session = createGrammarExam();

const meta = {
  title: "features/grammar-exam/GrammarExam",
  component: GrammarExamPlayer,
  args: {
    initialSession: session,
    onExit: fn(),
    onCompleted: fn(),
    onSaveAnswers: fn<GrammarExamPlayerProps["onSaveAnswers"]>(async (input) => ({
      ok: true as const,
      data: {
        ...session,
        answers: input.answers,
        questionIndex: input.questionIndex,
        phase: input.phase,
        version: 2,
      },
    })),
    onComplete: fn<GrammarExamPlayerProps["onComplete"]>(async () => ({
      ok: true as const,
      data: { ...session, status: "completed" as const },
    })),
  },
} satisfies Meta<typeof GrammarExamPlayer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ExistingQuestion: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole("button", { name: "다음 문항" })).toBeDisabled();
    await userEvent.type(
      canvas.getByLabelText("영어로 작성해 주세요"),
      "She is not a teacher but a doctor.",
    );
    await userEvent.click(canvas.getByRole("button", { name: "다음 문항" }));
    await expect(canvas.getByText("친구는 가수가 아니라 기술자입니다.")).toBeVisible();
  },
};

export const NovelQuestion: Story = {
  args: { initialSession: createGrammarExam({ questionIndex: 1, phase: "novel" }) },
};

export const SaveFailure: Story = {
  args: {
    onSaveAnswers: fn<GrammarExamPlayerProps["onSaveAnswers"]>(async () => ({
      ok: false as const,
      code: "FAILED" as const,
    })),
  },

  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.type(canvas.getByLabelText("영어로 작성해 주세요"), "My draft");
    await userEvent.click(canvas.getByRole("button", { name: "임시 저장" }));
    await expect(canvas.getByText("저장하지 못했습니다. 다시 시도해 주세요.")).toBeVisible();
    await expect(canvas.getByLabelText("영어로 작성해 주세요")).toHaveValue("My draft");
  },
};

export const CompletedFeedback: Story = {
  render: () => (
    <GrammarExamResult
      session={createGrammarExam({
        status: "completed",
        answers: {
          "existing:source": "She is a doctor, not a teacher.",
          "novel:novel:1": "He is not a singer but an engineer.",
        },
      })}
      initialFeedback={[createGrammarExamFeedback({ answer: "She is a doctor, not a teacher." })]}
      onRequestFeedback={async () => ({ ok: false, code: "FAILED" as const })}
    />
  ),
};
