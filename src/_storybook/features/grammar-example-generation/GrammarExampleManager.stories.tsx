import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import {
  GrammarExampleManager,
  type GrammarExampleManagerProps,
} from "@/features/grammar-example-generation";
import { createEditorNote } from "@/_tests/features/grammar-note-editor/fixtures";
import { createExampleCandidates } from "@/_tests/features/grammar-example-generation/fixtures";

const note = createEditorNote();

const meta = {
  title: "features/grammar-example-generation/GrammarExampleManager",
  component: GrammarExampleManager,
  args: {
    note,
    generate: fn<GrammarExampleManagerProps["generate"]>(async (command) => ({
      ok: true,
      data: createExampleCandidates().slice(0, command.count),
    })),
    regenerateDirectReading: fn<GrammarExampleManagerProps["regenerateDirectReading"]>(
      async ({ sentence }) => ({
        ok: true,
        data: [{ start: 0, end: sentence.length, korean: "수정한 문장의 뜻입니다" }],
      }),
    ),
    save: fn<GrammarExampleManagerProps["save"]>(async () => ({
      ok: true,
      data: { ...note, version: 2 },
    })),
    onUpdated: fn(),
    onBack: fn(),
  },
  decorators: [
    (Story) => (
      <div className="mx-auto max-w-4xl bg-practice-canvas p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GrammarExampleManager>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const SelectAndSave: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: "예문 3개 생성" }));
    await expect(await canvas.findAllByRole("checkbox")).toHaveLength(3);
    await userEvent.click(canvas.getAllByRole("checkbox")[0]);
    await userEvent.click(canvas.getByRole("button", { name: "선택한 예문 1개 저장" }));
    await expect(args.onUpdated).toHaveBeenCalled();
    await expect(canvas.getAllByRole("checkbox")).toHaveLength(2);
  },
};

export const Retry: Story = {
  args: {
    generate: fn<GrammarExampleManagerProps["generate"]>(async () => ({
      ok: true,
      data: createExampleCandidates(),
    })),
  },

  play: async ({ canvasElement, args }) => {
    args.generate.mockResolvedValueOnce({
      ok: false,
      code: "FAILED",
    });
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: "예문 3개 생성" }));
    await expect(await canvas.findByRole("alert")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "예문 다시 생성" }));
    await expect(await canvas.findAllByRole("checkbox")).toHaveLength(3);
  },
};

export const EditCandidate: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: "예문 3개 생성" }));
    const input = (await canvas.findAllByLabelText("한국어 뜻"))[0];

    await userEvent.clear(input);
    await userEvent.type(input, "그는 운전사가 아니라 교사입니다.");
    await expect(input).toHaveValue("그는 운전사가 아니라 교사입니다.");
  },
};

export const EditEnglishAndRegenerate: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "예문 3개 생성" }));
    const english = canvas.getAllByLabelText("영어 예문")[0];
    await userEvent.clear(english);
    await userEvent.type(english, "My edited sentence.");
    await expect(canvas.getAllByRole("checkbox")[0]).toBeDisabled();
    await userEvent.click(canvas.getByRole("button", { name: "직독직해 다시 생성" }));
    await expect(args.regenerateDirectReading).toHaveBeenCalledWith(
      expect.objectContaining({ sentence: "My edited sentence." }),
    );
    await expect(canvas.getAllByRole("checkbox")[0]).toBeEnabled();
  },
};
