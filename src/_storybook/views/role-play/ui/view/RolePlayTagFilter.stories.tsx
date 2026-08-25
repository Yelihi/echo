import type { Meta, StoryObj } from "@storybook/nextjs-vite";

// views
import {
  RolePlayTagFilterList,
  RolePlayTagFilterSkeleton,
} from "@/views/role-play/ui/view/RolePlayTagFilter";

const meta = {
  title: "views/role-play/ui/view/RolePlayTagFilter",
  component: RolePlayTagFilterList,
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: { pathname: "/role-playing" },
    },
  },
  decorators: [
    (Story) => (
      <div className="p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RolePlayTagFilterList>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    selectedTags: ["일상"],
    filterTags: [
      { displayName: "일상", normalizedName: "일상" },
      { displayName: "여행", normalizedName: "여행" },
      { displayName: "비즈니스", normalizedName: "비즈니스" },
      { displayName: "초급", normalizedName: "초급" },
    ],
  },
};

export const Skeleton: StoryObj = {
  render: () => <RolePlayTagFilterSkeleton />,
};
