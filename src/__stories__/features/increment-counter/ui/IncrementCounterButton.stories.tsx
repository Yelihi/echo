import type { Meta, StoryObj } from "@storybook/react";
import { IncrementCounterButton } from "@/features/increment-counter";
import { CounterStatus } from "@/entities/counter";

const meta = {
  title: "features/IncrementCounterButton",
  component: IncrementCounterButton,
  tags: ["autodocs"],
  args: {
    counter: { id: "1", value: 0, status: CounterStatus.ACTIVE },
    onIncrement: () => {},
  },
} satisfies Meta<typeof IncrementCounterButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithHighCount: Story = {
  args: {
    counter: { id: "2", value: 42, status: CounterStatus.ACTIVE },
  },
};
