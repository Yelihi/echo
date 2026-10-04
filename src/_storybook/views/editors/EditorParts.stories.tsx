import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { RolePlayScriptLines } from "@/views/role-play/ui/editor/RolePlayScriptLines";
import { RolePlayScriptCount } from "@/views/role-play/ui/editor/RolePlayScriptCount";
import { MemorizationParagraphItem } from "@/views/memorization/ui/editor/MemorizationParagraphItem";
import { useRolePlayEditorStore } from "@/views/role-play/models/stores/rolePlayEditorStore";
import { useMemorizationEditorStore } from "@/views/memorization/models/stores/memorizationEditorStore";
const meta = {
  title: "views/editors/EditorParts",
  decorators: [
    (Story) => (
      <div className="mx-auto max-w-4xl p-6">
        <Story />
      </div>
    ),
  ],
  parameters: { a11y: { test: "error" } },
  beforeEach: () => {
    useRolePlayEditorStore.getState().reset();
    useMemorizationEditorStore.getState().hydrate({
      title: "Title",
      tags: [],
      rawText: "One. Two.",
      paragraphs: ["One.", "Two."],
      confirmed: false,
    });
    return () => {
      useRolePlayEditorStore.getState().reset();
      useMemorizationEditorStore.getState().reset();
    };
  },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const Script: Story = {
  render: () => (
    <>
      <RolePlayScriptCount />
      <RolePlayScriptLines />
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "상대방 대사" }));
    await userEvent.type(canvas.getByRole("textbox", { name: "1번째 상대방 대사" }), "Hello");
    await expect(canvas.getByText("1개 대사")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "1번째 화자 바꾸기" }));
    await expect(canvas.getByRole("textbox", { name: "1번째 내 대사" })).toHaveValue("Hello");
    await userEvent.click(canvas.getByRole("button", { name: "1번째 대사 삭제" }));
    await expect(canvas.getByText("아직 대사가 없어요")).toBeVisible();
  },
};
export const Paragraph: Story = {
  render: () => <MemorizationParagraphItem index={0} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", { name: "위 문단과 합치기" })).toBeDisabled();
    await userEvent.clear(canvas.getByRole("textbox", { name: "문단 1" }));
    await userEvent.type(canvas.getByRole("textbox", { name: "문단 1" }), "Changed.");
    await expect(useMemorizationEditorStore.getState().draft.paragraphs).toEqual([
      "Changed.",
      "Two.",
    ]);
  },
};
