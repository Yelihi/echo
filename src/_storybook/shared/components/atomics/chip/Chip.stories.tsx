import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Check } from "lucide-react";

import { Chip } from "@/shared/components/atomics/chip/Chip";

const TONES = [
  "neutral",
  "accent",
  "roleplay",
  "memo",
  "positive",
  "warning",
  "negative",
  "outline",
] as const;

const meta = {
  title: "shared/components/atomics/chip/Chip",
  component: Chip,
  argTypes: {
    tone: { control: "select", options: TONES },
  },
  args: {
    tone: "neutral",
    children: "태그",
  },
  decorators: [
    (Story) => (
      <div className="p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Chip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Neutral: Story = {};

/** accent 톤은 활성 필라를 따라갑니다 — 툴바 Pillar 를 바꿔 확인하세요. */
export const Accent: Story = {
  args: { tone: "accent" },
};

export const Roleplay: Story = {
  args: { tone: "roleplay", children: "일상" },
};

export const Memo: Story = {
  args: { tone: "memo", children: "연설" },
};

export const WithIcon: Story = {
  args: {
    tone: "positive",
    children: (
      <>
        <Check />
        분석 완료
      </>
    ),
  },
};

export const AllTones: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-2">
      {TONES.map((tone) => (
        <Chip {...args} key={tone} tone={tone}>
          {tone}
        </Chip>
      ))}
    </div>
  ),
};
