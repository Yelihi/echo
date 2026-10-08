import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { GrammarNoteList } from "@/views/grammar-library";

const meta = {
  title: "Views/Grammar/Note list",
  component: GrammarNoteList,
  args: { query: "", data: { items: [], total: 0, page: 1, pageSize: 20 } },
} satisfies Meta<typeof GrammarNoteList>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("첫 어법 노트를 만들어보세요")).toBeVisible();
  },
};

export const SearchEmpty: Story = { args: { query: "unknown" } };

export const Notes: Story = {
  args: {
    query: "not",
    data: {
      page: 2,
      pageSize: 20,
      total: 42,
      items: [
        {
          id: "00000000-0000-4000-8000-000000000001",
          ownerId: "00000000-0000-4000-8000-000000000002",
          title: "not A but B",
          sentence: "She is not a teacher but a doctor.",
          tags: ["대조", "보어"],
          version: 1,
          createdAt: "2026-10-01T00:00:00Z",
          updatedAt: "2026-10-01T00:00:00Z",
        },
      ],
    },
  },

  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole("link", { name: /not A but B/ })).toHaveAttribute(
      "href",
      expect.stringContaining("returnTo=%2Fgrammar%3Fq%3Dnot%26page%3D2"),
    );
    await expect(canvas.getByRole("link", { name: "2페이지" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  },
};
