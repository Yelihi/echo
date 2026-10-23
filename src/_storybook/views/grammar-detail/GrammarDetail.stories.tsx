import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { GrammarDetail } from "@/views/grammar-detail/ui/GrammarDetail";
import { GrammarAnalysisReader } from "@/features/grammar-analysis-edit";
import { createEditorNote } from "@/_tests/features/grammar-note-editor/fixtures";
import { createExampleCandidates } from "@/_tests/features/grammar-example-generation/fixtures";
import { GrammarExamplesSection } from "@/views/grammar-detail/ui/GrammarExamplesSection";

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

export const DirectReading: Story = {
  args: {
    examples: (
      <GrammarExamplesSection
        note={{ ...note, examples: [createExampleCandidates()[0]] }}
        manageButton={null}
        generateAudio={fn()}
        readAudioPreparation={async ({ sentenceIds }) => ({
          ok: true,
          data: sentenceIds.map((sentenceId) => ({ sentenceId, status: "ready" })),
        })}
      />
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("그는 운전사가 아니라 교사입니다.")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "직독직해" }));
    await expect(canvas.getByText("그는 운전사가 아니라 교사입니다")).toBeVisible();
    await expect(canvas.queryByText("그는 운전사가 아니라 교사입니다.")).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "자연스러운 해석" }));
    await expect(canvas.getByText("그는 운전사가 아니라 교사입니다.")).toBeVisible();
  },
};
