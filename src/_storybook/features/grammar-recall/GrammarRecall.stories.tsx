import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { GrammarRecall } from "@/features/grammar-recall";
import { recallSession } from "@/_tests/features/grammar-recall/fixture";
const meta = {
  title: "Features/Grammar/Recall",
  component: GrammarRecall,
  args: {
    initialSession: recallSession(),
    save: fn(async () => ({
      ok: false as const,
      message: "저장하지 못했습니다. 다시 시도해주세요.",
    })),
    complete: fn(async () => ({ ok: false as const, message: "완료 저장 실패" })),
    onComplete: fn(),
    onExit: fn(),
  },
  beforeEach: () => {
    sessionStorage.clear();
  },
} satisfies Meta<typeof GrammarRecall>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Partial: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText("이다"), "is");
    await userEvent.tab();
    await expect(canvas.getByLabelText("교사가 아니라 의사")).toHaveFocus();
    await userEvent.type(
      canvas.getByLabelText("교사가 아니라 의사"),
      "not a teacher but a doctor.",
    );
    await expect(canvas.queryByText("She is not a teacher but a doctor.")).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "정답 보기" }));
    await waitFor(() =>
      expect(canvas.getByText("She is not a teacher but a doctor.")).toBeVisible(),
    );
  },
};
export const Whole: Story = { args: { initialSession: { ...recallSession(), phase: "whole" } } };
