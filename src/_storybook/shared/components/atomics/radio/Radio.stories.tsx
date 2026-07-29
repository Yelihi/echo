import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Radio, RadioGroup } from "@/shared/components/atomics/radio/Radio";

type RadioStoryArgs = {
  defaultValue: string;
  disabled: boolean;
};

const OPTIONS = [
  { value: "barista", label: "바리스타" },
  { value: "customer", label: "손님" },
  { value: "staff", label: "매장 직원" },
];

const meta = {
  title: "shared/components/atomics/radio/Radio",
  argTypes: {
    defaultValue: {
      control: "select",
      options: ["", ...OPTIONS.map((option) => option.value)],
    },
    disabled: {
      control: "boolean",
    },
  },
  args: {
    defaultValue: "",
    disabled: false,
  },
  decorators: [
    (Story) => (
      <div className="p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<RadioStoryArgs>;

export default meta;

type Story = StoryObj<RadioStoryArgs>;

/**
 * args 로 초기값을 바꿀 수 있도록 key 로 remount 합니다.
 * (props 를 state 로 복제해 effect 로 동기화하지 않습니다)
 */
function RadioDemo({ defaultValue, disabled }: RadioStoryArgs) {
  return (
    <RadioGroup key={defaultValue} defaultValue={defaultValue || undefined} disabled={disabled}>
      {OPTIONS.map((option) => (
        <label key={option.value} className="flex cursor-pointer items-center gap-2.5">
          <Radio value={option.value} />
          <span className="text-body-3 text-black-primary">{option.label}</span>
        </label>
      ))}
    </RadioGroup>
  );
}

export const Default: Story = {
  render: (args) => <RadioDemo {...args} />,
};

export const Checked: Story = {
  args: { defaultValue: "customer" },
  render: (args) => <RadioDemo {...args} />,
};

export const Disabled: Story = {
  args: { defaultValue: "barista", disabled: true },
  render: (args) => <RadioDemo {...args} />,
};

export const AllStates: Story = {
  render: () => (
    <div className="flex items-center gap-8">
      <RadioGroup className="flex gap-4">
        <Radio value="off" />
      </RadioGroup>
      <RadioGroup defaultValue="on" className="flex gap-4">
        <Radio value="on" />
      </RadioGroup>
      <RadioGroup disabled className="flex gap-4">
        <Radio value="disabled" />
      </RadioGroup>
    </div>
  ),
};
