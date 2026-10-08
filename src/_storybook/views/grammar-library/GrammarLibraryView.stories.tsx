import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { GrammarLibraryView } from "@/views/grammar-library";

const meta = {
  title: "Views/Grammar/Library",
  component: GrammarLibraryView,
  args: { query: "not", data: { items: [], total: 0, page: 3, pageSize: 20 } },
} satisfies Meta<typeof GrammarLibraryView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const SearchContext: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("link", { name: /새 노트 작성/ })).toHaveAttribute(
      "href",
      "/grammar/new?returnTo=%2Fgrammar%3Fq%3Dnot%26page%3D3",
    );
  },
};
