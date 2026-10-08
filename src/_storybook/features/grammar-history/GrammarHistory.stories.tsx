import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { GrammarHistory } from "@/features/grammar-history";
const data = {
  items: [
    {
      id: "session",
      noteId: "note",
      title: "not A but B",
      mode: "recall" as const,
      startedAt: "2026-10-01T15:00:00Z",
      completedAt: "2026-10-01T16:00:00Z",
      questionCount: 4,
    },
  ],
  total: 1,
  page: 1,
  pageSize: 10,
};
const meta = {
  title: "Features/Grammar/History",
  component: GrammarHistory,
  args: { noteId: "note", initialData: data, load: fn(async () => ({ ok: true as const, data })) },
} satisfies Meta<typeof GrammarHistory>;
export default meta;
type Story = StoryObj<typeof GrammarHistory>;
export const Completed: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "연습 기록 전체보기" });
    await userEvent.click(trigger);
    const page = within(canvasElement.ownerDocument.body);
    await expect(await page.findByRole("link", { name: /결과 보기/ })).toHaveAttribute(
      "href",
      "/grammar-sessions/session/result",
    );
    await userEvent.click(page.getByRole("button", { name: "닫기" }));
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};
export const Empty: Story = {
  args: {
    initialData: { items: [], total: 0, page: 1, pageSize: 10 },
    load: fn(async () => ({
      ok: true as const,
      data: { items: [], total: 0, page: 1, pageSize: 10 },
    })),
  },
};
export const Failure: Story = {
  args: { load: fn(async () => ({ ok: false as const, code: "LOAD_FAILED" as const })) },
};
