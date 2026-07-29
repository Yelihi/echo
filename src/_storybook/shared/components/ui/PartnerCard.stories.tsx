import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { PartnerCard } from "@/shared/components/ui/PartnerCard";

const meta = {
  title: "shared/components/ui/PartnerCard",
  component: PartnerCard,
  globals: {
    backgrounds: { value: "session" },
  },
  args: {
    role: "BARISTA",
    children: "What can I get started for you today?",
  },
  decorators: [
    (Story) => (
      <div className="w-150 p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PartnerCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutRole: Story = {
  args: { role: undefined },
};

export const LongLine: Story = {
  args: {
    role: "RECEPTIONIST",
    children:
      "Good morning! Do you have a reservation with us, or would you like me to check availability for tonight?",
  },
};
