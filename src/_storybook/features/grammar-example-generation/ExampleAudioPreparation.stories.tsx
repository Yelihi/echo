import { QueryProvider } from "@/app/providers/QueryProvider";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, mocked, userEvent, waitFor, within } from "storybook/test";
import { GrammarAudioButton } from "@/features/grammar-audio";
import { ExampleAudioPreparation } from "@/features/grammar-example-generation/ui/ExampleAudioPreparation";
import type { AudioPreparationResult, ExampleAudioCommand } from "@/entities/grammar-audio";
import { ErrorPopupProvider, errorPopupManager } from "@/shared/lib/error-popup";
type Action = (input: ExampleAudioCommand) => Promise<AudioPreparationResult>;
const meta = {
  decorators: [
    (Story) => (
      <QueryProvider>
        <Story />
      </QueryProvider>
    ),
  ],
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

export const QuotaLimited: Story = {
  args: {
    read: fn<Action>(async () => ({
      ok: true,
      data: [{ sentenceId: "example", status: "retryable", code: "RATE_LIMITED" }],
    })),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByText("음성 생성 요청 한도에 도달했어요. 잠시 후 다시 시도해 주세요."),
    ).toBeVisible();
    await expect(canvas.getByRole("button", { name: "음성 준비 재시도" })).toBeEnabled();
    await expect(args.retry).not.toHaveBeenCalled();
  },
};

export const StatusReadFailure: Story = {
  args: {
    read: fn<Action>(async () => ({ ok: false, code: "FAILED", operationId: "audio-read-test" })),
  },
  decorators: [
    (Story) => (
      <>
        <Story />
        <ErrorPopupProvider />
      </>
    ),
  ],
  beforeEach: () => {
    errorPopupManager.close();
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const button = await canvas.findByRole("button", { name: "상태 다시 확인" });
    await expect(body.queryByRole("alertdialog")).not.toBeInTheDocument();
    let complete!: (value: AudioPreparationResult) => void;
    mocked(args.read).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          complete = resolve;
        }),
    );
    await userEvent.click(button);
    await expect(canvas.getByRole("button", { name: "확인 중…" })).toBeDisabled();
    complete({ ok: false, code: "FAILED", operationId: "audio-read-test" });
    const dialog = await body.findByRole("alertdialog");
    await waitFor(() =>
      expect(within(dialog).getByText("음성 상태를 확인하지 못했습니다")).toBeVisible(),
    );
    await expect(within(dialog).getByText(/문의 번호: audio-read-test/)).toBeVisible();
    await userEvent.click(within(dialog).getByRole("button", { name: "확인" }));
    await expect(await canvas.findByRole("button", { name: "상태 다시 확인" })).toBeEnabled();
    await expect(args.retry).not.toHaveBeenCalled();
  },
};

export const ReadyPlayer: Story = {
  args: {
    initial: { sentenceId: "example", status: "ready" },
    read: fn<Action>(async () => ({
      ok: true,
      data: [{ sentenceId: "example", status: "ready" }],
    })),
    children: (
      <GrammarAudioButton
        input={{ noteId: "note", sentenceId: "example", noteVersion: 1 }}
        generate={fn(async () => ({ ok: false as const, code: "GENERATION_FAILED" as const }))}
      />
    ),
  },
};
