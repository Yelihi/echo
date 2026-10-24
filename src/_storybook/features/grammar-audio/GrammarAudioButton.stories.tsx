import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { GrammarAudioButton } from "@/features/grammar-audio";

const meta = {
  title: "Features/Grammar/Audio",
  component: GrammarAudioButton,
  args: {
    input: { noteId: "note", sentenceId: "source", noteVersion: 1 },
    generate: fn(async () => ({ ok: false as const, code: "GENERATION_FAILED" as const })),
  },
} satisfies Meta<typeof GrammarAudioButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const GenerateFailure: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: "문장 듣기" }));
    await expect(canvas.getByRole("alert")).toHaveTextContent("음성을 생성하지 못했습니다.");
    await userEvent.click(canvas.getByRole("button", { name: "음성 다시 생성" }));
    await expect(args.generate).toHaveBeenCalledTimes(2);
  },
};

export const StoredReadFailure: Story = {
  args: { input: { noteId: "note", sentenceId: "example", noteVersion: 1 } },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "문장 듣기" }));
    await expect(canvas.getByRole("alert")).toHaveTextContent("준비된 음성을 불러오지 못했습니다");
    await userEvent.click(canvas.getByRole("button", { name: "음성 다시 불러오기" }));
    await expect(args.generate).toHaveBeenCalledTimes(2);
  },
};

export const Loading: Story = {
  args: {
    input: { noteId: "note", sentenceId: "example", noteVersion: 1 },
    generate: fn(() => new Promise(() => {})),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "문장 듣기" }));
    await expect(canvas.getByRole("button", { name: "음성 불러오는 중…" })).toBeDisabled();
  },
};
