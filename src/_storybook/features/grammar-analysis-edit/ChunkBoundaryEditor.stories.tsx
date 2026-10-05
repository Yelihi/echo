import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { createGrammarAnalysis } from "@/_tests/fixtures/grammarAnalysis";
import { ChunkBoundaryEditor } from "@/features/grammar-analysis-edit/ui/ChunkBoundaryEditor";

const analysis = createGrammarAnalysis();
const meta = {
  title: "features/grammar-analysis-edit/ChunkBoundaryEditor",
  component: ChunkBoundaryEditor,
  args: { chunk: analysis.chunks[0], source: analysis.sourceText, nextEnd: 7, onApply: fn() },
} satisfies Meta<typeof ChunkBoundaryEditor>;
export default meta;
type Story = StoryObj<typeof meta>;
export const PreviewAndApply: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.selectOptions(canvas.getByLabelText("다음 구간과의 경계"), "3");
    await expect(canvas.getByText("She", { selector: "p" })).toBeVisible();
    await expect(args.onApply).not.toHaveBeenCalled();
    await userEvent.click(canvas.getByRole("button", { name: "경계 적용" }));
    await expect(args.onApply).toHaveBeenCalledOnce();
  },
};
export const LastChunk: Story = {
  args: { chunk: analysis.chunks[2], nextEnd: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByLabelText("다음 구간과의 경계")).toBeDisabled();
    await expect(canvas.getByRole("button", { name: "경계 적용" })).toBeDisabled();
  },
};
