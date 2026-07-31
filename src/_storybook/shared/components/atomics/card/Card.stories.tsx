import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Card } from "@/shared/components/atomics/card/Card";

const meta = {
  title: "shared/components/atomics/card/Card",
  component: Card,
  globals: {
    backgrounds: { value: "app" },
  },
  argTypes: {
    variant: { control: "select", options: ["raised", "flat"] },
  },
  args: {
    variant: "raised",
    className: "w-75 p-5",
    children: <p className="text-body-3 text-gray-text">콘텐츠 슬롯</p>,
  },
  decorators: [
    (Story) => (
      <div className="p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 기본 컨테이너 — radius 20 + shadow-emphasize */
export const Raised: Story = {};

/** 리스트 행처럼 반복되는 컨테이너 — radius 16, 그림자 없음 */
export const Flat: Story = {
  args: { variant: "flat", className: "w-75 p-4" },
};

export const AllVariants: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-start gap-5">
      <Card {...args} variant="raised" />
      <Card {...args} variant="flat" />
    </div>
  ),
};
