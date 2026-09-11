import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { ListFilter } from "lucide-react";
import { FilterSelect } from "@/shared/components/ui/FilterSelect";
import { historyStatusOptions } from "@/widgets/latest-sessions/models/history";

const meta = {
  title: "shared/components/ui/FilterSelect",
  component: FilterSelect,
  args: {
    label: "분석 상태",
    value: "all",
    options: historyStatusOptions,
    icon: ListFilter,
    onValueChange: () => {},
  },
  decorators: [
    (Story) => (
      <div className="p-8">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FilterSelect>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  render: function Interactive(args) {
    const [value, setValue] = useState(args.value);
    return <FilterSelect {...args} value={value} onValueChange={setValue} />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("combobox", { name: "분석 상태" }));
    await userEvent.click(
      within(canvasElement.ownerDocument.body).getByRole("option", { name: "분석 완료" }),
    );
    await expect(canvas.getByRole("combobox")).toHaveTextContent("분석 완료");
  },
};
export const Selected: Story = { args: { value: "partial" } };
export const Disabled: Story = { args: { disabled: true } };
