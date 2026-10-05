import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { GrammarAnalysisEditor } from "@/features/grammar-analysis-edit";
import { createGrammarAnalysis } from "@/_tests/fixtures/grammarAnalysis";

const meta = {
  title: "features/grammar-analysis-edit/GrammarAnalysisEditor",
  component: GrammarAnalysisEditor,
  args: { initialAnalysis: createGrammarAnalysis(), onChange: fn() },
  decorators: [
    (Story) => (
      <div className="mx-auto max-w-4xl bg-practice-canvas p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GrammarAnalysisEditor>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const SelectedChunk: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "She" }));
    await userEvent.click(canvas.getByRole("button", { name: "풀이·구간 편집" }));
    await expect(canvas.getByLabelText("직독직해")).toHaveValue("그녀는");
  },
};
export const BoundaryEditing: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "She" }));
    await userEvent.click(canvas.getByRole("button", { name: "풀이·구간 편집" }));
    const boundary = canvas.getByLabelText("다음 구간과의 경계");
    await userEvent.selectOptions(boundary, "3");
    await userEvent.click(canvas.getByRole("button", { name: "경계 적용" }));
    await expect(args.onChange).toHaveBeenCalled();
    await expect(canvas.queryByRole("alert")).not.toBeInTheDocument();
  },
};
export const HierarchyError: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "절" }));
    await userEvent.click(canvas.getByRole("button", { name: "풀이·구간 편집" }));
    await userEvent.selectOptions(canvas.getByLabelText("상위 항목"), "s");
    await userEvent.click(canvas.getByRole("button", { name: "문법 수정 적용" }));
    await expect(canvas.getByRole("alert")).toBeVisible();
  },
};
export const DiscontinuousConstruction: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "not A but B" }));
    await userEvent.click(canvas.getByRole("button", { name: "풀이·구간 편집" }));
    await expect(canvas.getByLabelText("시작 1")).toHaveValue("7");
    await expect(canvas.getByLabelText("시작 2")).toHaveValue("21");
  },
};
