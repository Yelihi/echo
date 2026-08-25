import type { Meta, StoryObj } from "@storybook/nextjs-vite";

// shared
import { Pagination, PaginationSkeleton } from "@/shared/components/ui/Pagination";

const meta = {
  title: "shared/components/ui/Pagination",
  component: Pagination,
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/role-playing",
        query: { tag: "일상", page: "2" },
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="bg-gray-background p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Pagination>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    page: 2,
    totalPages: 5,
  },
};

export const ManyPages: Story = {
  args: {
    page: 10,
    totalPages: 20,
  },
};

export const FirstPage: Story = {
  args: {
    page: 1,
    totalPages: 8,
  },
};

export const Skeleton: StoryObj = {
  render: () => <PaginationSkeleton />,
};
