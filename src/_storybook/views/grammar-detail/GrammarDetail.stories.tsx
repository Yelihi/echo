import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { GrammarDetail } from "@/views/grammar-detail/ui/GrammarDetail";
import { GrammarAnalysisReader } from "@/features/grammar-analysis-edit";
import { createEditorNote } from "@/_tests/features/grammar-note-editor/fixtures";
const note = createEditorNote();
const meta = {
  title: "views/grammar/NoteDetail",
  component: GrammarDetail,
  args: {
    note,
    backHref: "/grammar?q=contrast&page=2",
    analysis: <GrammarAnalysisReader analysis={note.analysis} />,
    audio: null,
    examples: null,
    history: null,
  },
} satisfies Meta<typeof GrammarDetail>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Reading: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("link", { name: "뒤로가기" })).toHaveAttribute(
      "href",
      "/grammar?q=contrast&page=2",
    );
    await expect(canvas.queryByRole("button", { name: "분석 수정" })).not.toBeInTheDocument();
    const sentence = canvas.getByRole("region", { name: "분석 문장" });
    await userEvent.click(within(sentence).getAllByRole("button")[0]);
    await expect(within(sentence).getAllByRole("button")[0]).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(canvas.getByRole("link", { name: "연습하기" })).toHaveAttribute(
      "href",
      `/grammar/${note.id}/practice?returnTo=%2Fgrammar%3Fq%3Dcontrast%26page%3D2`,
    );
  },
};
