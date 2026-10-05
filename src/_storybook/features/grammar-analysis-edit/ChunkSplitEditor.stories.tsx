import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { createGrammarAnalysis } from "@/_tests/fixtures/grammarAnalysis";
import { ChunkSplitEditor } from "@/features/grammar-analysis-edit/ui/ChunkSplitEditor";

const analysis = createGrammarAnalysis();
const meta = {
  title: "features/grammar-analysis-edit/ChunkSplitEditor",
  component: ChunkSplitEditor,
  args: { chunk: analysis.chunks[2], source: analysis.sourceText, onApply: fn() },
} satisfies Meta<typeof ChunkSplitEditor>;
export default meta;
type Story = StoryObj<typeof meta>;
export const PreviewAndSplit: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.selectOptions(canvas.getByLabelText("구간 나누기 위치"), "21");
    await expect(
      canvas.getByText("not a teacher | but a doctor.", { selector: "p" }),
    ).toBeVisible();
    await expect(args.onApply).not.toHaveBeenCalled();
    await userEvent.click(canvas.getByRole("button", { name: "나누기" }));
    await expect(args.onApply).toHaveBeenCalledOnce();
  },
};
