import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import type { GrammarNoteEditorProps } from "@/features/grammar-note-editor";
import { GrammarNoteEditor } from "@/features/grammar-note-editor";
import { GrammarAnalysisEditor } from "@/features/grammar-analysis-edit";
import { createEditorNote } from "@/_tests/features/grammar-note-editor/fixtures";
const note = createEditorNote();
const meta = {
  title: "features/grammar-note-editor/GrammarNoteEditor",
  component: GrammarNoteEditor,
  args: {
    analyze: fn<GrammarNoteEditorProps["analyze"]>(async (source) => ({
      status: "analyzed",
      data: {
        metadata: { ...note.metadata, sourceRevision: source.revision },
        analysis: { ...note.analysis, sourceRevision: source.revision },
      },
    })),
    save: fn<GrammarNoteEditorProps["save"]>(async () => ({ ok: true, note })),
    AnalysisEditor: GrammarAnalysisEditor,
    onSaved: fn(),
    onExit: fn(),
  },
  decorators: [
    (Story) => (
      <div className="mx-auto max-w-4xl bg-practice-canvas p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GrammarNoteEditor>;
export default meta;
type Story = StoryObj<typeof meta>;
export const EmptyInput: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "문장 분석하기" }));
    await expect(canvas.getAllByRole("alert")).toHaveLength(2);
    await expect(canvas.queryByLabelText("제목")).not.toBeInTheDocument();
  },
};
export const ReviewAndSave: Story = {
  args: { initialNote: note },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", { name: "검토 완료 · 노트 저장" })).toBeDisabled();
    await userEvent.click(canvas.getByRole("checkbox"));
    await userEvent.click(canvas.getByRole("button", { name: "검토 완료 · 노트 저장" }));
    await expect(args.onSaved).toHaveBeenCalled();
  },
};
export const SaveFailure: Story = {
  args: {
    initialNote: note,
    save: fn<GrammarNoteEditorProps["save"]>(async () => ({
      ok: false as const,
      message: "노트를 저장하지 못했습니다. 다시 저장해 주세요.",
    })),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("checkbox"));
    await userEvent.click(canvas.getByRole("button", { name: "검토 완료 · 노트 저장" }));
    await expect(await canvas.findByRole("alert")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "이전 · 입력 수정" }));
    await expect(canvas.getByLabelText(/영어 문장/)).toHaveValue(note.source.sentence);
  },
};

export const AnalyzeThenReview: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText(/영어 문장/), note.source.sentence);
    await userEvent.type(canvas.getByLabelText(/핵심 어법 설명/), note.source.learningNote);
    await userEvent.click(canvas.getByRole("button", { name: "문장 분석하기" }));
    await expect(await canvas.findByRole("heading", { name: note.metadata.title })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "이전 · 입력 수정" }));
    await expect(canvas.getByLabelText(/영어 문장/)).toHaveValue(note.source.sentence);
  },
};
