import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { GrammarPracticeLauncher } from "@/features/grammar-practice";
const meta = {
  title: "features/grammar-practice/Launcher",
  component: GrammarPracticeLauncher,
  args: {
    noteId: "note",
    activeSessions: { recall: "saved-session" },
    onStart: fn(async () => ({ ok: false as const, message: "잠시 후 다시 시도해 주세요." })),
    onOpen: fn(),
  },
} satisfies Meta<typeof GrammarPracticeLauncher>;
export default meta;
type Story = StoryObj<typeof meta>;
export const ResumeAndRetry: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "암기 연습 이어하기" }));
    await expect(args.onOpen).toHaveBeenCalledWith("saved-session");
    await userEvent.click(canvas.getByRole("button", { name: "어법 시험 새로 시작" }));
    await expect(await canvas.findByRole("alert")).toBeVisible();
  },
};
