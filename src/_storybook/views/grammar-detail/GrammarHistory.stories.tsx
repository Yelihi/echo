import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { GrammarHistory } from "@/features/grammar-history";
import type { GrammarHistoryProps } from "@/features/grammar-history";

const data = {
  items: [],
  total: 0,
  page: 1,
  pageSize: 10,
};
const load: GrammarHistoryProps["load"] = async () => ({ ok: true, data });

const meta = {
  title: "views/grammar/History",
  component: GrammarHistory,
  args: { noteId: "preview-note", load },
} satisfies Meta<typeof GrammarHistory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Cached: Story = { args: { initialData: data } };
export const Loading: Story = {
  args: {
    load: () => new Promise((resolve) => setTimeout(() => resolve({ ok: true, data }), 4000)),
  },
};
