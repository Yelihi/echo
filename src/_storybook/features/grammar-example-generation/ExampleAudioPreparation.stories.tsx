import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { ExampleAudioPreparation } from "@/features/grammar-example-generation/ui/ExampleAudioPreparation";
import type { AudioPreparationResult, ExampleAudioCommand } from "@/entities/grammar-audio";
type Action = (input: ExampleAudioCommand) => Promise<AudioPreparationResult>;
const meta = {
  title: "features/grammar-example-generation/ExampleAudioPreparation",
  component: ExampleAudioPreparation,
  args: {
    noteId: "note",
    sentenceId: "example",
    read: fn<Action>(async () => ({
      ok: true,
      data: [{ sentenceId: "example", status: "queued" }],
    })),
    retry: fn<Action>(async () => ({
      ok: true,
      data: [{ sentenceId: "example", status: "queued" }],
    })),
  },
} satisfies Meta<typeof ExampleAudioPreparation>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Preparing: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("status")).toHaveTextContent("음성을 준비하고 있어요");
    await expect(args.retry).not.toHaveBeenCalled();
  },
};
export const SavedWithAudioFailure: Story = {
  args: {
    read: fn<Action>(async () => ({
      ok: true,
      data: [{ sentenceId: "example", status: "retryable" }],
    })),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const retry = await canvas.findByRole("button", { name: "음성 준비 재시도" });
    await expect(canvas.getByRole("status")).toHaveTextContent("예문은 저장됐어요");
    await userEvent.tab();
    await expect(retry).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(args.retry).toHaveBeenCalledWith({ noteId: "note", sentenceIds: ["example"] });
  },
};
export const Ready: Story = {
  args: {
    read: fn<Action>(async () => ({
      ok: true,
      data: [{ sentenceId: "example", status: "ready" }],
    })),
    children: <button>음성 재생</button>,
  },
  play: async ({ canvasElement, args }) => {
    await expect(
      await within(canvasElement).findByRole("button", { name: "음성 재생" }),
    ).toBeVisible();
    await expect(args.retry).not.toHaveBeenCalled();
  },
};
