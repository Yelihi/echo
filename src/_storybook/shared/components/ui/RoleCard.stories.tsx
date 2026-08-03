import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { RoleCard } from "@/shared/components/ui/RoleCard";

const meta = {
  title: "shared/components/ui/RoleCard",
  component: RoleCard,
  globals: {
    backgrounds: { value: "app" },
  },
  argTypes: {
    selected: { control: "boolean" },
    title: { control: "text" },
    description: { control: "text" },
  },
  args: {
    title: "바리스타",
    description: "손님의 주문을 받고 커피를 추천해요",
    selected: false,
  },
  decorators: [
    (Story) => (
      <div className="w-75 p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RoleCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Selected: Story = {
  args: { selected: true },
};

export const AllVariants: Story = {
  render: (args) => (
    <div className="flex flex-col gap-2.5">
      <RoleCard
        {...args}
        title="바리스타"
        description="손님의 주문을 받고 커피를 추천해요"
        selected={false}
      />
      <RoleCard
        {...args}
        title="손님"
        description="원하는 음료를 주문하고 결제해요"
        selected={true}
      />
    </div>
  ),
};
