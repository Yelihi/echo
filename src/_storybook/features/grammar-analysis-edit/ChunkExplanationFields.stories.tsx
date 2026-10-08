import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { createGrammarAnalysis } from "@/_tests/fixtures/grammarAnalysis";
import { ChunkExplanationFields } from "@/features/grammar-analysis-edit/ui/ChunkExplanationFields";

const meta = {
  title: "features/grammar-analysis-edit/ChunkExplanationFields",
  component: ChunkExplanationFields,
  args: { chunk: createGrammarAnalysis().chunks[0] },
  decorators: [
    (Story) => (
      <div className="max-w-xl space-y-5">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ChunkExplanationFields>;
export default meta;
type Story = StoryObj<typeof meta>;
export const EditExplanation: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const meaning = canvas.getByLabelText("직독직해");
    await expect(meaning).toHaveValue("그녀는");
    await userEvent.clear(meaning);
    await userEvent.type(meaning, "그녀가");
    await expect(meaning).toHaveValue("그녀가");
    await expect(canvas.getByLabelText("구간 설명")).toHaveValue("주어입니다.");
  },
};
